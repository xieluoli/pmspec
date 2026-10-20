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
const skillNames = ['pmspec-init', 'pmspec-explore', 'pmspec-propose', 'pmspec-apply', 'pmspec-review'];
for (const skillName of skillNames) {
  const content = await readFile(join(root, 'skills', skillName, 'SKILL.md'), 'utf8');
  assert(content.startsWith(`---\nname: ${skillName}\n`), skillName);
  assert(content.includes('disable-model-invocation: true'), '不得自动推进阶段');
  assert(content.includes('$ARGUMENTS') || skillName === 'pmspec-init', '必须声明输入');
}
const applyRoot = join(root, 'skills/pmspec-apply');
// 文本契约回归，不替代真实宿主的生成、浏览器实测或独立审核。
const designContext = await readFile(join(applyRoot, 'references/design-context.md'), 'utf8');
for (const [scenario, required] of [
  ['无 DESIGN 的新项目', ['新项目无依据时可直接使用内置默认主题', '不自动创建 DESIGN']],
  ['已有规范的项目', ['组件与页面骨架的来源、变体和对应原型位置', '无需搬入框架或新增依赖']],
  ['仅批准局部迁移', ['不再因它未全局批准而重复阻塞', '保留无关操作、入口顺序与布局']],
  ['证据与职责', ['被检文件版本标识', '最终生效样式', '真实 APP 或后端未运行，不自动阻塞', '主 Agent 不得换角色自判通过']],
]) {
  for (const text of required) assert(designContext.includes(text), `${scenario}：${text}`);
}
for (const filename of ['SKILL.md', 'references/runtime.md', 'references/prototype.md', 'references/review-checklist.md']) {
  const content = await readFile(join(applyRoot, filename), 'utf8');
  assert(content.includes('design-context.md'), `生成/审核共用设计交接：${filename}`);
}
const reviewer = await readFile(join(applyRoot, 'agents/prototype-review.md'), 'utf8');
const reviewerToml = await readFile(join(applyRoot, 'agents/prototype-review.toml'), 'utf8');
// 当前 TOML 的开发者指令使用单行双引号字符串，与 JSON 转义兼容。
const reviewerInstructions = JSON.parse(reviewerToml.match(/^developer_instructions = (.+)$/m)[1]);
for (const content of [reviewer, reviewerInstructions]) {
  for (const text of ['references/design-context.md', 'references/review-checklist.md', '设计依据与本次批准范围', '复用映射', '当前证据版本', '全局批准', '真实 APP/后端未运行不自动阻塞']) {
    assert(content.includes(text), `两种宿主审核输入一致：${text}`);
  }
}
assert(reviewer.includes('tools: Read, Glob, Grep'), 'Claude 审核仍为只读工具白名单');
assert(reviewerInstructions.includes('不宣称有独立只读沙箱'), 'Codex 不扩大权限承诺');
for (const skillName of ['pmspec-propose', 'pmspec-apply']) {
  const content = await readFile(join(root, 'skills', skillName, 'SKILL.md'), 'utf8');
  assert(content.includes('需求根目录'), 'Propose/Apply 沿用项目路径');
}
console.info('通过：设计交接文本契约（默认主题 / 既有规范 / 局部批准）、双宿主审核定义与项目路径');
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
const design = spawnSync(process.execPath, [join(root, 'tests/design.mjs')], { encoding: 'utf8' });
assert.equal(design.status, 0, design.stderr);
console.info(design.stdout.trim());
const delivery = spawnSync(process.execPath, [join(root, 'tests/delivery.mjs')], { encoding: 'utf8' });
assert.equal(delivery.status, 0, delivery.stderr);
console.info(delivery.stdout.trim());
const review = spawnSync(process.execPath, [join(root, 'tests/review.mjs')], { encoding: 'utf8' });
assert.equal(review.status, 0, review.stderr);
console.info(review.stdout.trim());
const initialization = spawnSync(process.execPath, [join(root, 'tests/init.mjs')], { encoding: 'utf8' });
assert.equal(initialization.status, 0, initialization.stderr);
console.info(initialization.stdout.trim());
console.info(`通过：5 个技能、${linkCount} 个内部链接、脚本语法、2 个自包含 HTML、内嵌一致性与幂等/拒绝错误输入`);
