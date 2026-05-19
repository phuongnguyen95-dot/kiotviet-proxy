export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Retailer');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const target = req.query.url;
  if (!target) return res.status(400).json({ error: 'Missing url param' });

  try {
    const headers = { 'Content-Type': req.headers['content-type'] || 'application/json' };
    if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization'];
    if (req.headers['retailer']) headers['Retailer'] = req.headers['retailer'];

    const fetchOptions = { method: req.method, headers };
    if (req.method !== 'GET' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(target, fetchOptions);
    const data = await response.text();

    res.status(response.status);
    try { res.json(JSON.parse(data)); }
    catch { res.send(data); }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
