# 运行条件与独立审核

PMSpec 不依赖 OpenSpec、superpowers、jyopsx 或 proto-gen。套件自包含不等于宿主无需能力：

| 阶段 | 宿主能力 |
|---|---|
| explore | 对话；有资料时具备获授权的读取能力 |
| propose | 对话、读取与写入工作区 |
| apply | 文件读写、浏览器实测、独立子 Agent |
| review | 未启用，仅提示状态 |

HTML 打开无需 Node、Python、服务器或网络。内置资产嵌入脚本使用 Node.js 内置模块，无 npm 依赖；无 Node 可手工内嵌三份资产，不自动安装。

## Claude Code 安装

四个技能目录整体放到项目 .claude/skills/ 或用户 ~/.claude/skills/。apply 的 assets/、references/、scripts/ 和 agents/ 必须一起安装，不可只复制 SKILL.md。

agents/prototype-review.md 是随套件提供的定义，必须另外复制到项目 .claude/agents/prototype-review.md（用户级安装则放 ~/.claude/agents/）。不要覆盖已有同名文件或项目特化规则；先比对协调。详见仓库 docs/installation.md。

新建 agents 目录后应重启会话并确认 `prototype-review` 可调用。定义文件存在不等于已加载。审核 Agent 定义只允许 Read、Glob、Grep，不能写文件或执行 Bash；它使用源码与主 Agent 提供的浏览器证据，不假称自己进行了浏览器操作。

## 审核调用契约

主 Agent 实测后，向独立子 Agent 传入：

- 本次目标 HTML 的绝对路径及本次变更范围。
- proposal 绝对路径；审核套件内置示例时提供对应示例说明，不能伪称为产品批准需求。
- 已认可基准的绝对路径或明确“无，采用内置默认主题”。
- 当前安装的 apply 技能绝对路径，用于读取唯一的审核规则。
- 浏览器、视口、已测步骤、结果和未测项；截图或其他证据如有一并提供。

在当前任务内等待完整结果；不能把仍在运行的审核当已完成。修复后提供变更内容、新证据及上一轮必改项供复审。

宿主无命名 Agent 注册机制，但支持独立子 Agent 时，可以让新的独立子 Agent 完整读取随套件的 agents/prototype-review.md，按同一规则只读审核，并如实标注采用了提示定义模式及权限限制方式。它必须是另一个执行上下文，不是主 Agent 换角色自查。若环境或项目规定只允许命名 Agent，则遵守更严格规定，不以通用 Agent 绕过。

没有独立子 Agent、Agent 未加载且宿主不支持提示定义模式、无法读取审核规则、没有浏览器实测能力时，报告对应阻塞。可以保留草稿，但不得标记审核通过。人工代看也不能包装成内置审核。

## 可验证的完成含义

- 静态检查通过 ≠ 浏览器实测通过。
- 浏览器实测通过 ≠ 独立审核通过。
- 独立审核通过 ≠ 用户验收通过。
- 本机安装文件存在 ≠ 新会话技能加载成功。

每项结论注明实际做了什么，未做写 Not run 及原因。不为跑通流程擅自安装浏览器服务、修改 settings.json、申请扩大权限或创建平台 Agent。
