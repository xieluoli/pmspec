import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, writeFile, rm, access } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const root = fileURLToPath(new URL('../', import.meta.url));
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.filter((entry) => entry.name !== '.git').map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return groups.flat();
}
let linkCount = 0;
const files = await filesIn(root);
for (const file of files.filter((path) => extname(path) === '.md')) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(https?:|#)/.test(target)) continue;
    await access(resolve(dirname(file), target.split('#')[0]));
    linkCount += 1;
  }
  assert(!content.includes('/Users/'), `私有机器路径：${file}`);
}
const skillNames = ['pmspec-explore', 'pmspec-propose', 'pmspec-apply', 'pmspec-review'];
for (const skillName of skillNames) {
  const content = await readFile(join(root, 'skills', skillName, 'SKILL.md'), 'utf8');
  assert(content.startsWith(`---\nname: ${skillName}\n`), skillName);
  assert(content.includes('disable-model-invocation: true'), '不得自动推进阶段');
  assert(content.includes('$ARGUMENTS'), '必须声明输入');
}
const applyRoot = join(root, 'skills/pmspec-apply');
const script = join(applyRoot, 'scripts/embed-assets.mjs');
for (const filename of ['prototype.js', '../scripts/embed-assets.mjs']) {
  const result = spawnSync(process.execPath, ['--check', join(applyRoot, 'assets', filename)], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
for (const filename of ['example.html', 'template.html']) {
  const html = await readFile(join(applyRoot, 'assets', filename), 'utf8');
  assert(!/<(?:script|img|iframe)[^>]+src=["'](?!data:)/i.test(html), '不得有外部资源');
  assert(!/<link[^>]+href=["'](?!data:)/i.test(html), '不得有外部样式/字体');
  assert(!/@import|url\(\s*["']?(?:https?:|file:)/i.test(html), '不得有远端CSS依赖');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, '重复ID');
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), `无效锚点：${match[1]}`);
  for (const [name, asset, tag] of [['theme', 'theme.css', 'style'], ['shared', 'shared.css', 'style'], ['runtime', 'prototype.js', 'script']]) {
    const content = (await readFile(join(applyRoot, 'assets', asset), 'utf8')).trim();
    assert(html.includes(`<!-- @pmspec:${name}:start -->\n<${tag}>\n${content}\n</${tag}>\n<!-- @pmspec:${name}:end -->`), `内嵌资产未同步：${filename}/${name}`);
  }
}
const temporary = await mkdtemp(join(tmpdir(), 'pmspec-test-'));
try {
  const valid = join(temporary, 'valid.html');
  const invalid = join(temporary, 'invalid.html');
  const original = await readFile(join(applyRoot, 'assets/template.html'), 'utf8');
  await writeFile(valid, original);
  await writeFile(invalid, '<html>missing markers</html>');
  const first = spawnSync(process.execPath, [script, valid], { encoding: 'utf8' });
  assert.equal(first.status, 0, first.stderr);
  assert.equal(await readFile(valid, 'utf8'), original, '嵌入幂等');
  const rejected = spawnSync(process.execPath, [script, valid, invalid], { encoding: 'utf8' });
  assert.notEqual(rejected.status, 0, '错误标记须拒绝');
  assert.equal(await readFile(valid, 'utf8'), original, '校验失败不应修改前序文件');
  assert.equal(await readFile(invalid, 'utf8'), '<html>missing markers</html>', '不得改坏错误文件');
  const noInput = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.notEqual(noInput.status, 0, '空参数须拒绝');
} finally {
  await rm(temporary, { recursive: true });
}
console.info(`通过：4 个技能、${linkCount} 个内部链接、脚本语法、2 个自包含 HTML、内嵌一致性与幂等/拒绝错误输入`);
