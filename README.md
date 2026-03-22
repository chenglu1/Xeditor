# Xeditor

`Xeditor` is a `pnpm` monorepo that contains:

- a reusable editor package: [`packages/editor`](C:/Users/chenglu/Desktop/todo/Xeditor/packages/editor)
- a demo web app: [`apps/web`](C:/Users/chenglu/Desktop/todo/Xeditor/apps/web)

The published package is [`@chenglu1/xeditor-editor`](https://www.npmjs.com/package/@chenglu1/xeditor-editor).

## Repository Structure

```text
Xeditor/
|-- apps/
|   `-- web/                 # Demo app built with React + Vite
|-- packages/
|   `-- editor/              # npm package: @chenglu1/xeditor-editor
|-- scripts/
|   `-- test-bundle.mjs      # Consumer bundle smoke test
`-- README.md
```

## Local Development

Requirements:

- Node.js 18+
- `pnpm`

Install dependencies:

```bash
pnpm install
```

Start the demo app:

```bash
pnpm dev
```

Build the demo app:

```bash
pnpm build
```

Preview the demo app build:

```bash
pnpm preview
```

Build only the editor package:

```bash
pnpm build:editor
```

Run only the editor tests:

```bash
pnpm test:editor
```

Run the package export smoke test:

```bash
pnpm test:bundle
```

## Package Usage

Install from npm:

```bash
npm install @chenglu1/xeditor-editor
```

Minimal usage:

```tsx
import { useState } from 'react';
import { ConfigurableTiptapEditor } from '@chenglu1/xeditor-editor';
import '@chenglu1/xeditor-editor/styles.css';

export function Demo() {
  const [value, setValue] = useState('# Hello Xeditor');

  return (
    <ConfigurableTiptapEditor
      value={value}
      valueType="markdown"
      onUpdate={(event) => {
        if (event.valueType === 'markdown') {
          setValue(event.value as string);
        }
      }}
    />
  );
}
```

Package-specific docs:

- [`packages/editor/README.md`](C:/Users/chenglu/Desktop/todo/Xeditor/packages/editor/README.md)
- [`packages/editor/MIGRATION.md`](C:/Users/chenglu/Desktop/todo/Xeditor/packages/editor/MIGRATION.md)
- [`packages/editor/USAGE.md`](C:/Users/chenglu/Desktop/todo/Xeditor/packages/editor/USAGE.md)

## Release

Patch release:

```bash
pnpm run release:editor:patch
```

Minor release:

```bash
pnpm run release:editor:minor
```

Major release:

```bash
pnpm run release:editor:major
```

Explicit version:

```bash
pnpm run release:editor -- --version 1.2.3
```

More release details:

- [`RELEASING.md`](C:/Users/chenglu/Desktop/todo/Xeditor/RELEASING.md)

## Deployment

The demo site is deployed from the `main` branch through the Vercel workflow:

- [`.github/workflows/vercel-deploy.yml`](C:/Users/chenglu/Desktop/todo/Xeditor/.github/workflows/vercel-deploy.yml)
