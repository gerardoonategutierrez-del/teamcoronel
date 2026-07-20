const fetch = require('node-fetch');

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzDGnzGpuFX21WgxB-JE8Erk1_J_tO4cWwZ6xNcS_lrn_YoNUmia8DXZ1eIU9k8uVEDXA/exec';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if(req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    if(req.method === 'GET') {
      var sheet = (req.query && req.query.sheet) || 'datos';
      var resp = await fetch(SHEETS_URL + '?sheet=' + sheet);
      var text = await resp.text();
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(text);

    } else if(req.method === 'POST') {
      var body = req.body;
      var resp = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });
      var text = await resp.text();
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(text);

    } else {
      res.status(405).json({error: 'Method not allowed'});
    }
  } catch(e) {
    res.status(500).json({error: e.message});
  }
};
