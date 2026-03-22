# `@chenglu1/xeditor-editor`

Reusable React rich text and Markdown editor built with Tiptap.

## Install

```bash
npm install @chenglu1/xeditor-editor
```

Peer dependencies:

- `react@^18`
- `react-dom@^18`

Node requirement:

- `node >= 18`

## Quick Start

```tsx
import { useState } from 'react';
import {
  ConfigurableTiptapEditor,
  type EditorUpdateEvent,
} from '@chenglu1/xeditor-editor';
import '@chenglu1/xeditor-editor/styles.css';

export function Example() {
  const [value, setValue] = useState('# Hello Xeditor');

  const handleUpdate = (event: EditorUpdateEvent) => {
    if (event.valueType === 'markdown') {
      setValue(event.value as string);
    }
  };

  return (
    <ConfigurableTiptapEditor
      value={value}
      valueType="markdown"
      onUpdate={handleUpdate}
    />
  );
}
```

## Supported Value Types

- `markdown`
- `html`
- `json`

Use `valueType` to define the content protocol and `onUpdate(event)` to receive structured update events.

## Read-Only Viewer

For lightweight read-only surfaces, you can import the dedicated viewer entry:

```tsx
import { StaticContentViewer } from '@chenglu1/xeditor-editor/viewer';
import '@chenglu1/xeditor-editor/styles/core.css';
import '@chenglu1/xeditor-editor/styles/content.css';
```

```tsx
<StaticContentViewer
  value={markdown}
  valueType="markdown"
  minHeight="0"
/>
```

Use the full editor entry only when you need editable behavior or read-only mode that preserves the editor shell.

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  readOnly
  showToolbar={false}
  viewerMode="static"
/>
```

Use `viewerMode="editor-shell"` when rendering fidelity matters more than startup cost.

If you render `valueType="html"` in static mode, pass trusted HTML or provide a sanitizer:

```tsx
import DOMPurify from 'dompurify';

<ConfigurableTiptapEditor
  value={html}
  valueType="html"
  readOnly
  viewerMode="static"
  sanitizeHtml={(unsafeHtml) => DOMPurify.sanitize(unsafeHtml)}
/>
```

## Toolbar Customization

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  supportedToolbarButtons={['undo', 'redo', 'bold', 'italic', 'link']}
  toolbarSchema={[
    ['undo', 'redo'],
    ['bold', 'italic', 'link'],
  ]}
/>
```

You can also insert or replace built-in extension groups without forking the default assembly order:

```tsx
import { Extension } from '@tiptap/core';

const calloutExtension = Extension.create({
  name: 'callout',
});

<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  extensionComposition={[
    {
      key: 'callout-before-link',
      target: 'link',
      placement: 'before',
      extension: calloutExtension,
    },
  ]}
/>
```

## Upload Integration

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  uploadHandler={async (file) => ({
    src: await uploadFile(file),
    alt: file.name,
    title: file.name,
  })}
/>
```

The package does not assume a backend. Upload destination, auth headers, file validation, and lifecycle hooks are owned by the consuming application.

If your host has stricter policies for external assets or links, enforce them in your upload handler and viewer sanitization layer.

## Error Handling And Diagnostics

Use `onError` for structured runtime events and `logger` for host-owned diagnostics:

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  onError={({ phase, error }) => {
    captureEditorError({ phase, message: error.message });
  }}
  logger={{
    warn: (message, context) => hostLogger.warn(message, context),
    error: (message, context) => hostLogger.error(message, context),
  }}
/>
```

The package does not write operational warnings or errors directly to `console` anymore. If you need telemetry, inject it from the host.

## Styles

Import the full stylesheet once in your host app:

```tsx
import '@chenglu1/xeditor-editor/styles.css';
```

For design-system integrations, the package now exposes layered styles:

```tsx
import '@chenglu1/xeditor-editor/styles/core.css';
import '@chenglu1/xeditor-editor/styles/content.css';
import '@chenglu1/xeditor-editor/styles/math.css';
import '@chenglu1/xeditor-editor/styles/ui.css';
```

- `core.css`: editor shell, toolbar primitives, layout chrome
- `content.css`: prose/content rendering styles
- `math.css`: KaTeX styles for the optional `math` preset
- `ui.css`: optional richer UI like floating table controls and upload surfaces

You can override the editor theme with CSS custom properties on `:root` or a host container:

```css
.my-brand-editor {
  --xeditor-shell-border: #d6dae5;
  --xeditor-shell-bg: #ffffff;
  --xeditor-toolbar-bg: #f7f9fc;
  --xeditor-control-active-border: #0f62fe;
  --xeditor-link-color: #0f62fe;
  --xeditor-code-block-bg: #111827;
}
```

## Compatibility, Accessibility, And Performance

Server rendering is safe by default:

- `readOnly` content renders through the static viewer during SSR
- editable instances render a lightweight loading shell on the server and hydrate on the client

Consumer-visible labels can be localized through `messages`, including toolbar controls, table actions, upload labels, mode switches, and static loading text:

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  messages={{
    loading: 'Loading…',
    placeholder: 'Start typing…',
    toolbarBold: 'Bold text',
    toolbarInsertTable: 'Insert table',
    markdownInputLabel: 'Markdown source',
  }}
/>
```

If your host already uses `react-i18next`, the package also exposes a dedicated adapter entry:

```tsx
import { ConfigurableTiptapEditor } from '@chenglu1/xeditor-editor/react-i18next';
import {
  XEDITOR_I18NEXT_RESOURCES,
} from '@chenglu1/xeditor-editor/react-i18next';

i18n.init({
  resources: {
    en: {
      translation: {
        app: {
          title: 'Demo',
        },
      },
      ...XEDITOR_I18NEXT_RESOURCES.en,
    },
    'zh-CN': {
      translation: {
        app: {
          title: '演示',
        },
      },
      ...XEDITOR_I18NEXT_RESOURCES['zh-CN'],
    },
  },
});

<ConfigurableTiptapEditor value={markdown} valueType="markdown" />;
```

The `react-i18next` adapter defaults to the `xeditor` namespace and keeps the editor-local copy in sync with the current language automatically.

Performance tradeoffs to keep in mind:

- Prefer `viewerMode="static"` for read-only lists, cards, dialogs, and search results. It avoids creating a full Tiptap editor instance.
- Use `viewerMode="editor-shell"` only when you need full editor fidelity for read-only rendering.
- Keep `presets` lean for lightweight consumers. The default preset set is `base + formatting + table + markdownDialect`; opt into `math`, `media`, and `details` only when you need them.
- Import layered styles when your host only needs part of the package surface. `styles/core.css` + `styles/content.css` is lighter than always loading the full bundle, and `styles/math.css` is only needed when the `math` preset is enabled.
- The full stylesheet payload is intentionally broad for compatibility; design-system consumers should prefer theme tokens and layered style imports over patching generated CSS.

## Advanced Extension Assembly

Advanced consumers can use the stable subpath export:

```tsx
import {
  createEditorExtensions,
  EDITOR_BUILT_IN_EXTENSION_KEYS,
} from '@chenglu1/xeditor-editor/advanced';
```

Use the `advanced` entry when you need to compose a custom Tiptap shell around the package's built-in extension registry without importing from private source paths.

## Docs

- Usage cookbook: [`USAGE.md`](./USAGE.md)
- Migration guide: [`MIGRATION.md`](./MIGRATION.md)

## Legacy Compatibility

The legacy API still works:

- `contentType`
- `onChange(content, contentType, characterCount)`

For new integrations, prefer:

- `valueType`
- `defaultValue`
- `onUpdate`
- `onError`

## Notes

- `dualView` is markdown-only
- `viewerMode="static"` is optimized for read-only rendering
- editable SSR renders a loading shell and initializes on the client
- `valueType="html"` should only be used with trusted or sanitized content
- `sanitizeHtml` is the recommended boundary for static viewer rendering
- `uploadHandler` and `uploadUrl` are transport hooks only; auth, tenancy, and asset policy remain consumer-owned
- style layers are available through `styles.css`, `styles/core.css`, `styles/content.css`, and `styles/ui.css`
- `messages` now covers toolbar, upload, mode-switch, and table action labels for localization and a11y overrides
- advanced extension assembly is available through `@chenglu1/xeditor-editor/advanced`
