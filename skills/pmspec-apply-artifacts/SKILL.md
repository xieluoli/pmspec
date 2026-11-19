---
name: pmspec-apply-artifacts
description: PMSpec 的默认原型阶段。将已批准 proposal 制作为单文件 Artifacts 交互画板，按用户路径平铺页面与状态，支持连续体验、组件悬浮旁注和母版复用，并执行浏览器验证与独立审核。
argument-hint: "[需求名]"
disable-model-invocation: true
---

# PMSpec · Apply Artifacts

Claude Code 使用 `/pmspec-apply-artifacts 需求名`，Codex 使用 `$pmspec-apply-artifacts 需求名`。从 `$ARGUMENTS` 或自然语言读取需求名。阶段由用户选择；明确指定经典排版时用 [pmspec-apply](../pmspec-apply/SKILL.md)。

## 先走一遍用户流程

1. 按[共同约定](../pmspec-propose/references/requirement.md)核对需求根目录、获准规则和正式入口。按[交付约定](../pmspec-apply/references/delivery.md)处理候选稿、正式入口和已审阅历史。
2. 按[设计交接](../pmspec-apply/references/design-context.md)选择项目规范或内置主题。既有页面只画本次变化及走通流程所需的上下文。
3. 先按 [流程与状态](references/board.md) 列出用户从哪里开始、点什么、到哪一页、如何完成和返回，再列各步适用状态与异常恢复。用这张路径表决定画板顺序、模拟数据和验证用例。局部修订按 [增量验证](../pmspec-apply/references/incremental-review.md) 确定影响面。

## 制作画板

- **全貌**默认可见。按实际用户路径分区，同一页面或步骤的状态紧邻，依次展示有数据常态、空数据、异常、加载等适用状态。用分区标题和锚点定位；关键状态直接平铺。每幅图右上放「进入体验」，打开对应页面及状态。具体分支、状态取舍和设备边界见 [画板规范](references/board.md)。
- **体验**从真实产品控件走完整主流程，支持返回、取消、失败恢复等适用分支。评审场景可复现，重置后回到进入时的场景。真实产品动作与评审工具各有位置，模拟范围在评审层标明。
- **旁注**默认收起，悬停或键盘聚焦相关组件后显示当前规则并描边；触屏提供等价入口。气泡用短标题、可选适用范围和逐条规则，按 [旁注规范与样板](references/annotations.md) 写清展示边界、触发条件、状态与恢复。实测气泡在画布与视口中的可读性。
- **母版**集中在同一个 HTML。设备外壳、页面骨架、共用组件和规则各有一处定义；全貌与体验调用同一套渲染，分别使用独立的状态实例。可从 [可运行样板](assets/example.html) 起步，替换示例流程和文案。完整 HTML 可离线双击打开，CSS、JS 及必需素材全部内嵌。

## 验证与交付

1. 按 [运行契约](../pmspec-apply/references/runtime.md) 使用浏览器打开交付 HTML。实测图示锚点、从画板进入的状态、从真实入口走到完成、异常恢复、返回及重置；同时检查桌面和窄屏、旁注边缘与关闭、设备内滚动、控制台和离线外部请求。记录当前文件版本、步骤、结果及未测项。
2. 按运行契约调用命名 `prototype-review` 并等待完整报告，交审写明 Artifacts 及两个 Apply 技能的绝对路径。修复必改项后复测并交回复审。缺当前浏览器证据或有效独立审核时以草稿交付。
3. 默认交付当前提案与一个自包含 HTML。提案、画面和旁注同步本次批准的变更。汇报入口、实测、独立审核、未验证项和待验收事项。过程证据与已审阅版本按[交付约定](../pmspec-apply/references/delivery.md)保留。
