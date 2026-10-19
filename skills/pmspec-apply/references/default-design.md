# PMSpec 默认设计依据

仅用于没有项目依据、且本次获准使用默认主题的网页/桌面原型。不是 Claude/Genesis 品牌皮肤，不宣称移动端、深色模式或完整生产组件库支持。项目规范优先，默认只补获批准的缺口。

本文件解释实际样式，不另造一套参数。参数单一来源是 [theme.css](../assets/theme.css) 与 [shared.css](../assets/shared.css)，行为示例见 [example.html](../assets/example.html)。初始化快照记录所用 PMSpec 版本；样式升级不自动改项目基准或旧原型。

## 设计原则与分层

系统字体、清晰层级、中性表面与克制的交互强调，优先信息可读和状态可辨。产品层使用表面、文字、主操作与危险操作语义，不用颜色替代错误文字。

索引、旁注、评审 Tab、画布和展示外壳属于评审层；不把 body 的画布颜色、评审布局断点或 .app-window 尺寸当成生产页面规范。默认 .app-bar/.app-sidebar 只是示例骨架，项目不存在时不强塞入产品。

## 主题 token（当前仅 light）

| token | 值 | 用途 |
|---|---|---|
| --canvas | #eceef2 | 评审画布，非产品页面背景标准 |
| --surface | #ffffff | 产品面板、卡片、弹窗表面 |
| --muted | #f5f6f9 | 次级表面、悬停底色 |
| --text | #202434 | 正文及标题 |
| --text-muted | #5e6678 | 次级文字 |
| --border | #d8dce5 | 组件边框与分隔 |
| --primary | #5746c8 | 主操作、交互强调 |
| --primary-hover | #4434ac | 主按钮悬停 |
| --primary-soft | #eeeafd | 轻量强调底色 |
| --on-primary | #ffffff | 主按钮文字 |
| --danger | #b42336 | 危险操作及错误文字 |
| --danger-soft | #fff0f1 | 危险操作底色 |
| --focus | #7866e5 | 可见键盘焦点 |
| --radius | 12px | 卡片、弹窗等默认圆角 |
| --font | -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif | 系统 UI 字体与中文回退 |

## 字体与布局

| 来源 | 当前值 | 用途 |
|---|---|---|
| body | 14px / 1.65，var(--font) | 默认文字继承；产品可按批准依据覆盖 |
| h2 | 21px | 默认二级标题 |
| h3 | 16px | 默认三级标题 |
| .btn | font-weight: 600 | 操作文字 |
| .app-main | padding: 32px | 示例主内容区 |
| .toolbar | gap: 16px; margin-bottom: 24px | 标题与操作排列 |
| .field | margin-bottom: 20px | 表单字段间距 |
| .actions | gap: 10px; margin-top: 24px | 表单操作区 |

现有 CSS 使用多种间距，不宣称全部严格遵循 4px 或 8px 刻度。无独立展示/代码字体，不从外网加载字体。标题、容器与页面密度按实际产品场景采用，不把示例视作所有产品的强制布局。

## 默认组件

以下是实际样式摘要，不是已实现所有状态的承诺。行为查看示例，未提供的项目组件/加载状态须按本需求补全，不编造成现有能力。

| 来源 | 当前样式/状态 | 复用边界 |
|---|---|---|
| .btn | padding: 9px 16px; gap: 6px; border-radius: 8px; border: 1px solid var(--border) | 基础按钮；hover 次级表面，disabled opacity .5 |
| .btn-primary | 主色填充、主色边框、反白文字 | hover 使用 --primary-hover |
| .btn-danger | 危险色文字、浅危险底色 | 危险动作仍需需求定义的行为与确认 |
| .card | padding: 20px; border-radius: var(--radius); border: 1px solid var(--border) | 普通内容卡片 |
| .badge | padding: 3px 9px; border-radius: 6px; font-size: 12px | 默认强调标识，不冒充完整语义状态色系 |
| .input | padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border) | aria-invalid="true" 显示危险色边框 |
| .error | margin: 8px 0 0; font-size: 13px | 错误文字，不只依靠红色 |
| .notice | padding: 12px 16px; border-radius: 8px | 说明/模拟提示 |
| .overlay | padding: 28px; background: #20243459 | 原型外壳内的叠加背景 |
| .dialog | width: 420px; max-width: 100%; padding: 28px; border-radius: var(--radius); box-shadow: 0 16px 48px #20243430 | 弹窗，默认不超出外壳 |
| .drawer | width: min(380px, 80%); padding: 28px; box-shadow: -8px 0 32px #20243420 | 原型外壳内右侧抽屉 |

项目组件文件可引用本表与实际 CSS，只补选用变体及差异，不要求把全部默认组件复制成独立文档。

## 响应式、焦点与动效

- `:focus-visible` 使用 3px solid var(--focus)，outline-offset: 3px；保留可见焦点。真实交互的键盘/焦点恢复仍需按需求验证。
- shared.css 在 1450px 以下将评审旁注移到下方；850px 以下重排评审索引并隐藏示例产品侧栏、缩小主区内边距。这些是示例和评审工具行为，不代表项目移动导航已实现。
- prefers-reduced-motion: reduce 时禁用平滑滚动。没有统一悬停上浮或复杂动画体系。
- 不声明已满足某无障碍等级；对比度、键盘、触控目标和叠加层焦点在实际原型范围内检查，未做列 Not run。通用规范模板中的检查视角不自动成为“默认已实现”。

## Do / Don't

- 有项目依据时保真映射组件变体、图标/关闭控件与页面骨架，不只换色值。
- 只在产品根容器作用域适配，不污染评审索引、旁注或评审 Tab。
- 未获批准不新增深色主题、正式 LOGO、外部字体依赖或生产导航。
- 新页面/弹窗/抽屉按套件规则平铺；评审切换控件不能冒充产品功能。
