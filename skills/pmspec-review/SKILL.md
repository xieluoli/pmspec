---
name: pmspec-review
description: 整理需求文件资产，清除聊天过程冗余，核对提案、原型与旁注一致性，并仅按用户明确说明更新需求状态。
argument-hint: "[需求名或 --check]"
disable-model-invocation: true
---

# PMSpec · Review

按 `$ARGUMENTS` 选择执行方式。这里的 Review 负责整理需求资产、核对内容对齐、按指令维护状态。原型实测和独立评分走 Apply 的[审核契约](../pmspec-apply/references/runtime.md)。

| 请求 | 范围 |
|---|---|
| `--check`，或仅验证技能引用 | 返回名称、三项职责、`未评审 / 待发布 / 已发布`，以及「仅验证技能引用，未整理资产或变更状态」。不查项目文件 |
| 仅更新状态 | 按[需求元数据](#需求元数据唯一维护约定)定位需求，只改既有状态值 |
| 整理需求 | 核对现有提案、正式原型、旁注和直接引用，执行下列步骤 |

## 整理步骤

1. 按[共同约定](../pmspec-propose/references/requirement.md)定位当前需求，盘点正式资产、获准附件和其他文件。缺提案时报告缺失；缺原型时继续整理提案，标明原型对齐未检查。
2. 合并重复规则，清理聊天史和废弃方案，保留真实产品基线与仍有效的业务边界。逐项核对提案、画面和旁注。已有最终口径且仅修正文案或规则说明时可同步；需要新增画面、修交互或解决产品取舍时，指出位置与影响，交给用户选择相应阶段。HTML 变更按[增量验证](../pmspec-apply/references/incremental-review.md)重新验证。
3. 按[交付约定](../pmspec-apply/references/delivery.md)处理已授权的清理。报告实改内容、对齐结果、待确认和未检查项。状态与资产整理结果分别汇报。

## 需求元数据（唯一维护约定）

所有阶段使用[提案元数据规则](../pmspec-propose/references/requirement.md#需求元数据)。内容整理、原型审核或合入后保留产品发布状态。
