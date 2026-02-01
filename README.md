# Xeditor

面向内容创作者的在线富文本 / Markdown 编辑器 Demo，以及可复用的 React 编辑器组件库。  
A demo online rich text / Markdown editor and reusable React editor library.

---

## 简介 Introduction

- 基于 React 18 + Vite + MUI 构建的 Web 编辑器演示项目  
  Web editor demo built with React 18, Vite and MUI.
- 提供 `@xeditor/editor` 组件库，可在任意 React 项目中复用  
  Ships `@xeditor/editor` package for reuse in any React app.
- 在线预览 / Live demo: https://xeditor-web.vercel.app

项目结构 / Project structure:

```text
apps/web         # 演示站 Demo web app
packages/editor  # @xeditor/editor 组件库 Editor package
```

---

## 快速开始 Quick Start

### 环境 Environment

- Node.js >= 18
- 推荐 Recommended: `pnpm`（如未安装：`npm install -g pnpm`）

### 安装 Install

```bash
pnpm install
```

### 启动开发服务器 Start dev server

在项目根目录 / In project root:

```bash
pnpm dev
```

默认访问 / Open in browser: `http://localhost:5173`

### 构建与预览 Build & preview

```bash
pnpm build   # 构建 build
pnpm preview # 预览 preview
```

---

## 编辑器组件使用 Using the editor component

`@xeditor/editor` 导出 `ConfigurableTiptapEditor` 组件，用于编辑 Markdown 内容。  
`@xeditor/editor` exports `ConfigurableTiptapEditor` for editing Markdown content.

```tsx
import { useState } from 'react';
import { ConfigurableTiptapEditor } from '@xeditor/editor';

function MyEditor() {
  const [content, setContent] = useState('# Title\n\nStart writing here.');

  return (
    <ConfigurableTiptapEditor
      value={content}
      contentType="markdown"
      onChange={(next: string) => setContent(next)}
    />
  );
}
```

关键属性 Key props:

- `value: string`：当前内容 Current content (Markdown string)
- `onChange(value: string)`：内容变化回调 Change callback
- `contentType`：内容类型，当前主要使用 `'markdown'`  
  Content type, currently using `'markdown'`.

更多配置可以直接查看 `packages/editor/src/types.ts`。  
For more options, check `packages/editor/src/types.ts`.

---

## 部署到 Vercel Deploy to Vercel

- 线上地址 / Production URL: https://xeditor-web.vercel.app
- 推送到 `main` 分支会通过 GitHub Actions + Vercel 自动部署。  
  Pushing to `main` triggers deployment via `.github/workflows/vercel-deploy.yml`.
- 需要在 GitHub Secrets 中配置 `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID`。  
  Configure these three Secrets in GitHub repo Settings → Secrets → Actions.
