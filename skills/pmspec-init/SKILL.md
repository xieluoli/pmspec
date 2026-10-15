---
name: pmspec-init
description: 在当前产品 workspace 初始化 PMSpec 的五个技能及 prototype-review 独立审核子 Agent，按 Claude Code 或 Codex 注册并验证可引用性；不创建产品需求，不覆盖已有配置。
argument-hint: "[claude|codex]"
disable-model-invocation: true
---

# PMSpec · Init

中文交流。将 PMSpec 安装到当前产品 workspace，让后续阶段可以被宿主正常引用。本技能不是产品 explore，也不自动开始需求讨论。

参数是用户提供的宿主名称，可省略。Claude Code 中用 `/pmspec-init`，Codex 中用 `$pmspec-init`；读取调用中的自然语言参数，不依赖某个宿主独有的变量替换。

## 第一次尚未安装怎么办

用户可复制仓库 README 的初始化文本，让 Agent 获取官方仓库完整副本，再直接读取本文件执行；此时不声称技能已经注册。完成后 init 自身也安装，可用于以后检查或在新的 workspace 初始化。

## 1. 确定目标和权限

- 从运行时信息确认当前宿主及产品 workspace，不能只按目录里有 .claude 或 .codex 推断宿主。目标或宿主有歧义时一次问一个问题，不自行选其他项目。
- 支持具备文件工作区的 Claude Code / Codex。其他宿主先报告未适配；不为普通网页聊天伪造技能安装。
- 用户调用 init 授权在所确认 workspace 新增本套件技能与 Agent 文件，不授权覆盖既有不同内容、不授权改用户全局配置、权限、MCP、模型或依赖。
- 先读项目规则及 git 状态，保护已有改动。不绕过托管平台的工作区或 Agent 注册限制；不自动提交、推送或合 main。

## 2. 获取完整的同一版本来源

优先使用用户指定的可信 PMSpec 副本或当前已安装的五个同版本技能。没有完整来源时，从 `https://github.com/xieluoli/pmspec` 获取完整快照，记录实际 commit。不要只下载 SKILL.md；Apply 的模板、资产、规范与审核定义必须齐全。

不得把下载到的命令直接管道交给 shell。先查看本技能的 scripts/install.mjs 及相关定义，确认来源和写入范围。来源不能访问或权限不足时报告阻塞，不安装近似同名包、不改用未知镜像。

README 首次引导应让 Agent 将来源放在当前 workspace 内不冲突的独立目录，不能覆盖已有源码、产品 pmspec/changes/ 或他人文件。若当前目录本就是本套件仓库，直接使用，不重复 clone。

## 3. 安装前预检与安装

先确认 Node.js 可用；安装脚本只用内置模块，无 npm 包。不可用则报告初始化阻塞，不自动安装运行时，也不声称安装完成。HTML 打开本身不需要 Node。

定位本 SKILL.md 所在目录，令下面的 `<INIT_DIR>` 为该目录的真实绝对路径，`<WORKSPACE>` 为已确认产品目录，不把占位符原样执行：

```sh
node "<INIT_DIR>/scripts/install.mjs" --host claude --workspace "<WORKSPACE>" --check
node "<INIT_DIR>/scripts/install.mjs" --host claude --workspace "<WORKSPACE>"
```

Codex 把两处 `claude` 改为 `codex`。不默认同时装两种宿主；用户明确要两种时分别执行。

```text
Claude Code workspace                 Codex workspace
.claude/                             .agents/skills/
├── skills/                          ├── pmspec-init/
│   ├── pmspec-init/                  ├── pmspec-explore/
│   ├── pmspec-explore/               ├── pmspec-propose/
│   ├── pmspec-propose/               ├── pmspec-apply/
│   ├── pmspec-apply/                 └── pmspec-review/
│   └── pmspec-review/                .codex/agents/
└── agents/prototype-review.md        └── prototype-review.toml
```

脚本按完整目录检查：同内容保持不变；不同内容、额外文件或符号链接视为冲突，写入前整批停止，不强行覆盖。--check 只预检不创建目录。项目特化不可静默抹掉；冲突时说明位置并请用户决定如何协调，不自动换名称绕过。

只注册随套件提供的命名 Agent，不创建平台层 Agent，不自动改 config.toml、settings.json、CLAUDE.md、AGENTS.md 或其他项目指令。旧版本宿主若不支持上述方式，报告版本适配阻塞，不能擅自改为未知旧配置。

## 4. 验证可引用性（不能跳过）

安装脚本只能证明文件完整，不证明宿主已加载。安装后按顺序：

1. **文件核对**：五个技能全部存在，支持文件与来源一致；Agent 名为 prototype-review。记录来源 commit 或“本地来源，commit 未核实”。
2. **技能发现**：用宿主可用的技能列表/选择器核对五项。Claude Code 新建 Agent 目录后可能需重启；Codex 更新未显示时重启。没有发现接口时明确未验证，不能编造列表。
3. **安全引用检查**：仅调用 `pmspec-review`，确认返回“需求预审规则尚未启用”，不执行 explore/propose/apply，不创建需求文件。托管环境不允许当前会话加载新技能时，给新会话的检查指令，标为待重启验证。
4. **独立 Agent 冒烟**：显式启动命名的 `prototype-review`，让它只读其收到的 apply 技能路径下 references/review-checklist.md，返回实际标题及其必改结论规则。检查其为独立执行上下文，当前任务取得结果。此次仅检查注册和读取，不是原型审核，不能让它返回“原型可交付”。
5. **浏览器能力**：检查宿主是否已有可用浏览器工具；未进行浏览器操作时标“已发现、未实测”。没有就列 Apply 阻塞，不自动安装浏览器、修改 MCP 或放宽权限。

Claude Code 定义通过 Read/Glob/Grep 工具白名单限制写入。Codex 自定义 Agent 继承宿主权限，只读是开发者指令约束，不能伪称独立只读沙箱；需要强隔离的项目须遵守其额外要求。

不能因磁盘文件齐全就宣称可引用，不能主 Agent 换角色冒充独立 Agent，不能调用其他宿主 CLI 或全局凭据绕过当前环境注册/权限限制。

## 5. 交付就绪清单

分别列出：宿主/workspace、来源版本、五技能部署、技能发现、安全引用检查、独立 Agent 冒烟、浏览器情况、未完成项和下一步。只用有证据的状态：已部署、已验证、待重启、未验证、阻塞。

只有技能发现、安全引用和独立 Agent 冒烟实际通过，才说“技能与审核 Agent 已可引用”；Apply 是否就绪还需浏览器条件。部分未通过时保留已部署文件，不自动回滚或宣称成功。

最后推荐当前宿主可直接使用的 Explore 命令，不自动执行。后续阶段各自的人工批准不因 init 通过而省略。
