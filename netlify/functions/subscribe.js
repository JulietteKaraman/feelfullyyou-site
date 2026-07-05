const KIT_BASE = 'https://api.kit.com/v4';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email, firstName, tagIds, sequenceId;
  try {
    const body = JSON.parse(event.body);
    email = body.email;
    firstName = body.firstName || '';
    tagIds = body.tagIds || [];
    sequenceId = body.sequenceId || null;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
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
    const subData = await subRes.json();
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
