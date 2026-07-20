const https = require('https');
const url = require('url');

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzDGnzGpuFX21WgxB-JE8Erk1_J_tO4cWwZ6xNcS_lrn_YoNUmia8DXZ1eIU9k8uVEDXA/exec';

function httpsRequest(reqUrl, options, body) {
  return new Promise(function(resolve, reject) {
    var parsed = url.parse(reqUrl);
    var opts = Object.assign({}, options, {
      hostname: parsed.hostname,
      path: parsed.path,
      port: 443
    });
    var req = https.request(opts, function(res) {
      var data = '';
      res.on('data', function(chunk){ data += chunk; });
      res.on('end', function(){ resolve(data); });
    });
    req.on('error', reject);
    if(body) req.write(body);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if(req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    if(req.method === 'GET') {
      var sheet = (req.query && req.query.sheet) || 'datos';
      var text = await httpsRequest(SHEETS_URL + '?sheet=' + sheet, { method: 'GET' });
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(text);

    } else if(req.method === 'POST') {
      var bodyStr = JSON.stringify(req.body);
      var text = await httpsRequest(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) }
      }, bodyStr);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(text);

    } else {
      res.status(405).json({error: 'Method not allowed'});
    }
  } catch(e) {
    res.status(500).json({error: e.message});
  }
};
