---
name: xeditor-editor-skill
description: 为 Xeditor 项目开发提供指导，包含架构知识、扩展开发规范、组件模式和常见任务的操作方法。
---

# Xeditor 开发技能指南

## 项目概览

Xeditor 是一个基于 **Tiptap v3 + React 18** 的富文本编辑器 monorepo，分为：

| 包 | 路径 | 说明 |
|---|---|---|
| `@chenglu1/xeditor-editor` | `packages/editor` | 可发布的 React 组件库 |
| `web` | `apps/web` | MUI + React Router 演示站 |

---

## 核心架构

### 组件层次

```
ConfigurableTiptapEditor      ← 唯一公开组件入口
├── SingleViewEditor           ← 单视图（富文本）
│   ├── EditorToolbar          ← 工具栏（按 ToolbarConfig 显示分组）
│   ├── EditorContent          ← Tiptap 渲染区
│   └── TableFloatingToolbar
└── DualViewEditor             ← 双视图（富文本 ↔ Markdown 源码）
    ├── ModeSwitchButtons
    ├── <textarea>             ← markdown 模式
    └── EditorContent + EditorToolbar
```

### 扩展注册顺序（createEditorExtensions.ts）

> ⚠️ 顺序不能随意调换，后续扩展依赖前置扩展的 `manager` 已初始化。

```
1. StarterKit                  # 基础（禁用内置 orderedList / link）
2. Placeholder
3. Details / DetailsSummary / DetailsContent
4. TaskList / TaskItem
5. Link
6. CustomImage
7. Table / TableRow / TableHeader / TableCell
8. createEnhancedMarkdown()    ← 必须在此位置，后续扩展钩挂其 manager
9. OrderedListWithStart        ← 必须在 EnhancedMarkdown 之后
10. TextAlignWithMarkdown      ← 必须在 EnhancedMarkdown 之后
11. Highlight
12. EnhancedBlockMath / EnhancedInlineMath
13. Subscript / Superscript
14. ImageUploadNode
15. CustomReactNode
16. CharacterCount             ← 可选，仅 maxLength 有值时添加
```

---

## 关键设计模式

### 1. Markdown 序列化管道拦截

所有需要扩展 Markdown 行为的扩展，都通过 `onBeforeCreate` 钩子包装 `editor.storage.markdown.manager.parse/serialize`：

```ts
onBeforeCreate() {
  const manager = (this.editor.storage as any).markdown?.manager;
  if (!manager) return;

  const originalParse = manager.parse.bind(manager);
  manager.parse = (markdown: string) => {
    const processed = myPreProcess(markdown);   // 预处理
    return originalParse(processed);
  };

  const originalSerialize = manager.serialize.bind(manager);
  manager.serialize = (doc: unknown) => {
    const md = originalSerialize(doc);
    return myPostProcess(md);                   // 后处理
  };
}
```

> 已有的拦截链：EnhancedMarkdown → OrderedListWithStart → TextAlignWithMarkdown

### 2. EditorContext 单例

所有工具栏子组件通过 Context 获取 editor，不需要传递 prop：

```tsx
// 父组件
<EditorContext.Provider value={{ editor }}>
  <EditorToolbar />
  <EditorContent editor={editor} />
</EditorContext.Provider>

// 子组件内
import { useCurrentEditor } from '@tiptap/react';
const { editor } = useCurrentEditor();
```

### 3. 工具栏按钮可见性

`ConfigurableTiptapEditor` 接收 `toolbarButtons?: ToolbarButton[]`，通过 `toolbarConfig` 传递给 `EditorToolbar`：

```ts
const shouldShowButton = (button: ToolbarButton) => {
  if (!toolbarButtons) return true;      // 不传 = 显示全部
  return toolbarButtons.includes(button);
};
```

---

## 文件目录速查

```
packages/editor/src/
├── ConfigurableTiptapEditor.tsx   # 主组件（入口）
├── types.ts                       # 所有公开类型定义
├── index.ts                       # npm 导出列表
├── components/
│   ├── DualViewEditor.tsx         # 双视图
│   ├── SingleViewEditor.tsx       # 单视图
│   ├── EditorToolbar.tsx          # 工具栏组合
│   ├── tiptap-ui/                 # 15个功能按钮/弹层组件
│   └── tiptap-ui-primitive/       # 10个基础 UI 原语
├── extensions/
│   ├── createEditorExtensions.ts  # 扩展工厂（唯一注册点）
│   ├── enhanced/                  # 4个增强扩展
│   ├── marks/                     # Subscript / Superscript
│   └── nodes/                     # CustomImage / CustomReactNode
├── hooks/                         # 10个自定义 Hook
├── lib/
│   ├── tiptap-utils.ts            # 编辑器工具函数集
│   └── upload-utils.ts            # 图片上传工具
└── styles/
    ├── index.scss                 # 样式入口（@use 汇总）
    ├── _variables.scss            # CSS 变量
    └── _keyframe-animations.scss  # 关键帧动画
```

---

## 常见开发任务

### A. 新增工具栏按钮

1. 在 `types.ts` 的 `ToolbarButton` 联合类型中新增名称
2. 在 `components/tiptap-ui/` 下创建对应组件目录
3. 在 `EditorToolbar.tsx` 按分组插入 `{shouldShowButton('xxx') && <XxxButton />}`
4. 如有样式，在 `styles/index.scss` 末尾追加 `@use` 引用

### B. 新增 Tiptap 扩展

1. 在 `extensions/` 下创建扩展文件
2. 在 `extensions/createEditorExtensions.ts` 的正确位置注册
3. 若需扩展 Markdown 序列化，用管道拦截模式，并确保注册在 `createEnhancedMarkdown()` **之后**

### C. 新增 Markdown 序列化增强

参考 `TextAlignWithMarkdown.ts` 或 `OrderedListWithStart.ts`：
- 继承 `Extension.create({...})`
- 在 `onBeforeCreate` 中拦截 `markdown.manager.parse/serialize`
- 在 `createEditorExtensions.ts` 中注册到 EnhancedMarkdown **之后**

### D. 新增图片上传适配

`ConfigurableTiptapEditor` 接收 `uploadHandler` prop，类型为：

```ts
type ImageUploadHandler = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal,
) => Promise<string>; // 返回图片 URL
```

也可用 `createUploadHandler({ uploadUrl, headers, parseResponse })` 工厂快速创建。

### E. 新增演示页面（apps/web）

1. 在 `apps/web/src/pages/` 新建页面组件
2. 在 `apps/web/src/App.tsx` 增加 `<Route>` 条目
3. 在 `AppBar` 的 `Toolbar` 里加导航按钮（可选）

---

## 构建命令

```bash
# 开发
pnpm dev                    # 先 build:editor，再启动 web dev server

# 组件库打包
pnpm build:editor           # 输出 dist/*.d.ts + dist/xeditor-editor.css + dist/index.esm.js + dist/index.cjs

# 验证 bundle
pnpm test:bundle            # build:editor + node 导入验证

# 发布
pnpm publish:editor         # build + npm publish --access public
```

## 样式规范

- 样式统一在 `src/styles/index.scss` 通过 `@use` 汇总，**禁止使用 `@import`**（Dart Sass 3.0 已废弃）
- CSS 变量定义在 `_variables.scss`
- 各组件的 `.scss` 文件放在对应组件目录内，由 `index.scss` 集中引入
