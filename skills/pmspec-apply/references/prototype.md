# 原型结构与组件

## 结构契约

```text
.proto-layout
├── .toc-sidebar（唯一，链接每个 section）
└── .sections-col
    ├── section.proto-stack #screen-list
    │   ├── 标题与可选评审子 Tab
    │   └── .proto-with-prd
    │       ├── .app-window（一个外壳，内部切轻量状态）
    │       └── .prd-panel（仅此画面的功能概览）
    └── section.proto-stack #screen-create
        ├── 独立标题
        └── .proto-with-prd
            ├── .app-window（底层 + 默认可见的弹窗）
            └── .prd-panel
```

索引属于评审工具，不是产品导航。所有新页面/弹窗/抽屉/流程步骤默认平铺可见，不用点击才能发现。轻量状态的子 Tab 放在外壳之外，标明“评审状态”，不伪装成产品 Tab。

每个 section 的 ID 唯一且语义明确；可见编号与索引一致。跨文件链接用相对路径，不能只有本机绝对路径。结构尺寸随产品调整，不要求固定 macOS 或某个屏幕大小。

## 组件索引

默认样式定义在 ../assets/shared.css，完整可操作用法见 ../assets/example.html。项目有设计依据时先按 [设计交接约定](design-context.md) 复用其组件变体与页面骨架，内置产品样式只是兜底；自包含 HTML 可保真映射，不强制引入生产框架。确有页面专有布局再新增类名，不禁止合理的新组件，也不要求为了复用而曲解语义。

| 类名 | 用途 |
|---|---|
| proto-layout / toc-sidebar / sections-col | 评审布局与共享索引 |
| proto-stack / proto-with-prd / prd-panel | 单画面与一份旁注 |
| review-tabs / review-tab | 评审轻量状态切换，非产品功能 |
| app-window / app-bar / app-body | 网页/桌面默认外壳 |
| app-sidebar / app-main | 产品导航与主区 |
| btn / btn-primary / btn-danger | 按钮及主操作、危险操作 |
| card / item-row / badge | 内容卡片、列表行、状态标识 |
| field / input / error / notice | 表单、错误和提示 |
| overlay / dialog / drawer | 默认可见的叠加层、弹窗、抽屉 |

套件默认主题在 ../assets/theme.css 维护；本次项目适配在 HTML 注入标记外按产品根容器隔离/覆盖，检查全局样式及变量继承对最终画面的影响。未获授权不改组织级样式、套件公共资产或宿主配置。

## 自包含资产

每个 HTML 的 head 中各有一对标记：

```html
<!-- @pmspec:theme:start -->
<!-- @pmspec:theme:end -->
<!-- @pmspec:shared:start -->
<!-- @pmspec:shared:end -->
<!-- @pmspec:runtime:start -->
<!-- @pmspec:runtime:end -->
```

embed-assets.mjs 从本技能相邻 assets/ 读取文件，分别以内嵌 style/style/script 回填。页面专有 style/script 写在标记外。脚本只改明确传入的文件，不扫描项目、不访问网络；共享资产有变化后，对本次获授权的原型重新回填即可。不要批量刷新其他需求。

默认使用本机系统字体，图标使用内嵌 SVG 或文字。必要图像内嵌 data URL；交付后不存在本地 CSS、JS、字体、图片依赖。

## 脚本与数据

按 section 限定查询和交互，ID 不跨屏重用。相同业务对象如果跨屏联动，保持一致；独立状态快照明确标为演示快照，不假装同步。状态数据单一来源，避免两套清单漂移，不强制“数据只能存 DOM”。输入内容用 textContent 等安全方式显示，不拼接用户输入到 innerHTML。

模板自带评审 Tab 与跳转；业务交互按已批准规则实现。不可用的演示入口须说明，不留无反馈的可点击按钮。评审属性、切换控件和演示脚本是原型工具，不能直接当生产代码交付。
