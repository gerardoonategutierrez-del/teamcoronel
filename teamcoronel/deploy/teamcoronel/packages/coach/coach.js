exports.handler = async function(event) {
  if(event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if(event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  var headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if(!apiKey) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: { message: 'API key no configurada' } })
    };
  }

  var body;
  try { body = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, headers: headers, body: JSON.stringify({ error: { message: 'JSON inválido' } }) }; }

  // Build messages — support text prompt and optional PDF
  var messages;
  if(body.pdf_base64) {
    messages = [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: body.pdf_base64
          }
        },
        { type: 'text', text: body.prompt }
      ]
    }];
  } else {
    messages = [{ role: 'user', content: body.prompt }];
  }

  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: messages
      })
    });

    var data = await response.json();
    return {
      statusCode: response.status,
      headers: headers,
      body: JSON.stringify(data)
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: { message: 'Error API: ' + e.message } })
    };
  }
};
