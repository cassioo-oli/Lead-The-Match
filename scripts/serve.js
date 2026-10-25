// Servidor de desenvolvimento local. Usa somente módulos do Node.js.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 5500);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'login.html' : pathname.slice(1);
    const target = resolve(root, relative);
    const type = types[extname(target).toLowerCase()];
    if (!target.startsWith(root + sep) || relative.split(/[\\/]/).some(part => part.startsWith('.')) || !type || relative.startsWith('scripts/') || relative.endsWith('.test.js')) {
      res.writeHead(404); res.end('Arquivo não encontrado.'); return;
    }
    const body = await readFile(target);
    res.writeHead(200, { 'Content-Type': type + (type.startsWith('text/') ? '; charset=utf-8' : ''), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404); res.end('Arquivo não encontrado.');
  }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `A porta ${port} já está em uso. Feche o Live Server ou escolha outra porta pela variável PORT.` : error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Lead The Match: http://127.0.0.1:${port}/login.html\nCtrl+C para encerrar. É necessário acesso à internet para login e dados.`));
