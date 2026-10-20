import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function compactHtml(source) {
  return source.replace(/\bdata:([^\s"'<>]*?);base64,([A-Za-z0-9+/=\r\n]+)/gi, (match, media, payload) => {
    return `data:${media};base64,[省略 ${payload.replace(/[\r\n]/g, '').length} 字符]${payload.replace(/[^\r\n]/g, '')}`;
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [target, query] = process.argv.slice(2);
  if (!target?.endsWith('.html') || process.argv.length > 4) throw new Error('用法：node inspect-html.mjs <HTML文件> [定位文本]');
  const content = await readFile(target);
  console.info(`SHA256 ${createHash('sha256').update(content).digest('hex')}（原文件；以下只读视图省略 base64，行号不变）`);
  const lines = compactHtml(content.toString('utf8')).split('\n');
  const selected = new Set();
  lines.forEach((line, index) => {
    if (!query || line.toLowerCase().includes(query.toLowerCase())) {
      for (let nearby = Math.max(0, index - 5); nearby <= Math.min(lines.length - 1, index + 5); nearby += 1) selected.add(nearby);
    }
  });
  if (selected.size === 0) { console.error('未找到定位文本'); process.exitCode = 1; }
  for (const index of [...selected].sort((left, right) => left - right)) console.info(`${index + 1}\t${lines[index]}`);
}
