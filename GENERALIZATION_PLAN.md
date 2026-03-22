# TiptapMarkdownEditor 通用组件升级方案

## 1. 文档目的

本文档用于指导 `TiptapMarkdownEditor` 从“成熟的内部编辑器”继续升级为“可复用、可配置、可扩展的通用设计系统组件”。

这不是上一轮“结构重构收口”的重复文档，而是下一阶段的产品化与平台化方案。后续新增能力、接口调整、拆分子组件、补充适配层时，都应优先以本文档作为统一参照。

## 2. 当前结论

当前编辑器已经具备以下优势：

- 核心装配逻辑已集中到 `core/`
- Markdown parse/serialize 已集中到 `adapters/`
- toolbar 状态订阅已集中
- dual-view 契约已收口为 markdown-only
- 只读预览已从可编辑分支中拆出
- 上传逻辑已从 design-system 中移除业务 token/tenant 默认耦合
- 模块内测试已具备保护网并可运行

但如果要成为真正的通用组件，当前仍有几个核心不足：

- 对外值协议过窄，目前主要围绕 `markdown/html string`
- extension 栈和 toolbar 仍以“内置默认决策”为主，不够可插拔
- viewer 仍然是轻量只读 editor shell，不是静态渲染 viewer
- 上传与媒体能力仍偏“图片 URL 上传器”，不够产品化
- i18n、错误处理、主题、可观测性仍以内部组件思路为主
- 一些 Markdown 增强语法仍属于内部约定，尚未抽象成“方言包”

## 3. 升级目标

下一阶段的目标不是“再堆更多功能”，而是让组件满足以下标准：

1. 能被多个业务线直接复用，而不是复制一份再改。
2. 不强依赖单一内容协议，至少支持 `json / markdown / html` 三类值模型。
3. 默认体验开箱即用，但内部能力可以按需关闭、替换、扩展。
4. 上传、toolbar、viewer、markdown 方言都具备清晰边界。
5. 错误、文案、样式、能力开关都能被调用方接管。

## 4. 当前最值得优化的点

### 4.1 值协议过于单一

当前组件的值模型主要是：

- `value: string`
- `contentType: 'markdown' | 'html'`
- `onChange(content, contentType, characterCount)`

这套协议适合当前业务，但不适合通用组件。

问题：

- 无法把 ProseMirror / Tiptap 的结构化文档作为一等输入输出
- 任意高级节点扩展最终都要被压回 string，限制扩展能力
- 调用方无法明确区分“输入协议”和“序列化输出协议”

建议：

- 新增 `valueType: 'json' | 'markdown' | 'html'`
- 支持 `JSONContent` 作为一级协议
- 新增 `defaultValue`
- 新增统一事件 `onUpdate(event)`

建议事件结构：

```ts
type EditorValueType = 'json' | 'markdown' | 'html';

interface EditorUpdateEvent {
  value: string | JSONContent;
  valueType: EditorValueType;
  characterCount: number;
  wordCount?: number;
  source: 'user' | 'external-sync' | 'mode-switch';
}
```

### 4.2 入口组件仍然过于“大一统”

当前 `ConfigurableTiptapEditor` 仍同时负责：

- 装配 editor
- 选择 single/dual/viewer 分支
- 加载默认样式
- 暴露默认 UI

这对业务接入方便，但对通用设计系统并不理想。

建议拆成三层：

1. `useEditorCore`
2. `RichTextEditor`
3. `MarkdownDualViewEditor`
4. `ContentViewer`

其中：

- `useEditorCore` 只负责 editor 生命周期、commands、状态与序列化
- `RichTextEditor` 是默认完整 UI
- `MarkdownDualViewEditor` 独立组件，不再通过一个布尔值隐式切换
- `ContentViewer` 是纯只读渲染能力

### 4.3 extension 体系不够可插拔

当前 `createEditorExtensions()` 基本是固定扩展栈。

这会带来两个问题：

- 调用方很难真正关闭某些能力
- 新增一个业务扩展往往需要改公共源码

建议升级为：

```ts
interface EditorExtensionPreset {
  name: string;
  extensions: AnyExtension[];
}

interface EditorExtensionOptions {
  presets?: Array<'base' | 'table' | 'math' | 'media' | 'details'>;
  extensions?: AnyExtension[];
  disableBuiltIns?: string[];
  configureExtensions?: (context: EditorExtensionContext) => AnyExtension[];
}
```

第一阶段先把内置能力分组：

- `base`
- `formatting`
- `table`
- `math`
- `media`
- `details`
- `markdownDialect`

### 4.4 toolbar 仍然是“固定模板”

当前 toolbar 是：

- 内部固定 JSX 结构
- 通过 `toolbarButtons` 做显隐
- 顺序、分组、文案、渲染形态不可外部控制

这更像“内置工具栏”，不是“可复用工具栏系统”。

建议：

- 保留 `toolbarButtons` 作为兼容层
- 新增 `toolbarSchema`
- 新增 `renderToolbarItem`
- 新增 `toolbarSlot`

目标形态：

```ts
type ToolbarItem =
  | 'undo'
  | 'redo'
  | 'heading'
  | 'list'
  | 'bold'
  | 'italic'
  | 'link'
  | 'image'
  | { type: 'custom'; id: string };

type ToolbarSchema = ToolbarItem[][];
```

这样调用方可以控制：

- 分组
- 顺序
- 是否插入自定义按钮
- 是否替换内置按钮

### 4.5 Markdown 增强策略过于“默认”

当前编辑器已经内置了一些非常有价值的 Markdown 增强能力：

- 列表缩进修正
- table 空行修正
- standalone image 空行预处理
- ordered list start 修复
- text-align 的自定义语法

这些能力对当前业务很有用，但它们不一定是所有产品都能接受的“公共 Markdown 语义”。

建议把它们从“默认规则”升级为“方言包”：

```ts
interface MarkdownDialectOptions {
  normalizeListIndentation?: boolean;
  normalizeTables?: boolean;
  preserveOrderedListStart?: boolean;
  textAlignSyntax?: 'disabled' | 'directive';
  standaloneImageSpacing?: boolean;
}
```

同时明确区分：

- `CommonMark/GFM` 兼容能力
- 业务自定义方言能力

### 4.6 viewer 仍不是纯静态渲染

当前 `ReadOnlyContentViewer` 本质上还是：

- 初始化 editor
- `setContent`
- 用 `EditorContent` 渲染

这能保证 fidelity，但不能算真正通用的 viewer。

建议最终拆成两类：

1. `StaticContentViewer`
2. `EditorShellViewer`

说明：

- `StaticContentViewer` 用于列表、卡片、弹窗预览等轻场景
- `EditorShellViewer` 用于高 fidelity 但可接受 editor 初始化成本的场景

第一阶段可以先保持兼容，并新增 `viewerMode?: 'static' | 'editor-shell'`。

### 4.7 上传能力仍偏“图片 URL 上传器”

当前上传协议是：

- 输入 `File`
- 返回 `string URL`

对内部业务已足够，但对通用媒体系统不够。

建议升级为：

```ts
interface UploadedAsset {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  meta?: Record<string, unknown>;
}

type AssetUploadHandler = (
  file: File,
  context: AssetUploadContext,
) => Promise<UploadedAsset>;
```

同时补齐以下扩展点：

- `beforeUpload`
- `validateFile`
- `transformFile`
- `onUploadStart`
- `onUploadProgress`
- `onUploadSuccess`
- `onUploadError`

此外当前还有两个实现级问题需要优先修复：

1. 多文件成功/失败混合时，URL 与原始文件名映射可能错位
2. 拖拽上传没有完整按 `accept` 做类型校验

### 4.8 错误处理仍偏内部实现

当前错误处理大多是：

- `console.warn`
- `console.error`
- `try/catch` 后静默吞掉

这不适合通用组件。

建议统一为：

```ts
interface EditorErrorEvent {
  phase:
    | 'init'
    | 'parse'
    | 'serialize'
    | 'upload'
    | 'viewer'
    | 'mode-switch';
  error: Error;
  recoverable: boolean;
}
```

新增：

- `onError`
- `onWarning`

### 4.9 文案与主题不够公共化

当前仍存在硬编码文案和内部默认样式倾向。

建议把以下内容纳入配置：

- `messages`
- `locale`
- `theme tokens`
- `empty state / loading state renderer`

至少应允许调用方覆盖：

- loading 文案
- upload 文案
- mode switch 文案
- toolbar button 文案

## 5. 推荐的目标结构

```text
TiptapMarkdownEditor/
├── ConfigurableTiptapEditor.tsx
├── RichTextEditor.tsx
├── MarkdownDualViewEditor.tsx
├── ContentViewer.tsx
├── types.ts
├── core/
│   ├── useEditorCore.ts
│   ├── createEditorState.ts
│   ├── createToolbarState.ts
│   └── editor-value.ts
├── adapters/
│   ├── markdown/
│   ├── html/
│   ├── json/
│   └── viewer/
├── features/
│   ├── toolbar/
│   ├── media/
│   ├── source-view/
│   └── viewer/
├── presets/
│   ├── base.ts
│   ├── table.ts
│   ├── math.ts
│   ├── media.ts
│   └── markdown-dialect.ts
└── docs/
    ├── API.md
    ├── EXTENSIONS.md
    └── MIGRATION.md
```

## 6. 建议实施顺序

### 阶段 A：API 扩展但不破坏兼容

目标：

- 新增更通用的 props
- 保留现有 props 可继续工作

优先项：

- `valueType`
- `defaultValue`
- `onUpdate`
- `onError`
- `disabled`
- `editorRef`

### 阶段 B：extension 与 toolbar 插件化

目标：

- 让组件支持真正的能力组合

优先项：

- `presets`
- `extensions`
- `disableBuiltIns`
- `toolbarSchema`
- `renderToolbarItem`

### 阶段 C：viewer 双轨化

目标：

- 把只读场景变成正式产品能力

优先项：

- `viewerMode`
- `StaticContentViewer`
- `EditorShellViewer`

### 阶段 D：媒体系统产品化

目标：

- 从“图片上传按钮”升级为“可扩展媒体接入点”

优先项：

- 结构化上传结果
- 文件校验链
- 多文件映射修复
- 媒体节点扩展协议

### 阶段 E：Markdown 方言能力产品化

目标：

- 让增强规则从“内部默认逻辑”变成“可配置能力包”

优先项：

- `markdownDialect` 配置
- text-align 方言开关
- ordered-list start 策略开关
- table/list normalization 开关

### 阶段 F：国际化、主题、文档与迁移指南

目标：

- 让组件真正适合对外长期维护

优先项：

- `messages`
- 主题 token
- API 文档
- 扩展开发文档
- 从旧 API 迁移的说明

## 7. 建议优先级

如果只做前三件事，建议顺序如下：

1. 值协议升级：`json + adapters`
2. extension / toolbar 插件化
3. 媒体上传子系统产品化

原因：

- 这三项最直接决定它是不是“通用组件”
- 其它能力大多建立在这三项之上

## 8. 完成标准

当满足以下条件时，可认为编辑器已经升级为通用组件：

1. 支持 `json / markdown / html` 三级值协议
2. 支持通过配置组合 extension preset
3. toolbar 可声明式编排
4. viewer 可静态渲染
5. 上传能力支持结构化媒体协议
6. Markdown 增强逻辑可按方言包开关
7. 所有用户可见文案可覆盖
8. 错误可通过统一事件上报
9. 有 API 文档、迁移文档、扩展文档

## 9. 后续维护方式

从现在开始，后续对编辑器的继续修改建议遵循以下规则：

1. 新增能力前，先判断它属于 `core / adapters / features / presets / viewer` 哪一层。
2. 如果某能力只对单业务成立，优先做成可选 feature，不要直接塞进默认栈。
3. 所有新协议优先通过类型和事件暴露，不通过隐式约定暴露。
4. 所有影响 Markdown round-trip 的改动必须补测试。
5. 所有用户可见文案默认进入 `messages` 规划，不再继续散落硬编码。

## 10. 下一步建议

下一步建议直接进入第一批可落地修改：

1. 设计 `valueType/defaultValue/onUpdate/onError/editorRef` 新接口
2. 设计 `presets/extensions/disableBuiltIns` 扩展协议
3. 设计 `toolbarSchema` 与兼容旧 `toolbarButtons` 的过渡方案

这一批完成后，组件就会明显从“内部可用”迈向“公共可复用”。

## 11. Implementation Log

### 2026-03-20

Phase A - Step 1 completed

- Added `valueType`, `defaultValue`, `onUpdate`, `onError`, `disabled`, and `editorRef` to the public editor API.
- Kept legacy `value/contentType/onChange` behavior working for existing string-based integrations.
- Added `json` as a first-class value protocol while preserving markdown/html compatibility.
- Updated the read-only viewer branch to accept structured values.
- Added focused tests for:
  - uncontrolled initialization with `defaultValue`
  - structured update events
  - json-mode behavior
  - external editor ref assignment
  - recoverable error reporting
- Verified the package-local editor suite passes: 11 suites, 42 tests.

Current next step

- Move to Phase B: pluginize `extensions` and `toolbar` without breaking current built-in presets.

### 2026-03-20 (continued)

Phase B - Step 2 completed

- Added `presets`, `extensions`, and `disableBuiltIns` to the public editor API.
- Moved the default built-in extension stack to an explicit preset-driven registry in `extensions/createEditorExtensions.ts`.
- Added `toolbarSchema`, `renderToolbarItem`, and `supportedToolbarButtons` to support schema-driven toolbar composition without breaking legacy `toolbarButtons`.
- Filtered the default toolbar against supported built-ins so optional marks such as `underline` no longer leak into the UI unless the caller opts in explicitly.
- Reworked `EditorToolbar` to render from toolbar groups instead of a fixed JSX layout.
- Added focused tests for:
  - preset-driven extension assembly
  - toolbar support derivation
  - custom toolbar schema filtering
  - hook-level wiring for extension presets and toolbar capability overrides
- Verified the package-local editor suite passes: 11 suites, 50 tests.

Current next step

- Move to the next generalization stage: static viewer split, richer media/upload asset protocol, and markdown dialect optionization.

### 2026-03-22

Phase C / D / E / F completed

- Added `viewerMode="static"` and a new `StaticContentViewer` branch that renders read-only markdown/json/html without initializing a full editor shell.
- Kept `viewerMode="editor-shell"` as the high-fidelity fallback so existing read-only integrations stay compatible.
- Added `messages` and propagated them through loading state, dual-view mode switches, and upload node UI text.
- Added `supportedToolbarButtons` to the public props and wired it through the toolbar config layer.
- Upgraded the upload node flow to support structured `UploadedAsset` results, preserved file-to-asset mapping for mixed success/failure batches, and validated dropped files against `accept`.
- Added `mediaUpload` lifecycle support on top of generic upload handlers while preserving the legacy `uploadUrl` and `uploadHandler` entry points.
- Productized markdown dialect options through `markdownDialect` and threaded them through extension assembly and the static viewer pipeline.
- Added a migration guide at `packages/editor/MIGRATION.md` covering the new value, viewer, toolbar, media, and markdown dialect APIs.
- Added focused tests for:
  - static viewer routing
  - generalized update events and editor refs
  - toolbar schema filtering
  - preset-driven extension assembly
  - upload node replacement and drag/drop accept validation
- Verified:
  - `pnpm --filter @chenglu1/xeditor-editor test`
  - `pnpm build`

Current status

- `GENERALIZATION_PLAN.md` is now implemented against the current repository state.
