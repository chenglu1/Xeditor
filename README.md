# Xeditor

面向内容创作者的在线富文本 / Markdown 编辑器 Demo，以及可复用的 React 编辑器组件库。  
A demo online rich text / Markdown editor and reusable React editor library.

- 在线预览 / Live demo: <https://xeditor-web.vercel.app>
- 基于 React 18 + Tiptap v3 + Vite 构建

---

## 目录 Contents

- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [架构概览](#架构概览)
- [组件使用](#组件使用)
- [开发者指南](#开发者指南)
- [构建与发布](#构建与发布)
- [部署](#部署)

---

## 快速开始

**环境要求**：Node.js ≥ 18，推荐使用 `pnpm`

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:5173）
pnpm dev

# 构建
pnpm build

# 预览构建产物
pnpm preview
```

> `pnpm dev` 会通过 Vite alias 直接引用 `packages/editor/src/` 源码，修改 editor 后即时热更新，**无需** `build:editor`。
> `pnpm build` 同样走源码 bundle，能获得更好的 tree-shaking。

---

## 项目结构

```
Xeditor/                        # pnpm workspace 根目录
├── apps/
│   └── web/                    # 演示 Web 应用 (React 18 + Vite + MUI)
│       └── src/
│           ├── App.tsx          # 路由 + MUI 主题
│           └── pages/           # HomePage / RichtextPage / MarkdownSyncPage / DualViewPage
└── packages/
    └── editor/                 # @chenglu1/xeditor-editor 组件库
        └── src/
            ├── ConfigurableTiptapEditor.tsx  # 主组件入口
            ├── types.ts                       # 公开类型定义
            ├── index.ts                       # npm 导出列表
            ├── components/
            │   ├── DualViewEditor.tsx
            │   ├── SingleViewEditor.tsx
            │   ├── EditorToolbar.tsx
            │   ├── tiptap-ui/                 # 15 个功能 UI 组件
            │   └── tiptap-ui-primitive/       # 10 个基础 UI 原语
            ├── extensions/
            │   ├── createEditorExtensions.ts  # 扩展工厂（唯一注册点）
            │   └── enhanced/                  # 增强扩展（Markdown/Math/TextAlign/OrderedList）
            ├── hooks/                         # 10 个自定义 Hook
            ├── lib/
            │   ├── tiptap-utils.ts            # 工具函数集
            │   └── upload-utils.ts            # 图片上传工具
            └── styles/
                ├── index.scss                 # 样式入口
                └── _variables.scss            # CSS 变量
```

---

## 架构概览

### 组件层次

```
ConfigurableTiptapEditor
├── SingleViewEditor
│   ├── EditorToolbar          ← 工具栏（按 ToolbarConfig flags 显示分组）
│   ├── EditorContent          ← Tiptap 渲染区
│   └── TableFloatingToolbar
└── DualViewEditor             ← 富文本 ↔ Markdown 源码双视图
    ├── ModeSwitchButtons
    ├── <textarea>             ← markdown 模式原生输入
    └── EditorToolbar + EditorContent
```

### 扩展注册顺序

`createEditorExtensions.ts` 中扩展注册**顺序有依赖**，不可随意调换：

| 序号 | 扩展 | 说明 |
|---|---|---|
| 1 | StarterKit | 基础（禁用内置 orderedList/link）|
| 2 | Placeholder | 占位提示 |
| 3~4 | Details, TaskList/TaskItem | 折叠块、任务列表 |
| 5 | Link | 链接（openOnClick） |
| 6 | CustomImage | 自定义图片节点 |
| 7 | Table + 子扩展 | 表格（resizable）|
| **8** | **createEnhancedMarkdown()** | **⚠️ 必须在此，后续扩展依赖其 manager** |
| 9 | OrderedListWithStart | 有序列表起始编号（须在 8 之后）|
| 10 | TextAlignWithMarkdown | 文本对齐 Markdown 语法（须在 8 之后）|
| 11~14 | Highlight, Math, Sub/Sup | 高亮、数学公式、上下标 |
| 15~16 | ImageUploadNode, CustomReactNode | 图片上传节点、自定义 React 节点 |
| 17 | CharacterCount | 可选，仅 `maxLength` 存在时添加 |

### 增强扩展说明

| 扩展 | 功能 |
|---|---|
| `EnhancedMarkdown` | 拦截 parse/serialize，修复表格空行、列表缩进、链接格式 |
| `TextAlignWithMarkdown` | 自定义 `:::{align=xxx}…:::` 语法保存 Markdown 中的对齐信息 |
| `OrderedListWithStart` | 修复序列化时有序列表起始编号被重置的问题 |
| `EnhancedBlockMath` / `EnhancedInlineMath` | KaTeX 渲染 + LaTeX 空格语法自动修复 |

### Markdown 数据流

```
外部 value prop
    │  useEffect → editor.commands.setContent(value, {contentType:'markdown'})
    ▼
Tiptap editor
    │ parse:     MD → preprocessMarkdown → TextAlign解包 → markdown-it → ProseMirror
    │ serialize: ProseMirror → 标准MD → 修复有序列表 → 包裹TextAlign标记 → 修复链接格式
    ▼
onUpdate → editor.getMarkdown() → onChange(content)
```

---

## 组件使用

### 安装

```bash
npm install @chenglu1/xeditor-editor
# or
pnpm add @chenglu1/xeditor-editor
```

引入样式（在项目入口导入一次）：

```ts
import '@chenglu1/xeditor-editor/dist/xeditor-editor.css';
```

### 基础用法

```tsx
import { useState } from 'react';
import { ConfigurableTiptapEditor } from '@chenglu1/xeditor-editor';

function MyEditor() {
  const [content, setContent] = useState('# 标题\n\n开始写作...');

  return (
    <ConfigurableTiptapEditor
      value={content}
      contentType="markdown"
      onChange={(next) => setContent(next)}
    />
  );
}
```

### Props 完整说明

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string` | `''` | 受控内容（Markdown / HTML）|
| `contentType` | `'markdown' \| 'html'` | `'markdown'` | 内容格式 |
| `placeholder` | `string` | `'开始输入...'` | 占位文本 |
| `readOnly` | `boolean` | `false` | 只读模式：内容区不可编辑，同时 toolbar 所有按钮自动置灰且不可点击 |
| `showToolbar` | `boolean` | `true` | 显示工具栏 |
| `toolbarButtons` | `ToolbarButton[]` | 全量 | 限制工具栏按钮，不传则显示全部 |
| `dualView` | `boolean` | `false` | 双视图（富文本 + Markdown 源码）|
| `compact` | `boolean` | `false` | 紧凑模式（无边框/内边距，用于卡片嵌入）|
| `minHeight` | `string` | `'300px'` | 编辑区最小高度 |
| `className` | `string` | `''` | 自定义 className |
| `uploadHandler` | `ImageUploadHandler` | 自动 | 自定义图片上传函数 |
| `uploadUrl` | `string` | — | 自定义上传接口 URL |
| `maxFileSize` | `number` | `5MB` | 图片文件大小上限 |
| `maxLength` | `number` | — | 字符数上限（同时限制输入和粘贴）|
| `onChange` | `(content, contentType, charCount?) => void` | — | 内容变化回调 |

### ToolbarButton 可选值

```ts
type ToolbarButton =
  | 'undo' | 'redo'
  | 'heading' | 'list' | 'blockquote' | 'codeBlock' | 'table'
  | 'bold' | 'italic' | 'strike' | 'code' | 'underline' | 'highlight' | 'link'
  | 'superscript' | 'subscript'
  | 'alignLeft' | 'alignCenter' | 'alignRight' | 'alignJustify'
  | 'image';
```

### 自定义图片上传

```tsx
import { createUploadHandler, ConfigurableTiptapEditor } from '@chenglu1/xeditor-editor';

// 方式一：工厂函数
const uploadHandler = createUploadHandler({
  uploadUrl: 'https://your-api.com/upload',
  headers: { Authorization: 'Bearer xxx' },
  parseResponse: (res) => res.data.url, // 适配你的接口格式
});

// 方式二：完全自定义
const uploadHandler = async (file, onProgress, abortSignal) => {
  // 自行实现上传逻辑，返回图片 URL 字符串
  return 'https://cdn.example.com/image.jpg';
};

<ConfigurableTiptapEditor uploadHandler={uploadHandler} />;
```

---

## 开发者指南

### 新增工具栏按钮

1. 在 `packages/editor/src/types.ts` 的 `ToolbarButton` 联合类型新增名称
2. 在 `components/tiptap-ui/` 下创建对应组件目录和 `index.tsx`
3. 在 `EditorToolbar.tsx` 对应分组中添加 `{shouldShowButton('xxx') && <XxxButton />}`
4. 如有样式，在 `styles/index.scss` 末尾追加 `@use` 导入

### 新增 Tiptap 扩展

1. 在 `extensions/` 下创建扩展文件
2. 在 `createEditorExtensions.ts` 中注册（注意位置依赖，见扩展注册顺序表）
3. 若需扩展 Markdown 序列化，在 `EnhancedMarkdown` **之后**注册，并使用管道拦截：

```ts
// extensions/enhanced/MyExtension.ts
import { Extension } from '@tiptap/core';

export const MyExtension = Extension.create({
  name: 'myExtension',
  onBeforeCreate() {
    const manager = (this.editor.storage as any).markdown?.manager;
    if (!manager) return;

    const originalParse = manager.parse.bind(manager);
    manager.parse = (markdown: string) => {
      return originalParse(preProcess(markdown));
    };

    const originalSerialize = manager.serialize.bind(manager);
    manager.serialize = (doc: unknown) => {
      return postProcess(originalSerialize(doc));
    };
  },
});
```

### readOnly 工具栏禁用

传入 `readOnly={true}` 后：

- 内容区变为只读（Tiptap `editable: false`）
- toolbar 包裹层自动应用 `filter: grayscale(1)` + `pointerEvents: none`，所有按钮视觉置灰且不可点击

```tsx
<ConfigurableTiptapEditor
  value={content}
  readOnly={readOnly}   // ← 传入即可，无需手动处理按钮状态
  onChange={…}
/>
```

### 开发环境 Vite Alias

`apps/web/vite.config.ts` 配置了 alias，让 `@chenglu1/xeditor-editor` 在开发时解析到
`packages/editor/src/index.ts` 源码，修改 editor 代码后 Vite 即时热更新，无需 `pnpm build:editor`：

```ts
resolve: {
  alias: [
    // CSS 子路径放前面（精确优先）
    { find: '@chenglu1/xeditor-editor/dist/xeditor-editor.css',
      replacement: path.resolve(__dirname, '../../packages/editor/dist/xeditor-editor.css') },
    // JS 主入口指向源码
    { find: '@chenglu1/xeditor-editor',
      replacement: path.resolve(__dirname, '../../packages/editor/src/index.ts') },
  ],
}
```

---


- **禁止在 scss 文件中使用 `@import`**（已废弃，Dart Sass 3.0 将移除）
- 使用 `@use` 替代，在 `styles/index.scss` 集中汇总
- 组件样式文件放在对应组件目录内

### 常用工具函数（`lib/tiptap-utils.ts`）

| 函数 | 用途 |
|---|---|
| `cn(...classes)` | className 拼接 |
| `isMac()` | 检测 macOS 平台 |
| `formatShortcutKey(key, isMac)` | 跨平台快捷键显示 |
| `isMarkInSchema(name, editor)` | 检查 mark 是否在 schema 中 |
| `isNodeInSchema(name, editor)` | 检查 node 是否在 schema 中 |
| `isExtensionAvailable(editor, names)` | 检查扩展是否已注册 |
| `findNodePosition({ editor, node, nodePos })` | 在文档中查找节点位置 |
| `updateNodesAttr(tr, targets, attr, next)` | 批量更新节点属性 |
| `isAllowedUri(uri, protocols)` | URL 安全校验 |

---

## 构建与发布

```bash
# 仅构建组件库
pnpm build:editor

# 验证 ESM bundle 是否可用（Node 环境 import 测试）
pnpm test:bundle

# 发布到 npm（需 npm 登录）
pnpm publish:editor
```

构建产物（`packages/editor/dist/`）：

| 文件 | 说明 |
|---|---|
| `index.esm.js` | ESM 格式 |
| `index.cjs` | CommonJS 格式 |
| `index.d.ts` | TypeScript 类型声明 |
| `xeditor-editor.css` | 组件样式 |

---

## 部署

推送到 `main` 分支后由 GitHub Actions + Vercel 自动部署。

需在 GitHub Secrets 中配置：
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

配置方式：GitHub repo → Settings → Secrets → Actions
