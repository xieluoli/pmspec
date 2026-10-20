import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { runInNewContext } from 'node:vm';
import { startPreview } from '../skills/pmspec-apply/scripts/preview.mjs';
import { compactHtml } from '../skills/pmspec-apply/scripts/inspect-html.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const temporary = await mkdtemp(join(tmpdir(), 'pmspec-incremental-'));
const original = '<!doctype html>\n<p id="sample">示例</p>\n<img src="data:image/png;base64,YWJj\nZGVm">';
const digest = content => createHash('sha256').update(content).digest('hex');
let preview;
try {
  const target = join(temporary, 'sample.html');
  await writeFile(target, original);
  preview = await startPreview(target);
  assert(preview.url.startsWith('http://127.0.0.1:'));
  assert.equal(preview.sha256, digest(original));
  const response = await fetch(preview.url);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-pmspec-sha256'), digest(original));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(await response.text(), original);
  assert.equal((await fetch(preview.url, { method: 'HEAD' })).headers.get('content-length'), String(Buffer.byteLength(original)));
  for (const path of ['/', '/secret.txt', '/%2e%2e/secret.txt', '/prototype.html?path=secret']) {
    assert.equal((await fetch(new URL(path, preview.url))).status, 404);
  }
  assert.equal((await fetch(new URL('/favicon.ico', preview.url))).status, 204);
  assert.equal((await fetch(preview.url, { method: 'POST' })).status, 405);
  await writeFile(target, '新版');
  assert.equal(await (await fetch(preview.url)).text(), original, '预览必须保持字节快照');
  const conflictingPort = Number(new URL(preview.url).port);
  await assert.rejects(startPreview(target, conflictingPort), /EADDRINUSE/);
  await assert.rejects(startPreview(target, -1), /端口/);
  await assert.rejects(startPreview('unknown.txt'), /html/);
  await assert.rejects(startPreview(join(temporary, 'missing.html')), /ENOENT/);
  const compact = compactHtml(original);
  assert.equal(compact.split('\n').length, original.split('\n').length);
  assert(compact.includes('[省略 8 字符]'));
  assert(!compact.includes('YWJj'));
  assert.equal(compactHtml('<p>unchanged</p>'), '<p>unchanged</p>');
  await writeFile(target, original);
  const inspection = spawnSync(process.execPath, [new URL('skills/pmspec-apply/scripts/inspect-html.mjs', root).pathname, target, 'sample'], { encoding: 'utf8' });
  assert.equal(inspection.status, 0, inspection.stderr);
  assert(inspection.stdout.includes(digest(original)) && inspection.stdout.includes('2\t<p'));
  assert.equal(await readFile(target, 'utf8'), original, '只读视图不得改原文件');

  const runChecks = runInNewContext(await read('skills/pmspec-apply/scripts/browser-checks.js'), { URL });
  class Page extends EventEmitter {
    constructor() { super(); this.navigations = 0; this.state = 'old'; }
    async setViewportSize(viewport) { this.viewport = viewport; }
    async goto() { this.navigations += 1; this.state = 'initial'; return { status: () => 200, headers: () => ({ 'x-pmspec-sha256': preview.sha256 }) }; }
    async evaluate() { return { duplicateIds: [], brokenAnchors: [], overflow: false }; }
    context() { return { browser: () => ({ version: () => 'test-double' }) }; }
  }
  const page = new Page();
  const config = {
    url: preview.url, sha256: preview.sha256,
    reset: async current => { current.state = 'ready'; },
    cases: [
      { name: '故意失败', run: async (current, check) => { check('前置重置', current.state === 'ready'); current.state = 'dirty'; check('故障', false); } },
      { name: '后例独立', run: async (current, check) => { check('不受上例污染', current.state === 'ready'); } },
    ],
  };
  const result = await runChecks(page, config);
  assert.equal(result.passed, false);
  assert(result.checks.some(item => item.name === '后例独立' && item.pass));
  assert.equal(page.navigations, 3);
  assert.equal(page.eventNames().length, 0, '不得泄漏监听器');
  const repeat = await runChecks(page, { ...config, cases: [config.cases[1]] });
  assert.equal(repeat.passed, true);
  assert.equal(page.eventNames().length, 0);
  const errors = await runChecks(page, { ...config, cases: [{ name: '错误日志', run: async current => { current.emit('pageerror', new Error('fixture')); } }] });
  assert.equal(errors.passed, false);
  assert.equal(errors.events[0].message, 'fixture');
  const empty = await runChecks(page, { url: preview.url, sha256: preview.sha256 });
  assert(empty.notRun.some(text => text.includes('未提供产品测试用例')));
  const wrongVersion = await runChecks(page, { url: preview.url, sha256: '0'.repeat(64) });
  assert.equal(wrongVersion.passed, false);
  assert.equal(page.eventNames().length, 0);
  await assert.rejects(runChecks(page, { url: 'file:///test', sha256: preview.sha256 }), /loopback/);
} finally {
  if (preview) await preview.close();
  await rm(temporary, { recursive: true });
}

const rules = await read('skills/pmspec-apply/references/incremental-review.md');
for (const text of ['无可靠基线', '完整差异', '共享依赖', '不能沿用旧分数', '全部 15 项', '关键流程冒烟', '纯文案也不默认免除独立审核', '退全量', '逐条复核', '原始证据']) assert(rules.includes(text), text);
for (const path of ['SKILL.md', 'references/runtime.md', 'references/design-context.md', 'references/review-checklist.md', 'agents/prototype-review.md', 'agents/prototype-review.toml']) {
  assert((await read(`skills/pmspec-apply/${path}`)).includes('incremental-review.md'), `增量规则入口：${path}`);
}
const markdown = await read('skills/pmspec-apply/agents/prototype-review.md');
const toml = await read('skills/pmspec-apply/agents/prototype-review.toml');
const instructions = JSON.parse(toml.match(/^developer_instructions = (.+)$/m)[1]);
for (const text of ['不得复制旧分数', '无可靠基线', '全部检查项', '跳过 base64', '完整差异', '共享依赖', '关键流程冒烟']) {
  assert(markdown.includes(text) && instructions.includes(text), `双宿主契约：${text}`);
}
for (const path of ['preview.mjs', 'inspect-html.mjs', 'browser-checks.js']) {
  const syntax = spawnSync(process.execPath, ['--check', new URL(`skills/pmspec-apply/scripts/${path}`, root).pathname], { encoding: 'utf8' });
  assert.equal(syntax.status, 0, syntax.stderr);
}
console.info('通过：单文件本地预览、字节快照/哈希、错误输入、只读精简视图、用例隔离/失败取证/监听清理、增量审核双宿主契约（浏览器接口模拟不等于浏览器实测）');
