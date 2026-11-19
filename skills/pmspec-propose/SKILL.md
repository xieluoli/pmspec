---
name: pmspec-propose
description: 将已确认的产品需求创建或修订为唯一的 proposal.md，保持最终需求口径，排除聊天演变史。不生成规格、技术设计或研发任务。
argument-hint: "[需求名]"
disable-model-invocation: true
---

# PMSpec · Propose

把已确认的需求写成独立可读的 `proposal.md`。输入为 `$ARGUMENTS` 中的需求名和获批准口径。先按[共同约定](references/requirement.md)核对需求根目录、批准范围和元数据；新建用[提案模板](templates/proposal.md)。

## 写什么

| 章节 | 内容 |
|---|---|
| Why | 有依据的产品现状、问题和目标。其他版本的计划标明来源和状态 |
| What Changes | 按模块写行为变化，保留决定结果的入口、权限、触发条件、默认值、边界及异常结果 |
| Capabilities | 列新增及修改的产品能力。能复用已有名称就沿用；没有填「无」，能力清单未知时注明 |
| Impact | 受影响的用户、功能或平台，以及确有影响的依赖、兼容性和风险 |

仅在需要时增加「范围边界」「验收要点」。写最终口径；有证据的生产基线可写成「由 A 改为 B」。关键产品规则写在提案，页面展示和操作边界由原型旁注补足。确实影响验收的数值、文案、状态及限制需要保留。非阻塞假设写出影响，关键决策未定时先澄清。

## 交付

只创建或修订提案。交付前对照批准范围检查漏项、扩项、矛盾及独立可读性。存量资产按[交付约定](../pmspec-apply/references/delivery.md)保护与清理。

交付路径、实际变化和未决项，等待提案审阅。确认后给带真实名称的默认原型命令：Claude Code 用 `/pmspec-apply-artifacts 需求名`，Codex 用 `$pmspec-apply-artifacts 需求名`。由用户选择何时进入原型阶段。
