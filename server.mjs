import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== resolve(root) && !path.startsWith(resolve(root) + sep)) {
      res.writeHead(403).end();
      return;
    }
    const target = path === resolve(root) ? resolve(root, 'index.html') : path;
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }).end(body);
  } catch {
    res.writeHead(404).end('Arquivo não encontrado');
  }
}).listen(4173, '127.0.0.1', () => console.log('Hero: http://127.0.0.1:4173'));
