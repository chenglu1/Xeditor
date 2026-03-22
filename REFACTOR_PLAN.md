# Xeditor Editor Refactor Plan

## 1. 文档目的

本文档用于指导当前仓库中 `packages/editor` 的渐进式重构。

目标不是一次性推倒重来，而是在保证现有演示站和组件库可用的前提下，逐步把编辑器从“功能集中在单一入口、扩展逻辑高度耦合”的状态，重构为“结构清晰、可验证、可演进”的实现。

本文档只针对当前仓库真实状态生效，不复用其它项目或历史版本的实施记录。

## 2. 当前仓库快照

### 2.1 仓库结构

当前仓库是一个 `pnpm` monorepo：

- `apps/web`
  - 演示站，使用 Vite + React + MUI
  - 开发态通过 Vite alias 直接引用 `packages/editor/src`
- `packages/editor`
  - 对外发布的编辑器组件库
  - 当前核心源码集中在 `src/`

### 2.2 当前编辑器核心文件

当前关键实现主要集中在以下文件：

- `packages/editor/src/ConfigurableTiptapEditor.tsx`
- `packages/editor/src/components/SingleViewEditor.tsx`
- `packages/editor/src/components/DualViewEditor.tsx`
- `packages/editor/src/components/EditorToolbar.tsx`
- `packages/editor/src/extensions/createEditorExtensions.ts`
- `packages/editor/src/extensions/enhanced/*`
- `packages/editor/src/lib/upload-utils.ts`
- `packages/editor/src/types.ts`

### 2.3 当前代码事实

截至 2026-03-22，当前仓库具备以下事实：

- `ConfigurableTiptapEditor` 仍是“大一统”入口，同时承担 props 兼容、editor 初始化、内容同步、toolbar 配置、单双视图切换。
- `DualViewEditor` 内部维护 `textareaValue` 本地真相源，外部 `value` 与内部 source panel 同步并不闭合。
- `dualView` 仍允许和 `contentType="html"` 组合，契约不收敛。
- Markdown 能力仍通过 `EnhancedMarkdown`、`TextAlignWithMarkdown`、`OrderedListWithStart` 等扩展链式 patch `manager.parse/serialize`。
- toolbar 各按钮和浮动工具较多使用各自的 `selectionUpdate` / `transaction` 监听。
- 上传工具仍带默认上传地址，以及 `localStorage` 中 `token` / `tenantId` 的业务耦合。
- `packages/editor/src/dist` 目录仍存在于源码树内。
- 当前仓库尚未看到稳定的包内测试体系；现有可见的自动化验证主要是构建和 bundle smoke test。

### 2.4 当前基线验证

本轮审计确认：

- `corepack pnpm build` 当前可通过。
- `packages/editor` 当前并不存在文档里曾声称已完成的 `core/`、`adapters/`、`views/` 分层落地。
- 因此后续实施必须以当前代码现状为准，不能依赖旧文档中的“已完成”记录。

## 3. 当前主要问题

### 3.1 架构耦合

1. `ConfigurableTiptapEditor.tsx` 职责过多，难以演进。
2. `SingleViewEditor` 与 `DualViewEditor` 的容器、样式、能力边界不一致。
3. 只读展示仍沿用完整 editor shell，缺少独立 viewer 边界。

### 3.2 状态契约不清

1. `dualView` 的真实含义是 Markdown source 模式，但类型和运行时都未明确收口。
2. `DualViewEditor` 的 `textareaValue` 与外部受控 `value` 之间可能漂移。
3. `onChange` 的触发来源没有统一建模，模式切换和外部同步边界模糊。

### 3.3 Markdown 管线脆弱

1. 多个扩展同时 patch parse/serialize，依赖注册顺序。
2. 预处理和后处理以字符串启发式规则为主，边界保护不足。
3. Markdown round-trip 缺少保护网，不利于安全重构。

### 3.4 性能与订阅成本

1. toolbar 状态分散在多个 hook 中，各自监听 editor 事件。
2. dual-view 下每次源码输入都会触发整篇 `setContent`，大文档风险高。
3. 只读预览初始化完整 editor，不划算。

### 3.5 工程卫生

1. 源码树内存在 `src/dist`。
2. 文档和实现之间已有漂移风险。
3. 测试基线不足，导致中大规模重构难以控风险。
4. 上传默认实现仍是业务耦合实现，不适合作为公共组件默认行为。

## 4. 重构目标

### 4.1 功能目标

重构过程中必须保证以下能力不退化：

- Markdown 内容输入、回显、导出
- HTML 内容输入、回显、导出
- 单视图编辑
- Markdown 双视图编辑
- 图片上传
- 表格、公式、链接、高亮、上下标、对齐、列表等能力
- 只读展示
- 字数限制

### 4.2 架构目标

重构完成后，希望编辑器至少形成以下边界：

1. `core`
   - editor 初始化
   - 外部值同步
   - toolbar 配置
   - 视图切换状态
2. `adapters`
   - markdown 输入输出适配
   - html 输入输出适配
   - 后续 viewer 适配
3. `views`
   - 单视图编辑
   - 双视图编辑
   - 只读 viewer
4. `features`
   - toolbar
   - image upload
   - table floating toolbar
   - markdown source panel
5. `extensions`
   - 真正的 Tiptap / ProseMirror 扩展定义
   - 尽量避免承载流程编排逻辑

### 4.3 工程目标

- 建立稳定的测试保护网
- 每一步变更可独立验证
- 改动优先兼容现有 API
- 为后续 `GENERALIZATION_PLAN.md` 提供干净地基

## 5. 非目标

当前重构阶段暂不直接做以下工作：

- 不引入 `json` 一级值协议
- 不在本阶段直接做 preset/plugin 化 API
- 不在本阶段重设计 toolbarSchema
- 不在本阶段把 viewer 做成完整静态渲染器
- 不在本阶段重做媒体系统协议

上述内容属于通用化升级范围，应在重构主干稳定后再进入 `GENERALIZATION_PLAN.md`。

## 6. 目标目录演进

不要求一次性完成目录迁移，但希望逐步演进为：

```text
packages/editor/src/
├── ConfigurableTiptapEditor.tsx
├── index.ts
├── types.ts
├── core/
│   ├── createToolbarConfig.ts
│   ├── createEditorProps.ts
│   ├── editor-content.ts
│   ├── useConfigurableEditor.ts
│   └── useToolbarState.ts
├── adapters/
│   ├── markdownAdapter.ts
│   ├── htmlAdapter.ts
│   └── shared/
├── views/
│   ├── EditorFrame.tsx
│   ├── SinglePaneEditorView.tsx
│   ├── MarkdownDualView.tsx
│   └── ReadOnlyContentViewer.tsx
├── features/
│   ├── toolbar/
│   ├── image-upload/
│   ├── markdown-source/
│   └── table-toolbar/
├── extensions/
├── hooks/
├── lib/
└── styles/
```

说明：

- 第一阶段允许只新增 `core/`。
- 第二阶段再新增 `views/`。
- Markdown adapter 稳定后再引入 `adapters/`。
- 老文件应逐步变薄，而不是一次性大迁移。

## 7. 分阶段实施方案

## 阶段 0：基线冻结与测试保护网

### 目标

在不改生产行为的前提下，为后续重构建立判断回归的最小保护网。

### 建议动作

1. 为 `packages/editor` 建立稳定测试运行方式。
2. 固化当前对外 API 和关键行为。
3. 覆盖最容易被重构打坏的 round-trip 和 dual-view 场景。

### 优先测试项

#### A. round-trip

- Markdown -> editor -> Markdown
- HTML -> editor -> HTML
- ordered list start round-trip
- text-align syntax round-trip
- sub/sup round-trip
- math round-trip

#### B. dual-view

- Markdown 模式输入后富文本同步
- 外部 `value` 更新后 textarea 同步
- `dualView + html` 的降级或告警行为

#### C. 上传

- 上传成功后占位节点替换正确
- 大小限制生效
- 类型限制生效

#### D. 只读与展示

- `readOnly + showToolbar={false}` 的展示行为
- `compact` 模式展示行为

### 验收标准

- 可以稳定跑通包内测试
- 核心行为有可重复验证的自动化保护
- 不再只能靠手工点页面判断回归

## 阶段 1：提取核心装配层

### 目标

把 `ConfigurableTiptapEditor.tsx` 从“大一统容器”变成轻量分支壳层。

### 建议拆分

- `core/createToolbarConfig.ts`
- `core/createImageUploadHandler.ts`
- `core/createEditorProps.ts`
- `core/useConfigurableEditor.ts`
- `core/syncExternalValue.ts`

### 本阶段不做

- 不改 public API
- 不改 dual-view 交互语义
- 不改 Markdown 扩展实现

### 验收标准

- `ConfigurableTiptapEditor.tsx` 明显变薄
- editor 初始化、toolbar 配置、值同步不再散落在入口组件里
- 行为保持兼容

## 阶段 2：统一视图壳层

### 目标

统一单视图和双视图的布局壳层，解决样式能力不一致的问题。

### 建议新增

- `views/EditorFrame.tsx`
- `views/EditorPane.tsx`
- `views/SinglePaneEditorView.tsx`
- `views/MarkdownDualView.tsx`

### 重点收敛

- `showToolbar`
- `className`
- `minHeight`
- `compact`
- `readOnly`

### 验收标准

- `SingleViewEditor` 和 `DualViewEditor` 共用容器层
- 移除双视图里的硬编码固定高度
- 外层样式行为一致

## 阶段 3：重写 dual-view 契约

### 目标

把双视图模式从“能跑”升级为“状态闭合、语义明确”。

### 核心决策

`dualView` 只支持 Markdown 工作流。

即：

- `dualView=true` 时，source panel 永远编辑 Markdown
- 当 `contentType !== 'markdown'` 时：
  - 开发态告警
  - 运行时自动降级为单视图

### 本阶段重点

1. 明确单一真相源
2. 不再让 `textareaValue` 长期脱离外部受控值
3. 明确模式切换、用户输入、外部同步的边界

### 验收标准

- 外部 `value` 更新可同步到 Markdown panel
- 模式切换不丢内容
- `dualView + html` 不再语义漂移

## 阶段 4：收拢内容适配层

### 目标

把 Markdown 编解码逻辑从多个扩展的链式 patch，收敛成明确的 adapter 层。

### 当前问题点

- `EnhancedMarkdown`
- `TextAlignWithMarkdown`
- `OrderedListWithStart`

这些文件当前同时承载扩展定义和内容编解码流程，耦合较重。

### 建议新增

- `adapters/markdownAdapter.ts`
- `adapters/htmlAdapter.ts`

### 首批迁移内容

- table 空行预处理
- html table 预处理
- 列表缩进修正
- 链接后处理
- text-align 编解码
- ordered-list start 修复

### 验收标准

- Markdown 编解码只有一个明确主入口
- 扩展注册顺序不再承载主要业务流程
- round-trip 行为有测试保护

## 阶段 5：集中 toolbar 状态订阅

### 目标

减少 toolbar 各按钮分散监听 editor 事件的成本。

### 当前明显问题

当前多个 hook 仍自行监听 `selectionUpdate`，包括但不限于：

- `use-mark.ts`
- `use-heading.ts`
- `use-heading-dropdown-menu.ts`
- `use-list.ts`
- `use-list-dropdown-menu.ts`
- `use-text-align.ts`
- `use-link-popover.ts`
- `use-code-block.ts`
- `use-blockquote.ts`
- `use-image-upload.ts`

### 建议新增

- `core/useToolbarState.ts`
- `features/toolbar/toolbar-state-context.ts`
- `features/toolbar/selectors.ts`

### 验收标准

- toolbar 顶层统一订阅 editor 状态
- 下游按钮以 selector/上下文消费派生状态
- 事件监听数量显著下降

## 阶段 6：引入只读 Viewer 分支

### 目标

把只读展示从可编辑 editor 分支里拆出来，先建立边界，再逐步优化渲染成本。

### 实施策略

第一阶段允许保守实现：

- 先做轻量 read-only editor shell
- 不挂载 toolbar
- 不暴露编辑能力

第二阶段再评估是否继续演进为纯静态渲染 viewer。

### 建议新增

- `views/ReadOnlyContentViewer.tsx`

### 验收标准

- 只读场景有独立分支
- 渲染 fidelity 不回退
- 后续 viewer 双轨化有清晰落点

## 阶段 7：上传能力去业务耦合

### 目标

让组件库默认上传逻辑不再隐式绑定业务 token、tenant 和固定接口地址。

### 当前问题

`lib/upload-utils.ts` 当前仍包含：

- 默认上传 URL
- `localStorage` token 读取
- `localStorage` tenantId 读取

### 改造方向

1. 保留 `ImageUploadHandler` 作为核心协议
2. 默认上传逻辑改为真正通用的可选工具
3. 鉴权、header、endpoint 由调用方显式注入

### 验收标准

- 编辑器包可脱离业务 token 逻辑独立使用
- 业务侧仍能通过 `uploadHandler` 接回现有上传行为

## 阶段 8：清理遗留与文档收口

### 目标

移除明显遗留，确保文档和实现一致。

### 清理项

1. 移除 `packages/editor/src/dist`
2. 删除确认无用的遗留实现
3. 修正文档与真实导出/API 的偏差
4. 补充架构说明

### 验收标准

- `src` 目录仅保留源码
- 无明显死代码
- README / 计划文档与当前实现一致

## 8. 实施顺序建议

建议按以下顺序推进：

1. 阶段 0：测试保护网
2. 阶段 1：提取核心装配层
3. 阶段 2：统一视图壳层
4. 阶段 3：重写 dual-view 契约
5. 阶段 4：收拢内容适配层
6. 阶段 5：集中 toolbar 状态订阅
7. 阶段 6：引入只读 Viewer
8. 阶段 7：上传去耦合
9. 阶段 8：遗留清理

不建议跳步，尤其不要在没有测试保护网时直接重写 Markdown adapter。

## 9. 每阶段交付要求

每个阶段都必须产出：

1. 变更说明
2. 涉及文件清单
3. 测试结果
4. 手工验证结果
5. 风险点
6. 回滚方式

建议按阶段提交，避免一个超大变更集合。

## 10. 与通用化升级的边界

只有在以下条件满足后，才建议进入 `GENERALIZATION_PLAN.md`：

1. `ConfigurableTiptapEditor` 已完成职责收口
2. dual-view 契约已明确为 markdown-only
3. Markdown 编解码已集中管理
4. toolbar 状态订阅已基本集中
5. 上传默认实现已去业务耦合
6. viewer 已有独立分支
7. 包内测试可稳定运行

在这之前直接推进通用化，会把“基础重构”和“公共 API 升级”混在一起，风险过高。

## 11. 最终完成标准

当满足以下条件时，可认为重构阶段完成：

1. 编辑器核心职责已分层
2. dual-view 契约明确且状态闭合
3. Markdown 适配逻辑有集中入口
4. 只读展示已独立成分支
5. toolbar 状态订阅不再高度分散
6. 上传能力不再强绑定业务默认实现
7. 源码目录无明显构建产物和死代码
8. 关键能力具备测试保护

## 12. 下一步建议

下一步直接进入阶段 0。

优先执行：

1. 为 `packages/editor` 选择并落地测试方案
2. 先补 Markdown round-trip 与 dual-view 同步测试
3. 再开始拆 `ConfigurableTiptapEditor.tsx`

原因：

- 这是当前风险最低、收益最高的一步
- 后续所有结构调整都依赖这层保护网
- 也是把 `REFACTOR_PLAN` 和 `GENERALIZATION_PLAN` 严格分层的关键

## 13. Audit Reset Log

### 2026-03-22

- 重新审计当前 `Xeditor` 仓库，确认旧版实施记录与当前代码现状不一致。
- 移除了不适用于本仓库的“已完成阶段”描述，避免后续基于错误前提推进。
- 将本计划重置为基于当前 `packages/editor` 实际结构的执行文档。
- 明确本阶段先做重构地基，再进入通用化升级。

### 2026-03-22 (execution)

Phase 0 completed

- Added package-local test infrastructure for `packages/editor` with `vitest`, `jsdom`, and Testing Library.
- Added package-local test scripts and a root `test:editor` entry.
- Added the first protection tests:
  - markdown preprocess/postprocess helpers
  - ordered list start repair
  - dual-view markdown synchronization
- Fixed a real dual-view sync bug so the markdown textarea now refreshes when external editor content changes while markdown mode stays active.
- Updated TypeScript build config so test files and legacy `src/dist` artifacts do not leak into declaration output.
- Verified:
  - `pnpm --filter @chenglu1/xeditor-editor test`
  - `pnpm build`

Phase 1 completed

- Extracted toolbar assembly into `src/core/createToolbarConfig.ts`.
- Extracted upload handler assembly into `src/core/createImageUploadHandler.ts`.
- Extracted content serialization and external sync helpers into `src/core/editor-content.ts`.
- Added `src/core/useConfigurableEditor.ts` to centralize editor creation, external value synchronization, toolbar config wiring, and dual-view mode state.
- Slimmed `ConfigurableTiptapEditor.tsx` down to a branch-selection shell that delegates core setup to the shared hook.
- Reused the new content helper inside `DualViewEditor.tsx` to avoid duplicated setContent option assembly.
- Re-verified:
  - package-local editor tests pass
  - workspace build passes

Phase 2 completed

- Added shared shell components:
  - `src/views/EditorFrame.tsx`
  - `src/views/EditorPane.tsx`
- Migrated `SingleViewEditor.tsx` onto the shared frame/pane layer.
- Migrated `DualViewEditor.tsx` onto the shared frame/pane layer.
- Removed the hard-coded `450px` dual-view panel height and aligned dual-view min-height handling with the public `minHeight` prop.
- Routed `showToolbar`, `className`, `minHeight`, and `compact` through the dual-view branch so both single-view and dual-view now share the same outer shell concepts.
- Kept mode switching available in dual-view even when the formatting toolbar is hidden.
- Added focused view-layer tests for:
  - single-view shared shell props
  - dual-view hidden-toolbar mode switching
- Re-verified:
  - `pnpm --filter @chenglu1/xeditor-editor test`
  - `pnpm build`

Phase 3 completed

- Tightened the dual-view contract so `dualView` now only activates for `contentType="markdown"`.
- Added runtime fallback behavior in `useConfigurableEditor`: non-markdown dual-view requests now warn and degrade to single-view mode.
- Moved markdown source state ownership from `DualViewEditor.tsx` into `src/core/useConfigurableEditor.ts`, so the source panel no longer owns a long-lived competing truth source.
- Refactored `DualViewEditor.tsx` into a controlled dual-view renderer driven by:
  - `markdownValue`
  - `onMarkdownChange`
  - `onSwitchToMarkdown`
  - `onSwitchToRichtext`
- Kept legacy mode-switch side effects compatible by continuing to notify `onChange` during valid dual-view mode switches.
- Added focused hook tests for:
  - invalid `dualView + html` fallback and warning
  - markdown source synchronization from editor updates
- Re-verified:
  - `pnpm --filter @chenglu1/xeditor-editor test`
  - `pnpm build`

Phase 4 completed

- Added explicit adapter modules:
  - `src/adapters/markdownAdapter.ts`
  - `src/adapters/htmlAdapter.ts`
- Moved markdown parse/serialize flow orchestration into a single adapter pipeline with named parse/parser/serialize registration points instead of chained extension monkey-patching.
- Rewired `EnhancedMarkdown`, `OrderedListWithStart`, and `TextAlignWithMarkdown` into thin capability extensions that register transforms into the shared markdown adapter.
- Moved editor content serialization and `setContent` option building in `src/core/editor-content.ts` onto adapter-backed content handlers.
- Added focused adapter tests for markdown text-align conversion/serialization.
- Re-verified:
  - `pnpm --filter @chenglu1/xeditor-editor test`
  - `pnpm build`

Phase 5 completed

- Added centralized toolbar state subscription primitives:
  - `src/core/useToolbarState.ts`
  - `src/features/toolbar/toolbar-state-context.tsx`
  - `src/features/toolbar/selectors.ts`
- Wrapped editable shells with a shared toolbar-state provider so toolbar consumers read one shared editor-state stream.
- Updated `src/hooks/use-tiptap-editor.ts` to consume the shared toolbar state when available and only fall back to local editor subscriptions outside that boundary.
- Removed per-button `selectionUpdate` / `transaction` listeners from toolbar hooks and the table floating toolbar.
- Fixed a real bug in `use-code-block.ts`: visibility checks no longer execute `toggleCodeBlock` as a side effect.
- Re-verified:
  - `pnpm --filter @chenglu1/xeditor-editor test`
  - `pnpm build`

Phase 6 completed

- Added `src/views/ReadOnlyContentViewer.tsx` as a dedicated read-only branch.
- Routed `ConfigurableTiptapEditor.tsx` through the read-only viewer branch before single-view / dual-view editing branches.
- Added a focused branch-selection test so read-only rendering no longer silently shares the editable shells.
- Re-verified:
  - `pnpm --filter @chenglu1/xeditor-editor test`
  - `pnpm build`

Phase 7 completed

- Removed the business-coupled default upload URL and `localStorage` token / tenant lookup from `src/lib/upload-utils.ts`.
- Kept `uploadImage` / `createUploadHandler` as generic utilities that now require explicit `uploadUrl` or a custom `uploadHandler`.
- Updated `src/core/createImageUploadHandler.ts` so editors without upload configuration no longer wire in an implicit business upload flow.
- Updated extension assembly so the image upload node is only mounted when an upload integration is explicitly configured.
- Added focused tests for `createImageUploadHandler`.
- Re-verified:
  - `pnpm --filter @chenglu1/xeditor-editor test`
  - `pnpm build`

Phase 8 completed

- Removed legacy generated artifacts from the source tree under:
  - `src/dist`
  - `src/extensions/*/dist`
  - `src/hooks/dist`
  - `src/lib/dist`
- Updated this refactor plan log so the execution record now matches the actual repository state.
- Added final protection tests for:
  - markdown adapter text-align helpers
  - read-only branch routing
  - upload handler assembly
- Final verification:
  - `pnpm --filter @chenglu1/xeditor-editor test`
  - `pnpm build`
