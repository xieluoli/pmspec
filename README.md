# PMSpec

面向产品工作的自包含技能套件。无需 OpenSpec CLI 或其他技能；必需规则、模板与原型审核 Agent 随库提供。

```text
explore ──人工确认──> propose ──人工批准──> apply ──> review
 澄清需求             正式提案            HTML原型    预留入口
 不写文件             proposal.md        实测+独立审核  未启用
```

## 开始使用

按 [安装说明](docs/installation.md) 安装后，在目标产品的工作区调用：

```text
/pmspec-explore 我想简化项目创建流程
/pmspec-propose simplify-project-creation
/pmspec-apply simplify-project-creation
/pmspec-review simplify-project-creation
```

阶段之间由用户决定，不自动串行执行。Explore 会推荐需求名与完整下一步命令；Review 首版未启用，不给出通过结论。

| 技能 | 职责 |
|---|---|
| [Explore](skills/pmspec-explore/SKILL.md) | 澄清、追问假设、比较方案，收敛立项共识 |
| [Propose](skills/pmspec-propose/SKILL.md) | 创建或修订最终口径的提案，不记录聊天演变史 |
| [Apply](skills/pmspec-apply/SKILL.md) | 自包含高保真 HTML、旁注、浏览器实测与独立审核 |
| [Review](skills/pmspec-review/SKILL.md) | 需求逻辑预审的未启用入口 |

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
