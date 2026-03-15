const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number.parseInt(process.env.PORT || '3000', 10);

const HUBMSG_URL = process.env.HUBMSG_URL || 'https://hubmsgpanel.octotech.az/api/message';
const HUBMSG_API_KEY = process.env.HUBMSG_API_KEY || '';
const HUBMSG_RECIPIENTS = process.env.HUBMSG_RECIPIENTS || '';
const HUBMSG_LABEL = process.env.HUBMSG_LABEL || 'OctotechPortfolio';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

function sendText(res, statusCode, body) {
  res.writeHead(statusCode, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

function safeJoin(rootDir, urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.posix
    .normalize(decoded)
    .replace(/^(\.\.(\/|\\|$))+/, '');
  return path.join(rootDir, normalized);
}

function sendFile(req, res, filePath) {
  fs.stat(filePath, (statError, stats) => {
    if (statError) return sendText(res, 404, 'Not Found');
    if (!stats.isFile()) return sendText(res, 404, 'Not Found');

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'content-type': contentType,
      'content-length': stats.size,
      'x-content-type-options': 'nosniff',
      'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });

    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

const server = http.createServer(async (req, res) => {
  try {
    const hostHeader = req.headers.host || 'localhost';
    const url = new URL(req.url || '/', `http://${hostHeader}`);
    const pathname = url.pathname || '/';

    if (pathname === '/health') return sendText(res, 200, 'ok');

    if (pathname === '/api/message' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      const name = String(payload?.name || '').trim();
      const phone = String(payload?.phone || '').trim();
      const email = String(payload?.email || '').trim();
      const message = String(payload?.message || '').trim();

      if (!name || !message) return sendJson(res, 400, { ok: false, error: 'missing_fields' });
      if (!HUBMSG_API_KEY || !HUBMSG_RECIPIENTS) {
        return sendJson(res, 501, { ok: false, error: 'server_not_configured' });
      }

      const upstreamBody = {
        recipients: HUBMSG_RECIPIENTS,
        message: `OCTOTECH FORM:\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMsg: ${message}`,
        label: HUBMSG_LABEL,
      };

      const upstreamResponse = await fetch(HUBMSG_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': HUBMSG_API_KEY,
        },
        body: JSON.stringify(upstreamBody),
      });

      if (!upstreamResponse.ok) {
        const errText = await upstreamResponse.text().catch(() => '');
        return sendJson(res, 502, { ok: false, error: 'upstream_failed', status: upstreamResponse.status, body: errText });
      }

      return sendJson(res, 200, { ok: true });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('allow', 'GET, HEAD, POST');
      return sendText(res, 405, 'Method Not Allowed');
    }

    const rootDir = __dirname;

    if (pathname === '/' || pathname === '/index.html') {
      return sendFile(req, res, path.join(rootDir, 'index.html'));
    }

    const allowedTopLevel = new Set([
      '/favicon.svg',
      '/robots.txt',
      '/sitemap.xml',
      '/site.webmanifest',
    ]);

    if (allowedTopLevel.has(pathname)) {
      return sendFile(req, res, safeJoin(rootDir, pathname));
    }

    if (pathname.startsWith('/assets/')) {
      return sendFile(req, res, safeJoin(rootDir, pathname));
    }

    const accept = String(req.headers.accept || '');
    if (accept.includes('text/html')) {
      return sendFile(req, res, path.join(rootDir, 'index.html'));
    }

    return sendText(res, 404, 'Not Found');
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: 'internal_error' });
  }
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Octotech server listening on http://${HOST}:${PORT}`);
});

