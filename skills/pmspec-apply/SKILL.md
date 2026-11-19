---
name: pmspec-apply
description: 按显式选择的经典排版，将已批准需求制作为自包含 HTML 原型，包含平铺页面、功能概览、浏览器实测和独立审核。
argument-hint: "[需求名]"
disable-model-invocation: true
---

# PMSpec · Apply（经典排版）

显式调用时使用经典排版。默认入口是 [Apply Artifacts](../pmspec-apply-artifacts/SKILL.md)。输入为 `$ARGUMENTS` 中的需求名和获准的提案或修订范围。

1. 按[共同约定](../pmspec-propose/references/requirement.md)核对需求根目录、获准规则和当前入口。按[设计交接](references/design-context.md)选项目规范或内置主题。局部修改先核对[基线和影响面](references/incremental-review.md)。
2. 从[模板](assets/template.html)起步。页面、弹窗、抽屉和不同流程步骤独立平铺，一个索引定位各图，每图有画面和匹配的功能概览。仅局部状态可用评审子 Tab。细节见[原型结构](references/prototype.md)、[功能概览](references/annotations.md)和[示例](assets/example.html)。
3. 用[运行契约](references/runtime.md)完成浏览器实测、命名审核 Agent（强制卡点）和必要复审。查看全部索引、适用状态、真实操作、恢复路径和最终样式。样例和外部结果使用清楚标记的模拟数据。
4. 交付一个可离线打开的自包含 HTML。经典模板的主题、样式及脚本用 [embed-assets.mjs](scripts/embed-assets.mjs) 内嵌。按[交付约定](references/delivery.md)保护历史，反馈当前原型、实测、独立审核和待验收事项。缺证据或有效审核时标为草稿。
