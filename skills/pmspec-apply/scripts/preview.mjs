import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// 固定本次字节快照；修订后重启，避免浏览器证据与磁盘版本混淆。
export async function startPreview(target, port = 0) {
  if (!target?.endsWith('.html')) throw new Error('须指定一个 .html 文件');
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('端口须为 0–65535 的整数');
  const content = await readFile(target);
  const sha256 = createHash('sha256').update(content).digest('hex');
  const server = createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    } else if (request.url === '/favicon.ico') {
      response.writeHead(204).end();
    } else if (request.url !== '/prototype.html') {
      response.writeHead(404).end();
    } else {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': content.length,
        'Cache-Control': 'no-store',
        'X-PMSpec-SHA256': sha256,
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    }
  });
  await new Promise((resolveReady, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolveReady);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}/prototype.html`,
    sha256,
    close: () => new Promise((resolveClosed, reject) => server.close((error) => error ? reject(error) : resolveClosed())),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length < 3 || process.argv.length > 4) throw new Error('用法：node preview.mjs <HTML文件> [端口，默认0]');
  const preview = await startPreview(process.argv[2], Number(process.argv[3] ?? 0));
  console.info(JSON.stringify({ url: preview.url, sha256: preview.sha256, pid: process.pid }));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await preview.close(); });
}
