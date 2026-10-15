# 初始化与运行条件

## 首次使用

在目标产品 workspace 的 Claude Code 或 Codex 中，复制 [README 初始化文本](../README.md#一键初始化复制给-agent)。它让 Agent 取得可信来源并读取 [pmspec-init](../skills/pmspec-init/SKILL.md)，不要求技能事先存在。

```text
README 文本 -> 获取完整来源 -> 读取 init -> 宿主适配 -> 预检与部署
                                                          |
                               技能发现 + 安全引用 + 独立 Agent 冒烟
                                                          |
                                             报告已验证 / 待重启 / 阻塞
```

支持具有文件工作区的 Claude Code 与 Codex（CLI / 具备相应能力的开发环境）；不包含 ChatGPT 普通网页聊天。不承诺旧版本、托管环境或无独立子 Agent 的环境具备同等能力。

## 宿主适配

| 项目 | Claude Code | Codex |
|---|---|---|
| workspace 技能目录 | `.claude/skills/` | `.agents/skills/` |
| 引用技能 | `/pmspec-init`、`/pmspec-explore` 等 | `$pmspec-init`、`$pmspec-explore` 等；`/skills` 选择器 |
| 独立 Agent | `.claude/agents/prototype-review.md` | `.codex/agents/prototype-review.toml` |
| 只读约束 | Read/Glob/Grep 工具白名单 | 开发者指令只读，权限继承父会话，不是独立只读沙箱 |
| 加载检查 | 检查技能和 Agent 是否出现，新 Agent 目录可能需重启 | 检查技能与自定义 Agent 是否出现，未发现时重启；旧版本可能不支持此 Agent 格式 |

技能的逻辑名称统一，输入方式遵循当前宿主，不声称 Codex 的 `/pmspec-init` 是原生命令。没有发现接口时可待新会话验证，不能捏造成功。不要用其他宿主 CLI 或全局凭据绕过当前托管环境权限。

官方依据：[Claude Code 技能](https://code.claude.com/docs/en/skills)、[Claude Code 子 Agent](https://code.claude.com/docs/en/sub-agents)、[Codex 技能](https://learn.chatgpt.com/docs/build-skills)、[Codex 子 Agent](https://learn.chatgpt.com/docs/agent-configuration/subagents)。按实际宿主版本核对；版本不支持应报告阻塞，不擅自迁移配置。

## 安装脚本（init 使用，无需用户手工复制）

脚本仅使用 Node.js 内置模块，不安装 npm 包。先审阅可信副本中的脚本；在已确认的 workspace 执行，不能对未知内容直接下载后管道执行。

```sh
node /path/to/source/skills/pmspec-init/scripts/install.mjs --host claude --workspace /path/to/product --check
node /path/to/source/skills/pmspec-init/scripts/install.mjs --host claude --workspace /path/to/product
```

Codex 使用 `--host codex`。目标必须为已存在、获授权的产品 workspace。脚本从自身相邻目录读取同一套五个技能，包含完整支持文件；已安装的 init 也能从同一安装目录取得其他技能。仅传入一个宿主，不自动同时部署。

- `--check`：全量预检，无文件写入。
- 首次部署：复制五个技能及当前宿主的审核 Agent 定义。
- 重复部署：相同内容不动；不同内容、额外文件或符号链接冲突时，在写入前整批停止，交给用户协调。
- 不修改全局配置、config.toml、settings.json、CLAUDE.md、AGENTS.md、项目规则、现有产品需求或 Git 状态。
- 写入时若发生并发文件冲突或磁盘错误，报告实际部分状态，不自动清理他人文件，不宣称事务回滚。
- Node 不可用则报告 init 阻塞，不自动安装。打开生成的 HTML 本身不需要 Node。

## 部署不等于可引用

Init 必须报告下列证据，不能用“复制成功”代替：

1. 五个技能与宿主专用 Agent 定义部署完整。
2. 宿主技能列表/选择器可发现五项。
3. 仅安全引用 pmspec-review，收到“需求预审规则尚未启用”，不创建产品需求。
4. 独立启动命名 prototype-review，读取审核清单并返回实际规则摘要；这是注册冒烟，不是原型审核。
5. 浏览器工具是否可用；未操作则标记“已发现、未实测”。

缺发现能力或需重启时，标待验证并提供下一会话操作。未做运行时检查不可宣称“技能与审核 Agent 已可引用”。不自动开始 explore、立项、生成原型、提交或推送。

## Apply 所需能力

无需外部需求框架或技能包。Init 的安装授权不延伸为安装浏览器、修改 MCP、模型或权限的授权。

| 内容 | 必需能力 |
|---|---|
| init | 工作区读写、Node.js、可信完整来源；发现和调用需要宿主支持 |
| explore | 对话，按需读取获授权资料 |
| propose | 读取及写入目标 workspace |
| apply | 文件读写、浏览器实测、独立审核子 Agent |
| review | 仅保留入口，未启用正式预审 |
| HTML 打开 | 普通浏览器，无服务器、网络或构建工具要求 |

浏览器与审核调用约定见 [运行契约](../skills/pmspec-apply/references/runtime.md)。缺能力可以保留草稿，但不能宣布 Apply 审核通过。

## 更新与冲突

新版与已安装内容不同会被脚本阻止，用户先审阅差异并批准替换范围；不提供自动强制覆盖，不静默清理旧文件。部署新版后重新检查运行时发现。

共享原型资产变化时，仅对本次授权 HTML 重新嵌入：

```sh
node /path/to/installed/pmspec-apply/scripts/embed-assets.mjs pmspec/changes/需求名/prototypes/index.html
```

更新原型后重跑受影响的实测与独立审核。注册冒烟、原型审核、用户验收分别记录。
