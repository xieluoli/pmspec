import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFile(join(root, path), 'utf8');
const initialization = await read('skills/pmspec-init/SKILL.md');
const rules = await read('skills/pmspec-init/references/design-system.md');
const context = await read('skills/pmspec-apply/references/design-context.md');
const defaults = await read('skills/pmspec-apply/references/default-design.md');
const theme = await read('skills/pmspec-apply/assets/theme.css');
const shared = await read('skills/pmspec-apply/assets/shared.css');

// 文本契约仅防规则丢失，不模拟 Agent 对话，也不证明实际遵循。
assert(initialization.includes('references/design-system.md'));
for (const [scenario, fragments] of [
  ['有仓库', ['代码仓只读', '实际 commit', '有未提交修改时标明工作区快照', '源码提取，不声称视觉已验证']],
  ['无仓库', ['用户明确没有仓库时', 'default-design.md', '不虚构 LOGO、业务组件或深色模式']],
  ['路径不可访问', ['路径不存在、不可读或代码不完整', '不可静默回退']],
  ['已有入口', ['有正式入口就沿用，不复制第二套', '文件存在不等于获批准']],
  ['多套样式', ['多套样式并存时列差异、来源和影响', '交用户选择']],
  ['采用确认', ['先在对话中展示', '调用 init 只授权部署技能', '默认路径也要明确确认采用', '不阻塞后续 Explore']],
  ['重复初始化', ['相同内容不重写', '不同内容、其他人改动或符号链接先停止', '只提出必要增量', '不自动刷新旧原型']],
  ['输出边界', ['代码仓与产物 workspace 可不同', '不能放在某次需求内或宿主技能安装目录中', '没有资产不建空目录']],
  ['证据与许可', ['已观察', '已确认采用', '待确认建议', '无许可不复制/分发', '本机绝对路径']],
]) {
  for (const fragment of fragments) assert(rules.includes(fragment), `${scenario}：${fragment}`);
}
for (const fragment of ['pmspec/design/DESIGN.md', '采用状态', '不能因文件存在而自动采用', '只提出沉淀建议']) {
  assert(context.includes(fragment), `Apply 设计消费：${fragment}`);
}
for (const filename of ['DESIGN.md', 'foundations.md', 'components.md', 'patterns.md', 'brand.md']) {
  const template = await read(`skills/pmspec-init/templates/design/${filename}`);
  assert(template.includes('模板'), `模板存在且声明填写用途：${filename}`);
  assert(template.includes('来源'), `模板可追溯：${filename}`);
}
for (const path of ['skills/pmspec-apply/agents/prototype-review.md', 'skills/pmspec-apply/agents/prototype-review.toml', 'skills/pmspec-apply/references/review-checklist.md']) {
  const text = await read(path);
  for (const fragment of ['设计入口', '来源版本', '采用状态', '待确认建议', '不据此扣分']) {
    assert(text.includes(fragment), `生成/审核采用边界一致：${path}/${fragment}`);
  }
}

// 默认说明的 token 表必须完整匹配真实主题，不允许新增无依据色值。
const tokens = [...theme.matchAll(/(--[\w-]+):\s*([^;]+);/g)];
const documentedTokens = [...defaults.matchAll(/^\| (--[\w-]+) \| ([^|]+) \|/gm)];
assert.equal(documentedTokens.length, tokens.length, '默认说明应覆盖且仅覆盖真实 token');
for (const [, name, value] of tokens) {
  assert.equal(documentedTokens.find((entry) => entry[1] === name)?.[2].trim(), value.trim(), `默认 token 同步：${name}`);
}
assert(defaults.includes('当前仅 light'));
assert(/color-scheme:\s*light;/.test(theme));

// 表格里写出的 CSS 声明逐条核对对应选择器；措辞摘要不做 CSS 模拟。
for (const match of defaults.matchAll(/^\| (\.[\w-]+|body|h2|h3) \| ([^|]+) \|/gm)) {
  const [, selector, description] = match;
  const source = [...shared.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .find((entry) => entry[1].trim().split(/,\s*/).includes(selector));
  assert(source, `默认组件/排版选择器存在：${selector}`);
  for (const [, property, value] of description.matchAll(/([\w-]+):\s*([^;]+)(?:;|$)/g)) {
    const declaration = [...source[2].matchAll(/([\w-]+):\s*([^;]+);/g)].find((entry) => entry[1] === property);
    assert.equal(declaration?.[2].trim(), value.trim().replace(/，.*$/, ''), `默认说明与 CSS 一致：${selector}/${property}`);
  }
}
console.info('通过：设计初始化场景文本契约、五类模板、双宿主采用边界、默认 token 与组件声明同步（非模型端到端验证）');
