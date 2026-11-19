---
name: pmspec-init
description: 在 Claude Code 或 Codex 的产品工作区预检、安装 PMSpec 与独立审核 Agent，按需初始化设计基准。
argument-hint: "[claude|codex] [--check]"
disable-model-invocation: true
---

# PMSpec · Init

在目标产品 workspace 安装 PMSpec 和命名审核 Agent。参数可指定 `claude`、`codex` 和 `--check`。从运行时辨认宿主，目录重名时询问目标。

## 安装

1. 使用现有可信完整副本。首次安装需要时，从 `https://github.com/xieluoli/pmspec` 获取独立来源并记录版本。只检查时使用现成副本；来源缺失则报告。先审阅 [install.mjs](scripts/install.mjs) 的写入范围。
2. 执行预检，再部署到确认的宿主。用本技能相邻的脚本路径：`node "<本技能目录>/scripts/install.mjs" --host <claude|codex> --workspace "<目标目录>" --check`，部署时移除 `--check`。用户只要求检查时到预检为止。内容冲突或额外文件先报告；已安装内容、全局配置和产品文件保留。
3. 部署后检查技能发现和命名 `prototype-review` 规则读取。冒烟返回六个评分维度及满分、通过条件与末行格式，无需评分。安全引用请用户在已加载技能的会话运行 `/pmspec-review --check`（Claude Code）或 `$pmspec-review --check`（Codex）；未实际收到结果时标待验证。按[宿主契约](../pmspec-apply/references/runtime.md)注明浏览器可用性和未验证项。

## 项目设计基准

已有设计入口可沿用。需要建立或补充基准时，按[项目设计初始化](references/design-system.md)读取来源，记录采用范围，向用户确认拟写内容。未确认时保留部署结果，Apply 可按其规范使用内置兜底。

交付宿主和 workspace、来源版本、部署与实际可引用状态。只安装或检查时不进入产品需求阶段。
