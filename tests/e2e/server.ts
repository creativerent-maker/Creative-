import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.yml': 'text/yaml',
};

/** Servidor estático mínimo que imita Cloudflare Pages: /x/ -> /x/index.html y 404.html. */
export function serve(dir: string, port: number): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = path.join(dir, url);
    if (url.endsWith('/')) file = path.join(file, 'index.html');
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const nf = path.join(dir, '404.html');
      res.writeHead(404, { 'content-type': types['.html'] });
      res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'not found');
      return;
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}
