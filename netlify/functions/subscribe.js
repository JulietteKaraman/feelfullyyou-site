const KIT_BASE = 'https://api.kit.com/v4';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Anti-bot: only accept signups that actually originate from our own site.
  // List-bombing scripts POST straight at this endpoint with no matching
  // Origin/Referer, so we reject anything that isn't feelfullyyou.com
  // (or a Netlify preview deploy). Browsers always send Origin on a POST.
  const h = event.headers || {};
  const origin = h.origin || h.Origin || '';
  const referer = h.referer || h.Referer || '';
  const hostOk = (u) => {
    try {
      const host = new URL(u).hostname;
      return host === 'feelfullyyou.com' || host.endsWith('.feelfullyyou.com') || host.endsWith('.netlify.app');
    } catch { return false; }
  };
  if (!hostOk(origin) && !hostOk(referer)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  let email, firstName, tagIds, sequenceId, sequenceIds, honeypot, fields;
  try {
    const body = JSON.parse(event.body);
    email = body.email;
    firstName = body.firstName || '';
    tagIds = Array.isArray(body.tagIds) ? body.tagIds : [];
    sequenceId = body.sequenceId || null;
    sequenceIds = Array.isArray(body.sequenceIds) ? body.sequenceIds : (sequenceId ? [sequenceId] : []);
    fields = (body.fields && typeof body.fields === 'object') ? body.fields : null;
    // Anti-spam honeypot: add a hidden field named "website" to forms. Real users
    // leave it empty; bots fill every field. If it's filled, silently accept
    // (return 200 so the bot sees success) but do nothing.
    // Accept either field name — "website" for the older forms already using it,
    // "hp_field" for forms (like the quiz) moved to a less autofill-prone name.
    honeypot = body.website || body.hp_field || '';
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (honeypot) {
    // Logged so we can actually see how often this fires — if it's catching real
    // users (password-manager/autofill engines sometimes fill hidden fields named
    // things like "website" despite autocomplete="off"), that shows up here instead
    // of silently vanishing as an untraceable gap between GA's optin event and Kit.
    console.warn('Honeypot triggered, no subscriber created:', email || '(no email in body)');
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Not configured' }) };
  }

  const headers = {
    'X-Kit-Api-Key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    // 1. Create/update subscriber
    const subRes = await fetch(`${KIT_BASE}/subscribers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(Object.assign({ email_address: email, first_name: firstName }, fields ? { fields } : {}))
    });
    const subData = await subRes.json().catch(() => ({}));
    if (!subRes.ok) {
      console.error('Kit subscriber create failed:', subRes.status, JSON.stringify(subData).slice(0, 300));
      return { statusCode: 502, body: JSON.stringify({ error: 'Subscription service error' }) };
    }
    const subscriberId = subData?.subscriber?.id;

    // 1b. Lead Stage (CRM field, id 1314740, key lead_stage: Lead -> Engaged -> Warm -> Buyer).
    // A free opt-in is a real signal of warmth, not nothing — added 9 Aug 2026, Juliette:
    // "these are all probably warm leads at one point." Bump blank/Lead subscribers up to
    // Engaged. NEVER downgrade — a subscriber already at Warm or Buyer who happens to grab a
    // freebie later stays exactly where they are; this only ever moves someone forward.
    if (subscriberId) {
      try {
        const currentStage = subData?.subscriber?.fields?.lead_stage;
        if (!currentStage || currentStage === 'Lead') {
          const stageRes = await fetch(`${KIT_BASE}/subscribers/${subscriberId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ fields: { lead_stage: 'Engaged' } })
          });
          if (!stageRes.ok) {
            console.error('Kit lead_stage bump failed:', subscriberId, email, stageRes.status);
          }
        }
      } catch (stageErr) {
        // Never let a CRM-field hiccup break the actual signup — log and continue.
        console.error('Kit lead_stage bump error:', email, stageErr);
      }
    }

    // 2. Apply tags. Subscriber already exists at this point (step 1 succeeded) —
    // a failure here means they're a real Kit contact but missing their pattern
    // tag, which is a different, quieter failure than "never became a subscriber":
    // it means their personalised report email never fires. Log it so it's
    // diagnosable instead of silently swallowed.
    for (const tagId of tagIds) {
      const tagRes = await fetch(`${KIT_BASE}/tags/${tagId}/subscribers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email_address: email })
      });
      if (!tagRes.ok) {
        console.error('Kit tag apply failed:', tagId, email, tagRes.status);
      }
    }

    // 3. Enrol in sequence(s) — same reasoning: log failures instead of dropping them.
    for (const sid of sequenceIds) {
      if (!sid) continue;
      const seqRes = await fetch(`${KIT_BASE}/sequences/${sid}/subscribers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email_address: email })
      });
      if (!seqRes.ok) {
        console.error('Kit sequence enrol failed:', sid, email, seqRes.status);
      }
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, subscriberId })
    };
  } catch (err) {
    console.error('Subscribe error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
