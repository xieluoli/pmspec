# 安装与运行条件

## 适用范围

首版提供 Claude Code 的文件式安装方式；其他宿主只有支持技能文件、工作区读写、浏览器和独立子 Agent 才能完成同等流程。未验证的平台不承诺开箱即用。无需 OpenSpec、jyopsx、superpowers、proto-gen 或 npm 包。

| 使用内容 | 必需能力 |
|---|---|
| explore | 对话，按需读取用户授权资料 |
| propose | 读取及写入目标 workspace |
| apply | 读写文件、浏览器实测、独立审核子 Agent |
| review | 仅保留入口，未启用审查 |
| 资产嵌入 | Node.js 内置模块；缺少时可手工内嵌，不自动安装 |
| 打开交付 HTML | 普通浏览器；无服务器、网络或构建工具要求 |

## 项目级安装（推荐）

以下命令由用户在本地执行，不是技能运行中自动修改宿主的授权。先取得本仓库的一份完整副本，设 `SOURCE` 为该副本的绝对路径，进入要使用 PMSpec 的产品 workspace。不要把仓库检出位置误认成产品产物目录。

先确认目标不存在同名技能或 Agent；若已有文件，应比对协调后更新，**不能直接覆盖项目特化规则**。以下命令先完整检查冲突，再复制：

```sh
SOURCE=/absolute/path/to/pmspec
# 先 cd 到目标产品 workspace，再执行：
(
  set -eu
  for skill in pmspec-explore pmspec-propose pmspec-apply pmspec-review; do
    test -f "$SOURCE/skills/$skill/SKILL.md" || { echo "源目录不完整：$skill"; exit 1; }
    if test -e ".claude/skills/$skill" || test -L ".claude/skills/$skill"; then
      echo "已有技能，需先比对：$skill"; exit 1
    fi
  done
  test -f "$SOURCE/skills/pmspec-apply/agents/prototype-review.md"
  if test -e .claude/agents/prototype-review.md || test -L .claude/agents/prototype-review.md; then
    echo "已有审核 Agent，需先比对"; exit 1
  fi
  mkdir -p .claude/skills .claude/agents
  for skill in pmspec-explore pmspec-propose pmspec-apply pmspec-review; do
    cp -R "$SOURCE/skills/$skill" .claude/skills/
  done
  cp "$SOURCE/skills/pmspec-apply/agents/prototype-review.md" .claude/agents/
)
```

所有支持文件与技能一起复制，不仅是 SKILL.md。重启会话，确认四个 `/pmspec-*` 命令和 `prototype-review` 已加载；**磁盘上存在文件不等于宿主加载成功**。在 Multica 等托管环境使用平台支持的技能/Agent 配置入口，不能仅凭复制文件承诺运行时已加载。

用户级安装可将 `.claude/skills/` 与 `.claude/agents/` 替换为 `~/.claude/skills/` 与 `~/.claude/agents/`，冲突检查及重启步骤相同。不要两处各装不同版本；项目副本优先时须确认实际使用的是哪份。

## 原型审核 Agent

随库定义在 [prototype-review.md](../skills/pmspec-apply/agents/prototype-review.md)。它只允许 Read、Glob、Grep，不能写文件或执行命令。审核规则在安装后的 apply 技能内部，不依赖开发者机器上的私有路径。

主 Agent 负责浏览器实测，审核 Agent 读取其证据并独立检查源码/提案。调用时必须提供目标、proposal、基准、apply 技能绝对路径及实测证据；详见 [审核运行契约](../skills/pmspec-apply/references/runtime.md)。主 Agent 取得完整结果后才交付。

无命名注册机制的宿主可按运行契约用独立子 Agent 读取同一定义，但必须如实说明模式，遵守宿主与项目的更严格限制。没有独立执行上下文时，不能让主 Agent 自查后声称独立审核通过。

## 浏览器与缺失能力

浏览器实测工具由宿主提供，例如已配置的浏览器 MCP；PMSpec 不自动安装服务、修改 settings.json 或申请扩大权限。可以直接打开 file URL；工具不支持时使用获授权的本地预览方式，并在任务内关闭本次启动的临时服务。

缺浏览器、未加载审核 Agent 或无法读取完整规则时：说明阻塞，可保留原型草稿，但不能标为通过。不要“先跳过再假定可用”。

## 更新

更新前对比已安装文件与当前版本，保留项目特化。共享资产变化后仅刷新本次授权的 HTML：

```sh
node /path/to/installed/pmspec-apply/scripts/embed-assets.mjs pmspec/changes/需求名/prototypes/index.html
```

脚本无需依赖安装；它只替换目标文件三对内嵌标记，页面自有代码不受影响。更新原型后重跑受影响实测及独立审核，不能沿用旧结论。
