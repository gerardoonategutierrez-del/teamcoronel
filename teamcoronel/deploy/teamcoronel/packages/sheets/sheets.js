exports.handler = async function(event) {
  var headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if(event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzDGnzGpuFX21WgxB-JE8Erk1_J_tO4cWwZ6xNcS_lrn_YoNUmia8DXZ1eIU9k8uVEDXA/exec';

  try {
    if(event.httpMethod === 'GET') {
      var sheet = event.queryStringParameters && event.queryStringParameters.sheet || 'datos';
      var resp = await fetch(SHEETS_URL + '?sheet=' + sheet, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      var text = await resp.text();
      return { statusCode: 200, headers: headers, body: text };
    }

    if(event.httpMethod === 'POST') {
      var body = JSON.parse(event.body);
      var resp = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var text = await resp.text();
      return { statusCode: 200, headers: headers, body: text };
    }

  } catch(e) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
