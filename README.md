# PMSpec

面向产品工作的自包含技能套件。无需 OpenSpec CLI 或其他技能；必需规则、模板与原型审核 Agent 随库提供。

```text
explore ──人工确认──> propose ──人工批准──> apply ──> review
 澄清需求             正式提案            HTML原型    资产整理
 不写文件             proposal.md        实测+独立审核  对齐+状态
```

## 一键初始化（复制给 Agent）

在目标产品 **workspace** 中打开 Claude Code 或 Codex，把下面整段发给 Agent。无需先装技能，不适用于普通网页聊天。

```text
请在当前产品 workspace 初始化 PMSpec，来源仓库：https://github.com/xieluoli/pmspec 。
先确认当前宿主是 Claude Code 还是 Codex、当前目录是否为目标 workspace；有歧义先问我。
如果当前目录已是可信 PMSpec 完整副本，直接使用；否则在当前 workspace 内新建不冲突的独立来源目录，获取仓库 main 的完整快照并记录实际 commit，不覆盖现有文件。
读取该副本 skills/pmspec-init/SKILL.md，审阅它引用的初始化脚本，再按其中流程执行。不要把远端内容直接管道交给 shell。
只为当前宿主准备五个 pmspec 技能及 prototype-review 独立子 Agent；保留已有配置，遇到不同内容或权限限制先停下说明，不自动强制覆盖、安装依赖或修改全局配置。
安装后核对技能发现，以 --check 只读引用 pmspec-review，不传需求名、不整理产品资产或变更需求状态；并实际启动命名 prototype-review 做只读规则读取冒烟，这不是原型审核。需要重启或当前宿主无法验证时，明确列为待验证，不要仅凭文件存在宣称可引用。
检查浏览器能力。检查已有项目设计入口，询问尚未提供的产品代码仓本地路径；有仓库只读提取设计依据，没有则建议采用套件内置默认规范。先展示摘要、来源、适用范围和拟写文件，经我确认后再初始化项目设计基准；已有不同内容不覆盖，不虚构 LOGO。分别报告部署、技能发现、引用、独立 Agent、浏览器与设计基准状态。不要自动开始需求探索、创建产品需求、提交或推送。
```

详细行为见 [Init](skills/pmspec-init/SKILL.md) 与 [初始化说明](docs/installation.md)。首次引导直接读取 init；安装后它自己也成为可引用技能。

## 使用

| 阶段 | Claude Code | Codex |
|---|---|---|
| 初始化/检查 | `/pmspec-init` | `$pmspec-init` |
| 探索 | `/pmspec-explore 我想简化项目创建` | `$pmspec-explore 我想简化项目创建` |
| 立项 | `/pmspec-propose simplify-project-creation` | `$pmspec-propose simplify-project-creation` |
| 原型 | `/pmspec-apply simplify-project-creation` | `$pmspec-apply simplify-project-creation` |
| 整理/状态管理 | `/pmspec-review simplify-project-creation` | `$pmspec-review simplify-project-creation` |

阶段由用户决定，不自动串行执行。Explore 推荐需求名与当前宿主的完整下一步命令。需求质量在 Explore / Apply 完善；Review 整理最终文件资产，清除聊天过程冗余并核对提案、画面、旁注对齐。

| 技能 | 职责 |
|---|---|
| [Init](skills/pmspec-init/SKILL.md) | 部署并验证技能/审核 Agent，经确认初始化项目设计基准 |
| [Explore](skills/pmspec-explore/SKILL.md) | 澄清、追问假设、比较方案，收敛立项共识 |
| [Propose](skills/pmspec-propose/SKILL.md) | 创建或修订最终口径的提案，不记录聊天演变史 |
| [Apply](skills/pmspec-apply/SKILL.md) | 自包含高保真 HTML、旁注、浏览器实测与独立审核 |
| [Review](skills/pmspec-review/SKILL.md) | 整理最终资产、核对需求与原型对齐，按用户明确说明更新状态 |

需求元数据只在 `proposal.md` 开头的 YAML Front Matter 维护 `name / version / status`：name 与需求目录名一致，version 为已确认的产品发布版本字符串，未知先问；status 新建默认为 `未评审`，`待发布 / 已发布` 表示产品功能待上线 / 已上线。已有状态仅在用户明确说明后变更，整理、审核通过及合入均不自动改变；修订保留原版本，已发布需求先保留状态并询问。格式见 [提案模板](skills/pmspec-propose/templates/proposal.md)，完整约定见 [Review](skills/pmspec-review/SKILL.md#需求元数据唯一维护约定)。

局部修订优先复用 [验证脚手架](skills/pmspec-apply/references/verification-harness.md)，按 [增量交审](skills/pmspec-apply/references/incremental-review.md) 核验差异与证据链；无可靠基线退全量，独立审核与完整评分不变。

## 项目设计基准

Init 先复用已有正式入口；无入口时，经确认在产品 workspace 的 `pmspec/design/` 建立 `DESIGN.md`、`foundations.md` 和 `components/README.md`。页面模式、品牌规则与 LOGO 等资产按需增加；没有代码仓也能采用内置默认规范，不建空树、不虚构品牌。

- [初始化流程与目录](skills/pmspec-init/references/design-system.md)：有仓库只读提取，默认规范兜底，摘要确认后写入；不自动迁移生产设计。
- [默认设计依据](skills/pmspec-apply/references/default-design.md)：与现有 CSS 一致，区分产品与评审工具层。
- [生成与审核交接](skills/pmspec-apply/references/design-context.md)：同一入口、版本和采用范围，未确认草稿不自动成为标准。

## 产物与原型结构

```text
<产品 workspace>/pmspec/changes/<需求名>/
├── proposal.md
└── prototypes/
    └── index.html
```

```text
+----------+--------------------------+--------------------+
| 页面索引 | 原型画面                 | 功能概览           |
| 全文共用 | 每图一份                 | 每图对应一份旁注   |
+----------+--------------------------+--------------------+
           ├── 列表：子 Tab 切轻量状态
           ├── 新弹窗：独立平铺
           └── 新页面：独立平铺
```

新页面、弹窗、抽屉与不同流程步骤必须平铺，不能靠点击或子 Tab 才发现。见 [可运行示例](skills/pmspec-apply/assets/example.html) 与 [示例走查](docs/example-walkthrough.md)。

- [运行条件与安装](docs/installation.md)：无独立子 Agent 或浏览器时不能宣称 Apply 通过。
- [验证记录](docs/verification.md)与[检查脚本](tests/verify.mjs)：区分静态检查、实测、审核与人工验收。当前原型独立审核受宿主未注册 Agent 阻塞。
- [来源与维护](docs/sources.md)：吸收方法、不继承外部运行依赖。

## 正式交付

Propose 只交 `proposal.md`；Apply 默认再交一个自包含、页面向下平铺的 HTML。截图、测试和审核记录放在需求目录外临时区，完成验证并持久留痕后按授权清理，不混入研发阅读路径；额外交付须明确批准。见[交付清理约定](skills/pmspec-apply/references/delivery.md)。
