const KIT_BASE = 'https://api.kit.com/v4';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email, firstName, tagIds, sequenceId, honeypot;
  try {
    const body = JSON.parse(event.body);
    email = body.email;
    firstName = body.firstName || '';
    tagIds = Array.isArray(body.tagIds) ? body.tagIds : [];
    sequenceId = body.sequenceId || null;
    // Anti-spam honeypot: add a hidden field named "website" to forms. Real users
    // leave it empty; bots fill every field. If it's filled, silently accept
    // (return 200 so the bot sees success) but do nothing.
    honeypot = body.website || '';
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (honeypot) {
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
      body: JSON.stringify({ email_address: email, first_name: firstName })
    });
    const subData = await subRes.json().catch(() => ({}));
    if (!subRes.ok) {
      console.error('Kit subscriber create failed:', subRes.status, JSON.stringify(subData).slice(0, 300));
      return { statusCode: 502, body: JSON.stringify({ error: 'Subscription service error' }) };
    }
    const subscriberId = subData?.subscriber?.id;

    // 2. Apply tags
    for (const tagId of tagIds) {
      await fetch(`${KIT_BASE}/tags/${tagId}/subscribers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email_address: email })
      });
    }

    // 3. Enrol in sequence
    if (sequenceId) {
      await fetch(`${KIT_BASE}/sequences/${sequenceId}/subscribers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email_address: email })
      });
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
