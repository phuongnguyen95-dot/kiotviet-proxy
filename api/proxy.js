export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const target = url.searchParams.get('url');
  
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,Retailer');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (!target) {
    return new Response(JSON.stringify({ error: 'Missing url' }), { status: 400, headers });
  }

  const fwdHeaders = new Headers();
  fwdHeaders.set('Content-Type', req.headers.get('content-type') || 'application/json');
  if (req.headers.get('authorization')) fwdHeaders.set('Authorization', req.headers.get('authorization'));
  if (req.headers.get('retailer')) fwdHeaders.set('Retailer', req.headers.get('retailer'));

  const fetchOpts = { method: req.method, headers: fwdHeaders };
  if (req.method !== 'GET') {
    const body = await req.text();
    if (body) fetchOpts.body = body;
  }

  const resp = await fetch(target, fetchOpts);
  const data = await resp.text();

  headers.set('Content-Type', 'application/json');
  return new Response(data, { status: resp.status, headers });
}
