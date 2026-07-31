// Función "coach" — llama a la API de Anthropic (Claude) para el sistema
// interno del club (ajuste de planes AR->INT, y extracción de datos de PDFs
// de Antropometría/Laboratorio).
//
// IMPORTANTE: DigitalOcean Functions usa el formato nativo de Apache
// OpenWhisk, NO el formato de AWS Lambda / Netlify Functions. Los
// parámetros de la solicitud (query string y cuerpo JSON) llegan
// directamente combinados en el objeto "args" — no hay que leer
// event.httpMethod ni hacer JSON.parse(event.body) como en Lambda.

async function main(args) {
  // Manejo de la solicitud CORS "preflight" que hace el navegador antes
  // del POST real.
  if (args.http && args.http.method && args.http.method.toLowerCase() === 'options') {
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

  var headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: { message: 'API key no configurada' } })
    };
  }

  // En DigitalOcean Functions, los campos que el frontend manda en el
  // cuerpo JSON del POST (prompt, pdf_base64) llegan directo como
  // propiedades de "args" — no hace falta parsear nada.
  var prompt = args.prompt;
  var pdfBase64 = args.pdf_base64;

  if (!prompt) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({ error: { message: 'Falta el parámetro "prompt"' } })
    };
  }

  var messages;
  if (pdfBase64) {
    messages = [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: pdfBase64
          }
        },
        { type: 'text', text: prompt }
      ]
    }];
  } else {
    messages = [{ role: 'user', content: prompt }];
  }

  try {
    var fetch = require('node-fetch');
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        messages: messages
      })
    });

    var data = await response.json();
    return {
      statusCode: response.status,
      headers: headers,
      body: JSON.stringify(data)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: { message: 'Error API: ' + e.message } })
    };
  }
}

exports.main = main;
