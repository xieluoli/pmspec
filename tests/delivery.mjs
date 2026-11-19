import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const delivery = await read('skills/pmspec-apply/references/delivery.md');
// 文本契约回归：没有自动删除器，不用夹具通过冒充真实清理或审核通过。
for (const [scenario, required] of [
  ['默认产物', ['proposal.md', 'prototypes/<入口名>.html', '新增画面进入同一个 HTML', '须用户明确批准']],
  ['候选转正式', ['未审阅草稿', '不冲突的新文件名', '确认候选替换正式入口', '先保留可恢复的旧版本']],
  ['保留历史与审核', ['可以并存', '本身不计入原型审核缺陷', '入口歧义、断链或额外运行依赖']],
  ['清理授权与证据', ['获准删除的具体文件', '无删除授权时保留文件并继续交付', '审核、复审和待裁决期间保留', '可访问的任务记录', 'HTML 字节或相关依赖发生变化']],
]) {
  for (const phrase of required) assert(delivery.includes(phrase), `${scenario}：${phrase}`);
}
for (const path of [
  'pmspec-apply/SKILL.md',
  'pmspec-apply/references/runtime.md',
  'pmspec-apply/references/design-context.md',
  'pmspec-apply/references/review-checklist.md',
  'pmspec-apply-artifacts/SKILL.md',
  'pmspec-propose/SKILL.md',
  'pmspec-review/SKILL.md',
]) assert((await read(`skills/${path}`)).includes('delivery.md'), `交付规则入口：${path}`);
console.info('通过：默认产物、候选转正式、历史保护与审核边界、清理授权及证据留存文本契约');
