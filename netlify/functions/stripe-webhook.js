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
  // Length guard: timingSafeEqual throws on unequal-length buffers, so bail first.
  if (expected.length !== sig.length) return false;
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
  // SEQUENCE IDs REWIRED 6 July PM: Kit's original template sequences (2812532/33/34/91)
  // were deleted or repurposed during the paste-in. Nulls below = no sequence exists in
  // Kit yet for that product; fill in as Kiera creates them from the Paste Pack.
  'price_1Tlpu0CCw18geY15b8J3jlBW': {
    tagId: 20794257,   // "10touchrituals"
    sequenceId: 2818643,  // "10 Touch Rituals Welcome" (built 7 Jul, delivery email sends immediately)
    label: '10 Touch Rituals £7'
  },
  'price_1TlpvDCCw18geY15wlpzVg4f': {
    tagId: 20794225,   // "31 daily touch points"
    sequenceId: null,  // seq 2817543 is a PLACEHOLDER ("Write a compelling subject...") — wire when real emails pasted
    label: '31 Daily Touch Points £19 (tripwire)'
  },
  'price_1TiBhLCCw18geY15dLECqNFr': {
    tagId: 20794225,   // "31 daily touch points"
    sequenceId: null,  // seq 2817543 is a PLACEHOLDER — wire when real emails pasted
    label: '31 Daily Touch Points £27 (standalone)'
  },
  'price_1TghjICCw18geY15V4AkohbE': {
    tagId: 20794281,   // "touchpoint"
    sequenceId: 2812535,  // "Touch Point" — welcome (Telegram link) + live-session reminders + nurture, fixed 7 Jul
    label: 'Touch Point Membership £97/mo (grandfathered)'
  },
  // The CURRENT Touch Point price. Added 16 Jul 2026 — it was missing, so every
  // £197 buyer fell through to the generic "purchased" fallback instead of being
  // tagged touchpoint. Existing members stay on the £97 price above for life.
  'price_1TrYixCCw18geY15CL2uxb6v': {
    tagId: 20794281,   // "touchpoint"
    sequenceId: 2812535,  // "Touch Point"
    label: 'Touch Point Membership £197/mo'
  },
  'price_1TnxAqCCw18geY153w22a2Ye': {
    tagId: 20794292,   // "the unspoken distance"
    sequenceId: 2817577,  // "The Unspoken Distance"
    label: 'Unspoken Distance £97'
  },
  'price_1TnwwmCCw18geY15egD5h7Fr': {
    tagId: 20794295,   // "the communication reboot kit"
    sequenceId: 2826769,  // "Communication Reboot Kit — Welcome", wired 14 Jul
    label: 'Communication Reboot Kit £37'
  },
  'price_1TqqcmCCw18geY15FjLGqM2q': {
    tagId: 20794295,   // "the communication reboot kit"
    sequenceId: 2826769,  // "Communication Reboot Kit — Welcome", wired 14 Jul
    label: 'Communication Reboot Kit £17 (When She Goes Quiet tripwire)'
  },
  'price_1To2MZCCw18geY15DzT0iv5A': {
    tagId: 20794287,   // "essence day sept 26"
    sequenceId: null,  // no CONNECT sequence in Kit yet
    label: 'CONNECT With Essence £247'
  },
  'price_1Tpr13CCw18geY15W6ooICYF': {
    tagId: 20794312,   // "one touch"
    sequenceId: 2820368,  // "One Touch — Welcome" — published + live, confirmed 8 Jul
    label: 'One Touch £97'
  },
  // ─── THE BEGINNING ──────────────────────────────────────────────────────────
  'price_1Tp740CCw18geY15gg4z1oEg': {
    tagId: 20794305,   // "the beginning"
    sequenceId: 2825352,  // "The Beginning — Welcome" (booking links, wired 13 Jul)
    label: 'The Beginning £8,997 (full payment)'
  },
  'price_1Tp748CCw18geY15wQ4wP9CY': {
    tagId: 20794305,   // "the beginning"
    sequenceId: 2825352,  // "The Beginning — Welcome" (booking links, wired 13 Jul)
    label: 'The Beginning £4,499 x 2 (payment plan)'
  },
  // ─── PRACTITIONERS ──────────────────────────────────────────────────────────
  'price_1Tp3fMCCw18geY15GgRINCbd': {
    tagId: 20907215,   // "practitioners-app"
    sequenceId: 2817569,  // "Cards App access" — the practitioner access email
    label: 'Practitioners App Access £25'
  },
  // ─── PATTERN SESSION ────────────────────────────────────────────────────────
  'price_1TpnUaCCw18geY15x9owuBBk': {
    tagId: 20896797,   // "pattern-session-buyer"
    sequenceId: 2818645,  // "Pattern Session Confirmation" (built 7 Jul, booking email sends immediately)
    label: 'Relationship Pattern Session £597'
  },
  // ─── INTENSIVES + THE ROOM (Ivorey replacements, 6 July 2026) ───────────────
  'price_1TqA2jCCw18geY15gV5ALKWx': {
    tagId: 20913129,   // "womens-intensive-buyer"
    sequenceId: null,
    label: "Women's Intensive £2,000 (online)"
  },
  'price_1TqA2oCCw18geY15gUN8eDpy': {
    tagId: 20913129,   // "womens-intensive-buyer"
    sequenceId: null,
    label: "Women's Intensive £4,000 (in person)"
  },
  'price_1TqA2rCCw18geY15fixLVYeB': {
    tagId: 20913130,   // "couples-intensive-buyer"
    sequenceId: null,
    label: 'Couples Intensive £3,333 (online)'
  },
  'price_1TqA2xCCw18geY15vu3C8DOs': {
    tagId: 20913130,   // "couples-intensive-buyer"
    sequenceId: null,
    label: 'Couples Intensive £6,000 (in person)'
  },
  'price_1TqA31CCw18geY15LHopiNWx': {
    tagId: 20913131,   // "womens-six-week-buyer"
    sequenceId: 2825355,  // "Women's Six-Week — Welcome" (booking link, wired 13 Jul)
    label: "Women's 6-Week Intensive £4,497"
  },
  'price_1TqA34CCw18geY15O4rXtodc': {
    tagId: 20913132,   // "the-room-member"
    sequenceId: 2825351,  // "The Room — Welcome" (wired 13 Jul)
    label: 'The Room £3,000 (pay in full)'
  },
  'price_1TqA37CCw18geY15UVa15ctp': {
    tagId: 20913132,   // "the-room-member"
    sequenceId: 2825351,  // "The Room — Welcome" (wired 13 Jul)
    label: 'The Room £1,500 x 2 (payment plan — cancel sub after 2)'
  },
  'price_1TqA3BCCw18geY15myzAp0Xy': {
    tagId: 20913132,   // "the-room-member"
    sequenceId: 2825351,  // "The Room — Welcome" (wired 13 Jul)
    label: 'The Room £1,000 x 3 (payment plan — cancel sub after 3)'
  },
  'price_1TqAOtCCw18geY15eIBYrJnE': {
    tagId: 20913132,   // "the-room-member"
    sequenceId: 2825351,  // "The Room — Welcome" (wired 13 Jul)
    label: 'The Room: Held (VIP) £5,000 (pay in full)'
  },
  'price_1TqAOxCCw18geY157k8z790r': {
    tagId: 20913132,   // "the-room-member"
    sequenceId: 2825351,  // "The Room — Welcome" (wired 13 Jul)
    label: 'The Room: Held (VIP) £2,500 x 2 (payment plan — cancel sub after 2)'
  },
  // ─── SACRED NO + REPAIR KIT ─────────────────────────────────────────────────
  'price_1TqA3ECCw18geY15UMO40IWX': {
    tagId: 20913133,   // "sacred-no-buyer"
    sequenceId: null,
    label: 'The Sacred No £55'
  },
  'price_1TqA3HCCw18geY15tlkswswP': {
    tagId: 20913134,   // "repair-kit-buyer"
    sequenceId: 2820134,  // "Repair Kit — Welcome" (portal link + access word repair2026), wired 8 Jul
    label: 'Romantic Relationship Repair Kit £27'
  },
  // ─── CARDS DIGITAL ──────────────────────────────────────────────────────────
  'price_1TOxLhCCw18geY15bLrNioHw': {
    tagId: 20896673,   // "cards-trust-repair"
    sequenceId: 2817582,  // "Cards Buyer Welcome"
    label: 'Trust & Repair Cards £15'
  },
  'price_1TOJatCCw18geY15HbPQTtH7': {
    tagId: 20896674,   // "cards-one-deck"
    sequenceId: 2817582,  // "Cards Buyer Welcome"
    label: 'One Core Deck Cards £35'
  },
  'price_1TiBwtCCw18geY15OsJnUNMV': {
    tagId: 20896675,   // "cards-full-bundle"
    sequenceId: 2817582,  // "Cards Buyer Welcome"
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
  },
  'price_1Tq7jRCCw18geY155S5mNiMG': {
    tagId: 20907435,   // "cards-complete-set"
    sequenceId: null,
    label: 'Cards Complete the Set £45 (email offer, T&R owners)'
  },
  'price_1Tq7jUCCw18geY15Rgrwliu9': {
    tagId: 20907435,   // "cards-complete-set"
    sequenceId: null,
    label: 'Cards Complete the Set £25 (email offer, single deck owners)'
  },
  // ─── CARDS APP CHECKOUT (couplecards.netlify.app in-app purchases) ──────────
  'price_1TFAH4CCw18geY15TMvJo2Vv': {
    tagId: 20911186,   // "cards-touch-languages"
    sequenceId: 2817582,  // "Cards Buyer Welcome" — the live price the app's STRIPE_TOUCH_LANGUAGES_PRICE_ID points at, wired 14 Jul
    label: 'Touch Languages deck £35 (app, live price)'
  },
  'price_1TOJbnCCw18geY15CjoyXpdr': {
    tagId: 20911186,   // "cards-touch-languages"
    sequenceId: 2817582,  // "Cards Buyer Welcome"
    label: 'Touch Languages deck £35 (app, old price)'
  },
  'price_1TOJaDCCw18geY15CKuWkE1z': {
    tagId: 20896674,   // "cards-one-deck"
    sequenceId: 2817582,  // "Cards Buyer Welcome"
    label: 'Family & Friends deck £35 (app)'
  },
  'price_1TOxGfCCw18geY15mESPCeFC': {
    tagId: 20896675,   // "cards-full-bundle"
    sequenceId: 2817582,  // "Cards Buyer Welcome"
    label: 'Cards Full Set £75 (app, old price still active)'
  },
  // ─── PHYSICAL CARDS (shipped) ───────────────────────────────────────────────
  'price_1Tq9COCCw18geY15l19M8pis': {
    tagId: 20912672,   // "physical-cards-buyer"
    sequenceId: null,
    label: 'Physical Cards single deck £47'
  },
  'price_1Tq9CYCCw18geY15BQISoldJ': {
    tagId: 20912672,   // "physical-cards-buyer"
    sequenceId: null,
    label: 'Physical Cards Touch Languages £47'
  },
  'price_1Tq9CcCCw18geY15kDbDH8fv': {
    tagId: 20912672,   // "physical-cards-buyer"
    sequenceId: null,
    label: 'Physical Cards 2-deck bundle £77'
  },
  'price_1Tq9CfCCw18geY151w171G6I': {
    tagId: 20912672,   // "physical-cards-buyer"
    sequenceId: null,
    label: 'Physical Cards all three £111'
  },
  // ─── CANDLES (shipped) ──────────────────────────────────────────────────────
  'price_1Tq9CmCCw18geY1567KBbH0X': {
    tagId: 20912673,   // "candles-buyer"
    sequenceId: null,
    label: 'Scrumptious Candle £35'
  },
  'price_1Tq9CtCCw18geY15uN6irdOk': {
    tagId: 20912673,   // "candles-buyer"
    sequenceId: null,
    label: 'Pleasure Candle £35'
  },
  // ─── ADDED 16 Jul 2026 — live prices that existed in Stripe but were missing
  // from this map, so their buyers were landing on the generic "purchased" tag.
  'price_1Tqs53CCw18geY15u8MDw3OW': {
    tagId: 20913133,   // "sacred-no-buyer"
    sequenceId: null,
    label: 'The Sacred No £27'
  },
  'price_1TqqjCCCw18geY15dCXrlEjD': {
    tagId: 20794225,   // "31 daily touch points"
    sequenceId: null,
    label: '31 Daily Touch Points £31 (full price)'
  },
  'price_1TpppKCCw18geY15ZS2JxY4R': {
    tagId: 20895627,   // "confidence-magazine-reader"
    sequenceId: null,
    label: 'Free — Confidence Magazine readers'
  },
  // Older Room prices still active in Stripe alongside the current set above.
  'price_1TglgLCCw18geY15NHxSd4BM': {
    tagId: 20913132,   // "the-room-member"
    sequenceId: 2825351,
    label: 'The Room £1,500 x 2 (legacy price)'
  },
  'price_1TglgLCCw18geY15kXKqpkt1': {
    tagId: 20913132,
    sequenceId: 2825351,
    label: 'The Room £1,500 x 2 (legacy price)'
  },
  'price_1Tglg9CCw18geY151y8VmYyv': {
    tagId: 20913132,
    sequenceId: 2825351,
    label: 'The Room £1,000 x 3 (legacy price)'
  },
  'price_1Tglg9CCw18geY15UroD3o1s': {
    tagId: 20913132,
    sequenceId: 2825351,
    label: 'The Room £1,500 x 2 (legacy price)'
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

  // Netlify may base64-encode the request body. The Stripe signature is computed
  // over the exact raw bytes, so decode first or the HMAC will never match.
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');

  const sigHeader = event.headers['stripe-signature'] || '';
  if (!verifyStripeSignature(rawBody, sigHeader, webhookSecret)) {
    console.error('Invalid Stripe signature');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // ─── SUBSCRIPTIONS (added 16 Jul 2026) ──────────────────────────────────────
  // Subscription sign-ups and renewals do NOT arrive as checkout.session.completed
  // with readable price metadata, so members were never getting tagged — that is why
  // active Touch Point subscribers sat with no `touchpoint` tag. invoice.paid carries
  // BOTH the customer email and the price, so we handle it here.
  // Tag on every invoice (Kit tagging is idempotent), but only enrol in the welcome
  // sequence on the FIRST invoice — never re-send the welcome on a monthly renewal.
  //
  // NOTE: `invoice.paid` must be enabled on the webhook endpoint in the Stripe
  // dashboard, otherwise Stripe never delivers it here.
  if (stripeEvent.type === 'invoice.paid') {
    const inv = stripeEvent.data?.object;
    const invEmail = inv?.customer_email || '';
    const invFirstName = (inv?.customer_name || '').split(' ')[0];
    const line = inv?.lines?.data?.[0];
    // Stripe moved the price location between API versions — check both shapes.
    const invPriceId = line?.price?.id || line?.pricing?.price_details?.price || '';
    const invProduct = PRODUCT_MAP[invPriceId];

    if (!invEmail) {
      console.error('No customer_email on invoice — skipped');
      return { statusCode: 200, body: 'No email on invoice — skipped' };
    }

    const isFirstInvoice = inv?.billing_reason === 'subscription_create';

    if (!invProduct) {
      console.log(`Unknown subscription price "${invPriceId}" for ${invEmail} — tagging as purchased`);
      await addToKit(invEmail, invFirstName, 20794289, null, apiSecret); // "purchased"
      return { statusCode: 200, body: JSON.stringify({ ok: true, note: 'unknown subscription price, tagged as purchased' }) };
    }

    console.log(`${invProduct.label} invoice paid (${inv?.billing_reason}) — tagging ${invEmail}`);
    await addToKit(invEmail, invFirstName, invProduct.tagId, isFirstInvoice ? invProduct.sequenceId : null, apiSecret);
    return { statusCode: 200, body: JSON.stringify({ ok: true, product: invProduct.label, first_invoice: isFirstInvoice }) };
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

  // Fallback for cards-app checkouts (couplecards.netlify.app): those sessions carry
  // no price_id metadata, so match on the amount paid. Only unambiguous cards amounts.
  // NOTE: if a future non-cards product shares one of these amounts, give its payment
  // link metadata.price_id and PRODUCT_MAP wins before this fallback is reached.
  const AMOUNT_MAP = {
    1500: { tagId: 20896673, label: 'Cards £15 by amount (Trust & Repair)' },
    3500: { tagId: 20896674, label: 'Cards £35 by amount (single deck)' },
    5500: { tagId: 20896675, label: 'Cards £55 by amount (full set)' },
    7500: { tagId: 20896675, label: 'Cards £75 by amount (old app full set)' }
  };
  const amountMatch = session?.currency === 'gbp' ? AMOUNT_MAP[session?.amount_total] : null;
  if (amountMatch) {
    console.log(`${amountMatch.label} — adding ${email} to Kit`);
    await addToKit(email, firstName, amountMatch.tagId, null, apiSecret);
    return { statusCode: 200, body: JSON.stringify({ ok: true, product: amountMatch.label }) };
  }

  // Fallback: tag as unknown purchaser so nobody is lost
  console.log(`Unknown price_id "${priceId}" for ${email} — tagging as purchased`);
  await addToKit(email, firstName, 20794289, null, apiSecret); // "purchased" tag
  return { statusCode: 200, body: JSON.stringify({ ok: true, note: 'unknown product, tagged as purchased' }) };
};
