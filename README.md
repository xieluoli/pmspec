# PMSpec

把产品想法收敛成可独立阅读的提案和可点击的原型。阶段由用户选择，满足输入条件就能直接进入。

## 开始

在目标产品 workspace 的 Claude Code 或 Codex 中发给 Agent：

> 请在当前项目安装 PMSpec。优先使用我提供或当前目录中的可信完整副本，否则从 https://github.com/xieluoli/pmspec 获取来源。在该副本读取 `skills/pmspec-init/SKILL.md`，预检后安装，保留已有配置和产品文件。报告来源版本、部署结果和待验证项。

[安装与升级](docs/installation.md)

## 选阶段

| 我现在要做的事 | Claude Code | Codex | 产出 |
|---|---|---|---|
| [安装或预检](skills/pmspec-init/SKILL.md) | `/pmspec-init` | `$pmspec-init` | 技能与审核 Agent |
| [澄清想法](skills/pmspec-explore/SKILL.md) | `/pmspec-explore 简化项目创建` | `$pmspec-explore 简化项目创建` | 对话中的立项共识 |
| [写已确认的提案](skills/pmspec-propose/SKILL.md) | `/pmspec-propose simplify-project-creation` | `$pmspec-propose simplify-project-creation` | `proposal.md` |
| [把获准提案做成原型](skills/pmspec-apply-artifacts/SKILL.md) | `/pmspec-apply-artifacts simplify-project-creation` | `$pmspec-apply-artifacts simplify-project-creation` | 单文件交互画板 |
| [整理资产或更新发布状态](skills/pmspec-review/SKILL.md) | `/pmspec-review simplify-project-creation` | `$pmspec-review simplify-project-creation` | 已对齐的现有文件 |

已有经典原型可显式使用 [pmspec-apply](skills/pmspec-apply/SKILL.md)。需求名、批准依据与发布状态见[共同约定](skills/pmspec-propose/references/requirement.md)。

## 看交付

```text
pmspec/changes/<需求名>/
├── proposal.md
└── prototypes/index.html
```

`proposal.md` 说明为何做、做什么和影响谁。HTML 按用户入口 → 操作 → 结果组织画板，同页状态紧邻。每张图可进入对应场景，悬停组件可读展示边界、状态与恢复规则。全貌与连续体验共用母版，可离线打开。

- [打开交互样板](skills/pmspec-apply-artifacts/assets/example.html)
- [从提案到第一份原型](docs/example-walkthrough.md)
- [交付与历史规则](skills/pmspec-apply/references/delivery.md)
- [验证记录](docs/verification.md) · [来源与维护](docs/sources.md)

原型交付分别报告浏览器实测、命名独立审核与人工验收。产品发布状态由用户明确更新。
