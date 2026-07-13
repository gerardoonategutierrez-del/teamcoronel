const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if(req.method === 'OPTIONS') { res.status(200).end(); return; }
  if(req.method !== 'POST')    { res.status(405).json({error:'Method Not Allowed'}); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if(!apiKey) { res.status(500).json({error:{message:'API key no configurada'}}); return; }

  const { prompt, pdf_base64 } = req.body;
  if(!prompt) { res.status(400).json({error:{message:'Falta prompt'}}); return; }

  let messages;
  if(pdf_base64) {
    messages = [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf_base64 } },
        { type: 'text', text: prompt }
      ]
    }];
  } else {
    messages = [{ role: 'user', content: prompt }];
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1500, messages })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch(e) {
    res.status(500).json({error:{message:'Error API: '+e.message}});
  }
};
