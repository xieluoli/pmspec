import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function validateReview(report, checklist) {
  const criteria = [...checklist.matchAll(/^\| ([CLVREA]\d+) \| ([^|]+) \| (\d+) \|/gm)]
    .map((match) => ({ id: match[1], dimension: match[2].trim(), maximum: Number(match[3]) }));
  const threshold = Number(checklist.match(/总分至少 (\d+)/)?.[1]);
  if (criteria.length !== 15 || new Set(criteria.map((item) => item.id)).size !== 15
    || criteria.reduce((total, item) => total + item.maximum, 0) !== 100 || !threshold) {
    throw new Error('共享评分表不完整');
  }
  const rows = [...report.matchAll(/^\| ([CLVREA]\d+) \| (\d+) \| (已验证|缺陷|未验证) \| ([^\n]+) \|\r?$/gm)];
  // 不能让多余或畸形评分行被正则悄悄忽略。
  const candidateRows = report.match(/^\|\s*[CLVREA]\d+\s*\|.*$/gm) ?? [];
  if (rows.length !== criteria.length || candidateRows.length !== criteria.length) throw new Error('检查项缺失、重复或格式错误');
  const subtotals = {};
  let total = 0;
  for (const [index, criterion] of criteria.entries()) {
    const [, id, rawScore, status, evidence] = rows[index];
    const score = Number(rawScore);
    if (id !== criterion.id || !evidence.trim() || score !== (status === '已验证' ? criterion.maximum : 0)) {
      throw new Error(`检查项 ${criterion.id} 的顺序、得分或证据无效`);
    }
    subtotals[criterion.dimension] = (subtotals[criterion.dimension] ?? 0) + score;
    total += score;
  }
  for (const [dimension, score] of Object.entries(subtotals)) {
    const matches = [...report.matchAll(new RegExp(`^${dimension}：(\\d+)$`, 'gm'))];
    if (matches.length !== 1 || Number(matches[0][1]) !== score) throw new Error(`${dimension}小计错误或缺失`);
  }
  const count = (label) => {
    const matches = [...report.matchAll(new RegExp(`^${label}：(\\d+)$`, 'gm'))];
    if (matches.length !== 1) throw new Error(`${label}缺失或重复`);
    return Number(matches[0][1]);
  };
  if (count('总分') !== total) throw new Error('总分与检查项不一致');
  const mandatory = count('必改项');
  const pending = count('待确认项');
  const evidence = [...report.matchAll(/^必需证据：(齐全|不齐全)$/gm)];
  if (evidence.length !== 1) throw new Error('必需证据状态缺失或重复');
  const passed = total >= threshold && mandatory === 0 && pending === 0
    && evidence[0][1] === '齐全' && rows.every((row) => row[3] !== '未验证');
  const finalLine = report.trimEnd().split(/\r?\n/).at(-1);
  const conclusion = /^(审核通过|审核不通过) (100|[1-9]?\d)分$/.exec(finalLine);
  if (!conclusion || Number(conclusion[2]) !== total || (conclusion[1] === '审核通过') !== passed) {
    throw new Error('固定末行与评分或硬性条件不一致');
  }
  return { passed, total, subtotals };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.length !== 3) throw new Error('用法：node check-review.mjs <审核报告.md>');
    const report = (await readFile(resolve(process.argv[2]), 'utf8')).replace(/\r\n/g, '\n');
    const checklist = await readFile(new URL('../references/review-checklist.md', import.meta.url), 'utf8');
    const result = validateReview(report, checklist);
    console.info(JSON.stringify(result));
    process.exitCode = result.passed ? 0 : 1;
  } catch (error) {
    console.error(`审核报告无效：${error.message}`);
    process.exitCode = 2;
  }
}
