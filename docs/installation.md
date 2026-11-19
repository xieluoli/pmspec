# 安装与升级

在目标产品 workspace 使用 [README 安装提示](../README.md#开始)，或从可信完整来源直接运行下方脚本。调试工作区版本时指定实际本地副本；线上仓库引用以其已发布内容为准。

## 安装命令

脚本只需 Node.js 内置模块。先执行 `--check` 预检，无冲突后执行部署：

```sh
node /path/to/source/skills/pmspec-init/scripts/install.mjs --host claude --workspace /path/to/product --check
node /path/to/source/skills/pmspec-init/scripts/install.mjs --host claude --workspace /path/to/product
```

| 宿主 | `--host` | 技能目录 | 审核 Agent |
|---|---|---|---|
| Claude Code | `claude` | `.claude/skills/` | `.claude/agents/prototype-review.md` |
| Codex | `codex` | `.agents/skills/` | `.codex/agents/prototype-review.toml` |

两种宿主均安装六个技能及对应审核定义。Claude Code 使用 `/pmspec-…`，Codex 使用 `$pmspec-…`。两种宿主的显式调用策略分别由 skill front matter 与 `agents/openai.yaml` 配置。参见 [Claude Code 技能](https://code.claude.com/docs/en/skills)及 [Codex 技能](https://learn.chatgpt.com/docs/build-skills)。

预检只读。部署仅复制缺失文件；不同内容、额外文件或符号链接在写入前报告。部署文件可能显示为 Git 未跟踪文件，索引和历史保持原状。写入时发生并发冲突或磁盘错误，按实际结果报告部分部署。

## 验证当前宿主

1. 核对脚本给出的技能、审核 Agent 和来源版本。
2. 在宿主发现技能后，由用户运行 `/pmspec-review --check` 或 `$pmspec-review --check`。新技能尚未出现时，重开会话后验证。此命令只返回职责和支持状态。
3. 按[运行契约](../skills/pmspec-apply/references/runtime.md)调用命名审核 Agent 做只读规则冒烟，并检查浏览器可用性。区分文件已部署、技能已发现、已实际引用与未验证事项。

纯粹预检到第一个命令为止。产品项目已具备正式设计入口时直接沿用；需要新建设计基准时按[设计初始化](../skills/pmspec-init/references/design-system.md)确认写入范围。Apply 可以直接使用其内置兜底。浏览器或命名审核缺失时，可保留原型草稿。

## 升级

用新来源做预检。存在内容冲突时审阅差异、确认替换范围，再更新技能副本与命名审核定义。升级后复核运行时发现。原型文件的更新由具体需求授权；经典原型的公共资产回填方法见[原型结构](../skills/pmspec-apply/references/prototype.md)。
