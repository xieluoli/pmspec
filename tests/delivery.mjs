import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const delivery = await read('skills/pmspec-apply/references/delivery.md');
// 文本契约回归：没有自动删除器，不用夹具通过冒充真实清理或审核通过。
for (const [scenario, required] of [
  ['两文件与多轮迭代', ['proposal.md', 'prototypes/<入口名>.html', '同一 HTML 向下平铺', '须用户明确批准']],
  ['历史稿与过程材料', ['旧稿保护不等于永久交付', '需求目录外的运行临时区', '不在需求内建立 archive/', '不进入研发导航、提交清单或发布包']],
  ['引用资料先迁移', ['必要业务规则合入 proposal 或对应原型旁注', '素材内嵌到 HTML', '保留项目级 DESIGN 与共享设计资产', '链接/锚点']],
  ['设计初始化与清理边界', ['仅约束单次需求目录', 'pmspec/design/', '来源版本、采用状态及本次批准范围', '不代替设计初始化的人工确认']],
  ['他人文件与授权', ['核对 Git 与未提交改动', '没有删除授权', '他人文件、来源不明内容、未确认改动', '禁止按扩展名、通配符或递归删除整个目录']],
  ['证据与复审不可豁免', ['审核未完成、待裁决或仍需复审时保留所需证据', '宿主持久任务记录', 'HTML 字节未变', 'HTML 有改动则更新版本、补测并交命名 Agent 复审']],
  ['无持久记录时不假完成', ['若没有可用留痕渠道', '不声称清理闭环完成', '不触碰其他运行的文件']],
  ['交付不扩权', ['提交、推送、合入或同步安装/平台镜像', '仍各需授权']],
]) {
  for (const text of required) assert(delivery.includes(text), `${scenario}：缺少 ${text}`);
}
for (const path of ['SKILL.md', 'references/runtime.md', 'references/design-context.md']) {
  assert((await read(`skills/pmspec-apply/${path}`)).includes('delivery.md'), `清理入口未接入：${path}`);
}
const apply = await read('skills/pmspec-apply/SKILL.md');
assert(!apply.includes('太大时按完整流程拆分'), '不得自动拆分 HTML');
assert(apply.includes('命名审核 Agent（强制卡点）'), '命名独立审核不得被清理流程取消');
const propose = await read('skills/pmspec-propose/SKILL.md');
for (const text of ['Propose 阶段只交', '删除授权', '共享规范', '未经用户明确批准']) {
  assert(propose.includes(text), `Propose 缺少 ${text}`);
}
const markdown = await read('skills/pmspec-apply/agents/prototype-review.md');
const toml = await read('skills/pmspec-apply/agents/prototype-review.toml');
const instructions = JSON.parse(toml.match(/^developer_instructions = (.+)$/m)[1]);
for (const content of [markdown, instructions]) {
  for (const text of ['references/delivery.md', '不要求复制进正式交付目录', '审核未完成不提前销毁证据', '清理不能豁免', '项目级 DESIGN 与共享设计资产不属于多余交付', '不自行删除']) {
    assert(content.includes(text), `双宿主审核定义缺少 ${text}`);
  }
}
console.info('通过：两文件交付清理文本契约（多轮迭代 / 历史稿 / 被引用资料 / 他人文件 / 证据保留与复审 / 授权边界）');
