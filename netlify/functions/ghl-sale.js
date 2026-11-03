// GHL sale → Kit tag + app access. specs/ghl-sale-connection.md.
// Miles's funnels sell the bites as order bumps in GHL, paid as one total, so
// those sales never pass through the separate Stripe links stripe-webhook.js knows.
// GHL calls this after a sale with the buyer's email and what they bought.
//
// ENV: GHL_SALE_KEY (private, GHL sends it as the x-ghl-key header), plus the same
// KIT_API_KEY, SUPABASE_* and TELEGRAM_* that stripe-webhook.js already uses.

const crypto = require('crypto');
const { addToKit, grantPracticeAppEntitlement } = require('./stripe-webhook');

const norm = (s) => String(s || '').toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

// match: words that identify the product in GHL's name for it.
// sequenceId: welcome emails. Left off until Juliette has approved them for funnel buyers.
const PRODUCTS = [
  { label: '31 Touch Points', match: ['31 touch points', '31 daily touch points'], tagId: 20794225, sequenceId: 2817543, extraSequenceIds: [2912029], deckType: '31-touch-points' },
  { label: '31 Days Closer', match: ['31 days closer'], tagId: 23849459 },
  { label: 'Trust & Repair', match: ['trust repair', 'trust and repair'], tagId: 23874704 },
  { label: 'The Three Answers', match: ['three answers'], tagId: 25334941 },
  { label: 'The Fifteen Minutes After', match: ['fifteen minutes after', '15 minutes after', '15 minutes afterwards'], tagId: 25334942 },
  { label: 'The Trace', match: ['the trace', 'trace ritual', 'trace practice'] },
  { label: 'The 45-Minute Connection Ritual', match: ['45 minute', 'connection ritual'] },
  { label: 'When She Stops Reaching', match: ['when she stops reaching'] },
  { label: 'The Full Stop', match: ['the full stop', 'full stop'] },
  { label: 'The Approach Ritual, Both Ways', match: ['approach ritual', 'approach both ways'] },
];

function findProduct(name) {
  const n = norm(name);
  return PRODUCTS.find((p) => p.match.some((m) => n.includes(m)));
}

function readEmail(b) {
  const c = b.customData || {};
  const e = b.email || c.email || (b.contact && b.contact.email) || (b.order && b.order.customer && b.order.customer.email);
  const v = String(e || '').trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? v : '';
}

function readFirstName(b) {
  const c = b.customData || {};
  return b.first_name || b.firstName || c.first_name || (b.contact && (b.contact.first_name || b.contact.firstName)) || '';
}

function readProducts(b) {
  const c = b.customData || {};
  const raw = b.products || c.products || b.product || c.product || b.product_name || c.product_name;
  let names = [];
  if (Array.isArray(raw)) names = raw.map((x) => (typeof x === 'string' ? x : x && (x.name || x.title || x.product_name)));
  else if (typeof raw === 'string') names = raw.split(/[,;\n]+/);
  const items = (b.order && (b.order.line_items || b.order.items)) || b.line_items || b.items;
  if (Array.isArray(items)) names = names.concat(items.map((x) => x && (x.title || x.name || x.product_name)));
  return [...new Set(names.map((x) => String(x || '').trim()).filter(Boolean))];
}

async function tell(text) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (err) {
    console.error('ghl-sale: could not send Telegram', err);
  }
}

function keyOk(given) {
  const want = process.env.GHL_SALE_KEY;
  if (!want || !given) return false;
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(want).digest();
  return crypto.timingSafeEqual(a, b);
}

const reply = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return reply(405, { ok: false, error: 'POST only' });
  const h = event.headers || {};
  if (!keyOk(h['x-ghl-key'] || h['X-Ghl-Key'] || h['X-GHL-Key'])) return reply(401, { ok: false, error: 'bad key' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return reply(400, { ok: false, error: 'not JSON' });
  }

  const email = readEmail(body);
  const names = readProducts(body);
  const known = [];
  const unknown = [];
  for (const n of names) {
    const p = findProduct(n);
    if (p) { if (!known.includes(p)) known.push(p); } else unknown.push(n);
  }
  const plan = {
    email,
    matched: known.map((p) => ({ product: p.label, tag: p.tagId || null, welcomeEmails: !!p.sequenceId, appAccess: p.deckType || null })),
    unknown,
  };

  if (body.test === true) return reply(200, { ok: true, test: true, ...plan });

  if (!email) {
    await tell(`🚨 GHL SALE WITH NO EMAIL\nProducts: ${names.join(', ') || 'none sent'}\nNobody could be tagged or given access.`);
    return reply(422, { ok: false, error: 'no valid email', ...plan });
  }

  const apiKey = process.env.KIT_API_KEY || process.env.KIT_API_SECRET;
  const firstName = readFirstName(body);
  const orderRef = `ghl:${body.order_id || (body.order && body.order.id) || body.id || Date.now()}`;
  const failed = [];
  // Always at least the Buyer tag, even if no product name was recognised.
  for (const p of known.length ? known : [{ label: 'unrecognised' }]) {
    try {
      await addToKit(email, firstName, p.tagId, p.sequenceId, apiKey, '', p.extraSequenceIds);
    } catch (err) {
      console.error(`ghl-sale: Kit failed for ${p.label}`, err);
      failed.push(p.label);
    }
    // Reports its own failures to Telegram, and never throws.
    if (p.deckType) await grantPracticeAppEntitlement(email, p.deckType, orderRef);
  }

  const lines = [`GHL sale · ${email}`, known.map((p) => p.label).join(', ') || 'No known product'];
  if (unknown.length) lines.unshift('⚠️ PRODUCT NOT RECOGNISED'), lines.push(`Not recognised: ${unknown.join(', ')}`);
  if (failed.length) lines.unshift('🚨 KIT FAILED'), lines.push(`Check Kit for: ${failed.join(', ')}`);
  await tell(lines.join('\n'));

  return reply(200, { ok: true, ...plan, failed });
};
