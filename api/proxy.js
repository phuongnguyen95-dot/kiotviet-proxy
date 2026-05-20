export const config = { runtime: 'edge' };

export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,Retailer,x-api-key,anthropic-version,anthropic-dangerous-direct-browser-access',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }

  let target;
  try {
    target = new URL(req.url).searchParams.get('url');
  } catch(e) {
    return new Response(JSON.stringify({error:'Invalid URL'}), {status:400, headers:{...cors,'Content-Type':'application/json'}});
  }

  if (!target) {
    return new Response(JSON.stringify({error:'Missing url param'}), {status:400, headers:{...cors,'Content-Type':'application/json'}});
  }

  const fwd = {};
  const ct = req.headers.get('content-type');
  if (ct) fwd['Content-Type'] = ct;
  const auth = req.headers.get('authorization');
  if (auth) fwd['Authorization'] = auth;
  const retailer = req.headers.get('retailer');
  if (retailer) fwd['Retailer'] = retailer;

  const opts = { method: req.method, headers: fwd };
  if (!['GET','HEAD'].includes(req.method)) {
    const body = await req.text();
    if (body) opts.body = body;
  }

  try {
    const res = await fetch(target, opts);
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { ...cors, 'Content-Type': res.headers.get('content-type') || 'application/json' }
    });
  } catch(e) {
    return new Response(JSON.stringify({error: e.message}), {status:500, headers:{...cors,'Content-Type':'application/json'}});
  }
}
