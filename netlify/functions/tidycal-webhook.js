// TidyCal → Kit webhook handler
// Fires when someone books a call → tags them in Kit → reminder sequence starts
//
// ENV VARS NEEDED (Netlify → Site Settings → Environment Variables):
//   KIT_API_KEY — Kit v4 API key (same one subscribe.js uses)
//
// HOW TO SET UP IN TIDYCAL:
//   TidyCal → Settings → Webhooks → Add webhook
//   URL: https://feelfullyyou.com/.netlify/functions/tidycal-webhook
//   Events: booking.created

const KIT_V4 = 'https://api.kit.com/v4';

// ─── BOOKING TYPE MAP ─────────────────────────────────────────────────────────
// Map TidyCal booking_type name → Kit tag ID + sequence ID
// The "name" here must match exactly what your TidyCal booking type is called.
const BOOKING_MAP = {
  // Pattern Session (booked after £597 Stripe payment)
  'The Pattern Session': {
    tagId: 20896797,      // "pattern-session-buyer"
    sequenceId: null,
    label: 'Pattern Session booked'
  },
  // In Touch Taster Audit (15-min free call)
  'In Touch Taster Audit': {
    tagId: null,          // add an "audit-booked" tag if you want — or leave null
    sequenceId: 2812532,  // Newsletter Intro for now — replace with a call-prep sequence
    label: 'AUDIT call booked'
  },
  // Intensive consult / discovery call
  'Intensive Consult': {
    tagId: 20794261,      // "6 week intensive"
    sequenceId: 2812532,
    label: 'Intensive consult booked'
  },
  // VIP Day
  'VIP Day': {
    tagId: 20794294,      // "at/dt vip day"
    sequenceId: 2812532,
    label: 'VIP Day booked'
  },
  // The Beginning (couples)
  'The Beginning': {
    tagId: 20794243,      // "beginning 1"
    sequenceId: 2812532,
    label: 'The Beginning booked'
  }
};

async function addToKit(email, firstName, tagId, sequenceId, apiKey) {
  const headers = {
    'X-Kit-Api-Key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Ensure subscriber exists
  await fetch(`${KIT_V4}/subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email_address: email, first_name: firstName || '' })
  });

  if (tagId) {
    await fetch(`${KIT_V4}/tags/${tagId}/subscribers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email_address: email })
    });
  }

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

  // ─── Shared-secret gate (TidyCal has no signed webhooks) ─────────────────────
  // FAIL-SAFE: only enforced once TIDYCAL_TOKEN is set in Netlify env. Until then
  // this endpoint stays open (so bookings never silently break), but it logs a
  // warning. TO SECURE: set TIDYCAL_TOKEN in Netlify → Site Settings → Environment
  // Variables, then set the TidyCal webhook URL to end with ?token=<that value>.
  const requiredToken = process.env.TIDYCAL_TOKEN;
  if (requiredToken) {
    const given = (event.queryStringParameters && event.queryStringParameters.token) || '';
    if (given !== requiredToken) {
      console.error('TidyCal webhook: missing/invalid token — rejected');
      return { statusCode: 401, body: 'Invalid token' };
    }
  } else {
    console.warn('TIDYCAL_TOKEN not set — webhook is UNAUTHENTICATED. Set it in Netlify to secure this endpoint.');
  }

  const apiSecret = process.env.KIT_API_KEY || process.env.KIT_API_SECRET;
  if (!apiSecret) {
    console.error('KIT_API_KEY env var not set');
    return { statusCode: 500, body: 'Server not configured' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // TidyCal webhook payload shape: { booking: { contact: { email, name }, booking_type: { name } } }
  const booking = payload?.booking || payload;
  const email = booking?.contact?.email || booking?.email || '';
  const fullName = booking?.contact?.name || booking?.name || '';
  const firstName = fullName.split(' ')[0];
  const bookingTypeName = booking?.booking_type?.name || booking?.booking_type || '';

  if (!email) {
    console.error('No email in TidyCal webhook:', JSON.stringify(payload).slice(0, 300));
    return { statusCode: 200, body: 'No email found — skipped' };
  }

  const mapping = BOOKING_MAP[bookingTypeName];

  if (mapping) {
    console.log(`${mapping.label} — adding ${email} to Kit`);
    await addToKit(email, firstName, mapping.tagId, mapping.sequenceId, apiSecret);
    return { statusCode: 200, body: JSON.stringify({ ok: true, booking: mapping.label }) };
  }

  // Fallback: unknown booking type — still capture them
  console.log(`Unknown booking type "${bookingTypeName}" for ${email} — adding to Kit with no tag`);
  await addToKit(email, firstName, null, 2812532, apiSecret);
  return { statusCode: 200, body: JSON.stringify({ ok: true, note: `unknown booking type: ${bookingTypeName}` }) };
};
