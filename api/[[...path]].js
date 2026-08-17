import { handle } from '../lib/handler.js';
import { PAGE } from '../lib/page.js';
import { APARTMENT_TOUR } from '../lib/apartment.js';
import { ASSETS } from '../lib/assets.js';

export default async function handler(req, res) {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('access-control-allow-headers', 'authorization, content-type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  // req.url reflects the path actually routed to this function (post-rewrite),
  // so parse it directly instead of relying on req.query.path — the vercel.json
  // catch-all rewrite ("/(.*)" -> "/api/$1") does not reliably populate the
  // dynamic route param for the destination, which was causing every static
  // asset (sw.js, manifest.json, icons) to 404 and the rest to fall through
  // to the API handler as an unauthenticated request.
  const pathname = String(req.url || '/').split('?')[0].replace(/^(?:\/api)+(?=\/|$)/, '') || '/';

  // Serve PWA static assets
  if (ASSETS[pathname]) {
    const { b64, ct } = ASSETS[pathname];
    const buf = Buffer.from(b64, 'base64');
    const cc = ct.startsWith('image/') ? 'public, max-age=86400' : 'public, max-age=3600, must-revalidate';
    res.setHeader('content-type', ct);
    res.setHeader('cache-control', cc);
    res.status(200).send(buf);
    return;
  }

  // Serve apartment tour static page
  if (req.method === 'GET' && pathname === '/apartment-tour-v6.html') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.status(200).send(APARTMENT_TOUR);
    return;
  }

  // Serve HTML shell for root
  if (req.method === 'GET' && pathname === '/') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.status(200).send(PAGE);
    return;
  }

  // API routes
  const path = pathname.split('/').filter(Boolean);
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || null;
  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const { status, body: out } = await handle({ method: req.method, path, body, token });
  res.status(status).json(out);
}
