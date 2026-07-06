// InstantDM → keyword router
// InstantDM (instantdm.com) forwards every Instagram comment here by webhook.
// This function is the automation: it matches the keyword, posts the public
// comment reply, and sends the DM — copy lives in KEYWORDS below, so changing
// a reply is a code edit + deploy, no dashboard clicking.
//
// ENV VARS NEEDED (Netlify → Site Settings → Environment Variables):
//   INSTANTDM_API_KEY        — from InstantDM Settings → Integrations → API Keys
//   INSTANTDM_WEBHOOK_SECRET — from InstantDM Settings → Integrations → Webhook Configuration
//
// InstantDM side (one-time, in their dashboard):
//   Settings → Integrations → Webhook Configuration →
//   URL: https://feelfullyyou.com/.netlify/functions/instantdm-webhook
//   Events: comment

const crypto = require('crypto');

const API_URL = 'https://api.instantdm.com/api-webhook';

// Public reply is the same for every keyword (canon, 6 July 2026).
const PUBLIC_REPLY = 'Just sent it over, check your DMs 🤍';

// Keyword → DM copy. EXACT copy from the InstantDM handover doc (Notion,
// 395c7588d9ea8180bd31fdae97006e19). Multi-word phrases are matched before
// single words so TOUCH BASE never falls through to ONE TOUCH.
// Retired, never add: ALIVE, STEADY, TOUCH (misfires — RITUALS replaced it).
const KEYWORDS = [
  { match: 'TOUCH BASE', dm: 'Here is Touch Base: https://feelfullyyou.com/touch-base-anchor. Three minutes. Thumb to forefinger. Your body learns it is safe right now.' },
  { match: 'ONE TOUCH', dm: 'Here is One Touch: https://feelfullyyou.com/one-touch. Seven days, one practice a day, just you. Structure creates safety. Safety creates surrender.' },
  { match: 'DECK', dm: 'Here they are. The Intimacy and Communication Cards, 475 prompts across four decks, from £15: https://feelfullyyou.com/cards. Pull one tonight. One answer, from the heart.' },
  { match: 'CARDS', dm: 'Here is your free taster deck. Ten cards, start tonight: https://feelfullyyou.com/cards-free-taster. Enter your email and the deck opens straight away. Read one out loud. One answer, from the heart. Fifteen minutes is all it takes.' },
  { match: 'DISTANCE', dm: 'Here is The Unspoken Distance: https://feelfullyyou.com/the-unspoken-distance. Written for the man who feels her closing and does not know why. Start there.' },
  { match: 'RITUALS', dm: 'Here are the 10 Touch Rituals: https://feelfullyyou.com/10-touch-rituals. £7, instant access, start tonight. One ritual is all it takes to begin.' },
  { match: 'QUIET', dm: 'Here is When She Goes Quiet: https://feelfullyyou.com/when-she-goes-quiet. It explains what her silence is actually saying, and what reaches her when words do not.' },
  { match: 'BETWEEN', dm: 'Here is Between Touches: https://feelfullyyou.com/between-touches. What happens between you when nobody is touching is where the work starts.' },
  { match: 'INTENSIVE', dm: 'The intensives start with a fifteen-minute call. I will tell you honestly if I can help: https://tidycal.com/juliette2/the-beginning-clarity-call' },
  { match: 'BEGINNING', dm: 'Here is The Beginning: https://feelfullyyou.com/the-beginning. Eight private weeks, both of you, each with your own space inside it.' }
];

function findKeyword(text) {
  const t = (text || '').toUpperCase();
  for (const k of KEYWORDS) {
    // whole-word / whole-phrase match so "distancing" does not fire DISTANCE
    const re = new RegExp('(^|[^A-Z])' + k.match.replace(' ', '\\s+') + '($|[^A-Z])');
    if (re.test(t)) return k;
  }
  return null;
}

function verifySignature(rawBody, sigHeader, secret) {
  if (!sigHeader) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const given = sigHeader.replace(/^sha256=/, '');
  if (expected.length !== given.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}

async function instantdm(apiKey, body) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) console.error(`InstantDM API ${res.status}: ${text}`);
  return res.ok;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const apiKey = process.env.INSTANTDM_API_KEY;
  const secret = process.env.INSTANTDM_WEBHOOK_SECRET;
  if (!apiKey || !secret) {
    console.error('INSTANTDM_API_KEY or INSTANTDM_WEBHOOK_SECRET not set — webhook received but dormant');
    return { statusCode: 200, body: 'Not configured' };
  }

  if (!verifySignature(event.body, event.headers['x-webhook-signature'] || '', secret)) {
    console.error('Invalid InstantDM webhook signature');
    return { statusCode: 401, body: 'Invalid signature' };
  }

  let payload;
  try { payload = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const handled = [];
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const v = change.value || {};
      const text = v.text || '';
      const commentId = v.id || '';
      const fromUser = (v.from && v.from.username) || '';
      if (!commentId || !text) continue;
      // never reply to Juliette's own comments
      if (fromUser.toLowerCase() === 'juliettekaraman') continue;

      const kw = findKeyword(text);
      if (!kw) continue;

      // 1. private reply to the comment (Meta-compliant DM path)
      const dmOk = await instantdm(apiKey, {
        action: 'send_message',
        type: 'comment_reply',
        comment_id: commentId,
        message: { text: kw.dm }
      });
      // 2. public comment reply — only if the DM went out
      if (dmOk) {
        await instantdm(apiKey, { action: 'post_comment', comment_id: commentId, comment_text: PUBLIC_REPLY });
      }
      handled.push(`${kw.match}:${commentId}:${dmOk ? 'ok' : 'DM FAILED'}`);
      console.log(`Keyword ${kw.match} from @${fromUser} → ${dmOk ? 'replied' : 'DM FAILED'}`);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, handled }) };
};
