// Stripe → Kit webhook handler
// Fires when a Stripe payment completes → tags subscriber in Kit → sequence starts
//
// ENV VARS NEEDED (Netlify → Site Settings → Environment Variables):
//   KIT_API_SECRET        — your Kit API secret
//   STRIPE_WEBHOOK_SECRET — from Stripe → Developers → Webhooks (starts with whsec_)

const KIT_V3 = 'https://api.convertkit.com/v3';

// ─── PRODUCT MAP ─────────────────────────────────────────────────────────────
// Map Stripe price_id → Kit tag ID + sequence ID
// HOW TO FIND YOUR STRIPE PRICE IDs:
//   Stripe dashboard → Products → click product → copy "Price ID" (starts with price_)
// Then replace the placeholder keys below with your real price IDs.
const PRODUCT_MAP = {
  'REPLACE_price_10touchrituals': {
    tagId: 20794257,   // "10touchrituals"
    sequenceId: 2812534,
    label: '10 Touch Rituals £7'
  },
  'REPLACE_price_31touchpoints': {
    tagId: 20794225,   // "31 daily touch points"
    sequenceId: 2812534,
    label: '31 Daily Touch Points £19'
  },
  'REPLACE_price_touchpoint': {
    tagId: 20794281,   // "touchpoint"
    sequenceId: 2812591,
    label: 'Touch Point Membership £97/mo'
  },
  'REPLACE_price_distance': {
    tagId: 20794292,   // "the unspoken distance"
    sequenceId: 2812534,
    label: 'Unspoken Distance £97'
  },
  'REPLACE_price_crk': {
    tagId: 20794295,   // "the communication reboot kit"
    sequenceId: 2812534,
    label: 'Communication Reboot Kit £37'
  },
  'REPLACE_price_connect': {
    tagId: 20794287,   // "essence day sept 26"
    sequenceId: 2812534,
    label: 'CONNECT With Essence £247'
  },
  'REPLACE_price_onetouch': {
    tagId: 20794312,   // "one touch"
    sequenceId: 2812534,
    label: 'One Touch £97'
  }
};

async function addToKit(email, firstName, tagId, sequenceId, apiSecret) {
  // 1. Ensure subscriber exists
  await fetch(`${KIT_V3}/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_secret: apiSecret, email, first_name: firstName || '' })
  });

  // 2. Apply product tag
  if (tagId) {
    await fetch(`${KIT_V3}/tags/${tagId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_secret: apiSecret, email })
    });
  }

  // 3. Enrol in welcome sequence
  if (sequenceId) {
    await fetch(`${KIT_V3}/sequences/${sequenceId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_secret: apiSecret, email, first_name: firstName || '' })
    });
  }
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiSecret = process.env.KIT_API_SECRET;
  if (!apiSecret) {
    console.error('KIT_API_SECRET env var not set');
    return { statusCode: 500, body: 'Server not configured' };
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
