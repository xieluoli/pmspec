import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateReview } from '../skills/pmspec-apply/scripts/check-review.mjs';

const applyRoot = new URL('../skills/pmspec-apply/', import.meta.url);
const checklist = await readFile(new URL('references/review-checklist.md', applyRoot), 'utf8');
const criteria = [...checklist.matchAll(/^\| ([CLVREA]\d+) \| ([^|]+) \| (\d+) \|/gm)]
  .map((match) => ({ id: match[1], dimension: match[2].trim(), maximum: Number(match[3]) }));
const maxima = {};
for (const item of criteria) maxima[item.dimension] = (maxima[item.dimension] ?? 0) + item.maximum;
assert.deepEqual(Object.values(maxima), [30, 20, 15, 15, 10, 10]);
assert.equal(criteria.reduce((total, item) => total + item.maximum, 0), 100);
assert(checklist.includes('总分至少 90'));
function report({ zero = [], unverified = [], mandatory = 0, pending = 0, evidence = '齐全', conclusion } = {}) {
  const subtotals = {};
  const rows = criteria.map((item) => {
    const status = unverified.includes(item.id) ? '未验证' : zero.includes(item.id) ? '缺陷' : '已验证';
    const score = status === '已验证' ? item.maximum : 0;
    subtotals[item.dimension] = (subtotals[item.dimension] ?? 0) + score;
    return `| ${item.id} | ${score} | ${status} | 规范条目 / #section / evidence.md |`;
  });
  const total = Object.values(subtotals).reduce((sum, score) => sum + score, 0);
  const passed = total >= 90 && !mandatory && !pending && evidence === '齐全' && !unverified.length;
  return [
    '明确缺陷 / 待确认问题 / 改进建议 / Not run：测试夹具，不代表真实审核',
    ...rows,
    ...Object.entries(subtotals).map(([name, score]) => `${name}：${score}`),
    `总分：${total}`, `必改项：${mandatory}`, `待确认项：${pending}`, `必需证据：${evidence}`,
    conclusion ?? `${passed ? '审核通过' : '审核不通过'} ${total}分`,
  ].join('\n');
}
assert.equal(validateReview(report(), checklist).passed, true);
assert.equal(validateReview(report({ zero: ['C1'] }), checklist).passed, true, '90 分且无硬阻塞可通过');
assert.equal(validateReview(report({ zero: ['C1', 'V1'] }), checklist).passed, false, '85 分不通过');
assert.equal(validateReview(report({ mandatory: 1 }), checklist).passed, false, '100 分也不能抵消必改');
assert.equal(validateReview(report({ pending: 1 }), checklist).passed, false);
assert.equal(validateReview(report({ evidence: '不齐全' }), checklist).passed, false);
assert.equal(validateReview(report({ unverified: ['V3'] }), checklist).total, 95);
assert.equal(validateReview(report({ unverified: ['V3'] }), checklist).passed, false, '未验证项暂计 0 且阻止通过');
const first = report({ zero: ['C1'], mandatory: 1 });
assert.equal(validateReview(first, checklist).passed, false);
assert.equal(validateReview(report(), checklist).total, 100, '复审应重算全部分项');
for (const invalid of [
  report({ mandatory: 1, conclusion: '审核通过 100分' }),
  report({ unverified: ['V3'], conclusion: '审核通过 95分' }),
  report().replace('总分：100', '总分：99'),
  report().replace('组件复用与变体：30', '组件复用与变体：20'),
  report().replace('| C1 | 10', '| C1 | 5'),
  report().replace('| C1 | 10 | 已验证', '| C1 | 10 | 未验证'),
  report().replace('| C1 |', '| C2 |'),
  report().replace(/^\| C1.*\n/m, ''),
  report().replace('审核通过 100分', '可交付'),
  report().replace('审核通过 100分', '**审核通过 100分**'),
  report() + '\n附加说明',
  report() + '\n| C1 | invalid |',
  report().replace('必改项：0', '必改项：0\n必改项：1'),
  '子 Agent 未启动',
]) assert.throws(() => validateReview(invalid, checklist));
const runtime = await readFile(new URL('references/runtime.md', applyRoot), 'utf8');
for (const text of ['"subagent_type": "prototype-review"', '"run_in_background": false', 'Codex 使用当前宿主', '不照搬 Claude', '上一轮报告', '复审', '不换通用 Agent', '格式错误']) {
  assert(runtime.includes(text), `调用契约：${text}`);
}
for (const file of ['agents/prototype-review.md', 'agents/prototype-review.toml']) {
  const text = await readFile(new URL(file, applyRoot), 'utf8');
  for (const required of ['唯一评分表', '审核通过 N分', '审核不通过 N分', '规则读取冒烟', '不追加文字']) assert(text.includes(required), `${file}：${required}`);
  assert(!text.includes('末尾使用“可交付'));
}
const init = await readFile(new URL('../skills/pmspec-init/SKILL.md', import.meta.url), 'utf8');
for (const text of ['六个评分维度及满分', '不评分', '未启动或无响应如实记录']) assert(init.includes(text));
const temporary = await mkdtemp(join(tmpdir(), 'pmspec-review-'));
try {
  const file = join(temporary, 'review.md');
  for (const [content, status] of [[report(), 0], [first, 1], ['审核通过 100分', 2]]) {
    await writeFile(file, content);
    const result = spawnSync(process.execPath, [new URL('scripts/check-review.mjs', applyRoot).pathname, file], { encoding: 'utf8' });
    assert.equal(result.status, status, result.stderr);
  }
} finally {
  await rm(temporary, { recursive: true });
}
console.info('通过：六维 100 分、90 分边界、硬性条件、缺证暂零、固定末行、复审算分与双宿主命名调用文本契约；不代表真实 Agent 审核');
