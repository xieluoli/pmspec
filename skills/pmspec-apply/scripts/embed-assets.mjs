import { readFile, writeFile } from 'node:fs/promises';

const targets = process.argv.slice(2);
if (targets.length === 0) {
  throw new Error('用法：node embed-assets.mjs <HTML文件>...');
}
const assets = [
  ['theme', 'theme.css', 'style'],
  ['shared', 'shared.css', 'style'],
  ['runtime', 'prototype.js', 'script'],
];
const replacements = await Promise.all(assets.map(async ([name, filename, tag]) => {
  const content = await readFile(new URL(`../assets/${filename}`, import.meta.url), 'utf8');
  if (new RegExp(`</${tag}`, 'i').test(content)) {
    throw new Error(`资产 ${filename} 包含提前闭合 ${tag} 的内容`);
  }
  return { name, content: `<${tag}>\n${content.trim()}\n</${tag}>` };
}));
const updates = [];
for (const target of targets) {
  if (!target.endsWith('.html')) throw new Error(`只接受明确的 .html 文件：${target}`);
  let html = await readFile(target, 'utf8');
  for (const { name, content } of replacements) {
    const start = `<!-- @pmspec:${name}:start -->`;
    const end = `<!-- @pmspec:${name}:end -->`;
    if (html.split(start).length !== 2 || html.split(end).length !== 2 || html.indexOf(start) > html.indexOf(end)) {
      throw new Error(`${target} 必须且只能有一对正确排序的 ${name} 标记`);
    }
    const startIndex = html.indexOf(start) + start.length;
    html = html.slice(0, startIndex) + `\n${content}\n` + html.slice(html.indexOf(end));
  }
  updates.push({ target, html });
}
for (const { target, html } of updates) {
  await writeFile(target, html);
  console.info(`已嵌入 ${target}`);
}
