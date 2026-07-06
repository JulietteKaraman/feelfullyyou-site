// Stripe → Kit webhook handler
// Fires when a Stripe payment completes → tags subscriber in Kit → sequence starts
//
// ENV VARS NEEDED (Netlify → Site Settings → Environment Variables):
//   KIT_API_KEY           — Kit v4 API key (same one subscribe.js uses)
//   STRIPE_WEBHOOK_SECRET — from Stripe → Developers → Webhooks (starts with whsec_)

const crypto = require('crypto');

function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});
  const timestamp = parts['t'];
  const sig = parts['v1'];
  if (!timestamp || !sig) return false;
  // Reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

const KIT_V4 = 'https://api.kit.com/v4';

// ─── PRODUCT MAP ─────────────────────────────────────────────────────────────
// Map Stripe price_id → Kit tag ID + sequence ID
//
// IMPORTANT — each Stripe payment link also needs metadata set:
//   Stripe → Payment Links → click link → Metadata → add key: price_id, value: <price_id below>
//
// One Touch: product exists (prod_TMpi5kaSnhGD1d) but has NO price yet.
//   → Create a £97 price in Stripe → Products → One Touch, then add it here.
const PRODUCT_MAP = {
  'price_1Tlpu0CCw18geY15b8J3jlBW': {
    tagId: 20794257,   // "10touchrituals"
    sequenceId: 2812534,
    label: '10 Touch Rituals £7'
  },
  'price_1TlpvDCCw18geY15wlpzVg4f': {
    tagId: 20794225,   // "31 daily touch points"
    sequenceId: 2812534,
    label: '31 Daily Touch Points £19 (tripwire)'
  },
  'price_1TiBhLCCw18geY15dLECqNFr': {
    tagId: 20794225,   // "31 daily touch points"
    sequenceId: 2812534,
    label: '31 Daily Touch Points £27 (standalone)'
  },
  'price_1TghjICCw18geY15V4AkohbE': {
    tagId: 20794281,   // "touchpoint"
    sequenceId: 2812591,
    label: 'Touch Point Membership £97/mo'
  },
  'price_1TnxAqCCw18geY153w22a2Ye': {
    tagId: 20794292,   // "the unspoken distance"
    sequenceId: 2812534,
    label: 'Unspoken Distance £97'
  },
  'price_1TnwwmCCw18geY15egD5h7Fr': {
    tagId: 20794295,   // "the communication reboot kit"
    sequenceId: 2812534,
    label: 'Communication Reboot Kit £37'
  },
  'price_1To2MZCCw18geY15DzT0iv5A': {
    tagId: 20794287,   // "essence day sept 26"
    sequenceId: 2812534,
    label: 'CONNECT With Essence £247'
  },
  'price_1Tpr13CCw18geY15W6ooICYF': {
    tagId: 20794312,   // "one touch"
    sequenceId: 2812534,
    label: 'One Touch £97'
  },
  // ─── THE BEGINNING ──────────────────────────────────────────────────────────
  'price_1Tp740CCw18geY15gg4z1oEg': {
    tagId: 20794305,   // "the beginning"
    sequenceId: null,
    label: 'The Beginning £8,997 (full payment)'
  },
  'price_1Tp748CCw18geY15wQ4wP9CY': {
    tagId: 20794305,   // "the beginning"
    sequenceId: null,
    label: 'The Beginning £4,499 x 2 (payment plan)'
  },
  // ─── PRACTITIONERS ──────────────────────────────────────────────────────────
  'price_1Tp3fMCCw18geY15GgRINCbd': {
    tagId: 20907215,   // "practitioners-app"
    sequenceId: null,
    label: 'Practitioners App Access £25'
  },
  // ─── PATTERN SESSION ────────────────────────────────────────────────────────
  'price_1TpnUaCCw18geY15x9owuBBk': {
    tagId: 20896797,   // "pattern-session-buyer"
    sequenceId: null,
    label: 'Relationship Pattern Session £597'
  },
  // ─── CARDS DIGITAL ──────────────────────────────────────────────────────────
  // sequenceId: null until Kiera creates "Cards Buyer Welcome" sequence in Kit
  'price_1TOxLhCCw18geY15bLrNioHw': {
    tagId: 20896673,   // "cards-trust-repair"
    sequenceId: null,
    label: 'Trust & Repair Cards £15'
  },
  'price_1TOJatCCw18geY15HbPQTtH7': {
    tagId: 20896674,   // "cards-one-deck"
    sequenceId: null,
    label: 'One Core Deck Cards £35'
  },
  'price_1TiBwtCCw18geY15OsJnUNMV': {
    tagId: 20896675,   // "cards-full-bundle"
    sequenceId: null,
    label: 'Cards Full Bundle £55'
  },
  'price_1Tq7PiCCw18geY15kgJMkb6E': {
    tagId: 20907435,   // "cards-complete-set"
    sequenceId: null,
    label: 'Cards Complete the Set £40 (T&R owners)'
  },
  'price_1Tq7PpCCw18geY15ojeYpePd': {
    tagId: 20907435,   // "cards-complete-set"
    sequenceId: null,
    label: 'Cards Complete the Set £20 (single deck owners)'
  }
};

async function addToKit(email, firstName, tagId, sequenceId, apiKey) {
  const headers = {
    'X-Kit-Api-Key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // 1. Ensure subscriber exists
  await fetch(`${KIT_V4}/subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email_address: email, first_name: firstName || '' })
  });

  // 2. Apply product tag
  if (tagId) {
    await fetch(`${KIT_V4}/tags/${tagId}/subscribers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email_address: email })
    });
  }

  // 3. Enrol in welcome sequence
  if (sequenceId) {
    await fetch(`${KIT_V4}/sequences/${sequenceId}/subscribers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email_address: email })
    });
  }
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiSecret = process.env.KIT_API_KEY || process.env.KIT_API_SECRET;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!apiSecret || !webhookSecret) {
    console.error('KIT_API_KEY or STRIPE_WEBHOOK_SECRET env var not set');
    return { statusCode: 500, body: 'Server not configured' };
  }

  const sigHeader = event.headers['stripe-signature'] || '';
  if (!verifyStripeSignature(event.body, sigHeader, webhookSecret)) {
    console.error('Invalid Stripe signature');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Only act on completed checkouts
  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: 'Event type ignored' };
  }

  const session = stripeEvent.data?.object;
  const email = session?.customer_details?.email || '';
  const firstName = (session?.customer_details?.name || '').split(' ')[0];

  if (!email) {
    console.error('No email in Stripe webhook payload');
    return { statusCode: 200, body: 'No email found — skipped' };
  }

  // Price ID comes through in metadata (set this in each Stripe payment link)
  const priceId = session?.metadata?.price_id || '';
  const product = PRODUCT_MAP[priceId];

  if (product) {
    console.log(`${product.label} purchase — adding ${email} to Kit`);
    await addToKit(email, firstName, product.tagId, product.sequenceId, apiSecret);
    return { statusCode: 200, body: JSON.stringify({ ok: true, product: product.label }) };
  }

  // Fallback: tag as unknown purchaser so nobody is lost
  console.log(`Unknown price_id "${priceId}" for ${email} — tagging as purchased`);
  await addToKit(email, firstName, 20794289, null, apiSecret); // "purchased" tag
  return { statusCode: 200, body: JSON.stringify({ ok: true, note: 'unknown product, tagged as purchased' }) };
};
