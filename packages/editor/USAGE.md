# Xeditor Usage Cookbook

This file collects the recommended usage patterns for the generalized editor API.

## 1. Markdown value with `onUpdate`

```tsx
import { useState } from 'react';
import {
  ConfigurableTiptapEditor,
  type EditorUpdateEvent,
} from '@chenglu1/xeditor-editor';
import '@chenglu1/xeditor-editor/styles.css';

export function MarkdownExample() {
  const [value, setValue] = useState('# Hello');

  return (
    <ConfigurableTiptapEditor
      value={value}
      valueType="markdown"
      onUpdate={(event: EditorUpdateEvent) => {
        if (event.valueType === 'markdown') {
          setValue(event.value as string);
        }
      }}
    />
  );
}
```

## 2. JSON mode

```tsx
import { useState } from 'react';
import { ConfigurableTiptapEditor } from '@chenglu1/xeditor-editor';

const initialDoc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Structured content' }],
    },
  ],
};

export function JsonExample() {
  const [doc, setDoc] = useState(initialDoc);

  return (
    <ConfigurableTiptapEditor
      value={doc}
      valueType="json"
      onUpdate={(event) => {
        if (event.valueType === 'json') {
          setDoc(event.value);
        }
      }}
    />
  );
}
```

## 3. Uncontrolled initialization with `defaultValue`

```tsx
<ConfigurableTiptapEditor
  defaultValue="# Draft"
  valueType="markdown"
/>
```

## 4. Static read-only viewer

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  readOnly
  showToolbar={false}
  viewerMode="static"
/>
```

Use `viewerMode="editor-shell"` when fidelity matters more than startup cost.

If you only need a lightweight read-only surface, prefer the dedicated viewer entry:

```tsx
import { StaticContentViewer } from '@chenglu1/xeditor-editor/viewer';
import '@chenglu1/xeditor-editor/styles/core.css';
import '@chenglu1/xeditor-editor/styles/content.css';

<StaticContentViewer value={markdown} valueType="markdown" minHeight="0" />;
```

## 5. Schema-driven toolbar

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  supportedToolbarButtons={['undo', 'redo', 'bold', 'italic', 'link']}
  toolbarSchema={[
    ['undo', 'redo'],
    ['bold', 'italic', 'link'],
    [{ type: 'custom', id: 'insert-variable' }],
  ]}
  renderToolbarItem={({ item }) => {
    if (typeof item !== 'string' && item.id === 'insert-variable') {
      return <button type="button">Insert Variable</button>;
    }

    return null;
  }}
/>
```

## 6. Extension presets

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  presets={['base', 'formatting', 'markdownDialect']}
  disableBuiltIns={['placeholder']}
/>
```

Available preset groups:

- `base`
- `formatting`
- `table`
- `math`
- `media`
- `details`
- `markdownDialect`

Default presets are intentionally lean:

- `base`
- `formatting`
- `table`
- `markdownDialect`

The editor auto-enables `media` when you provide an `uploadHandler` or `uploadUrl`.

## 7. Structured media upload

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  uploadHandler={async (file) => ({
    src: await uploadFile(file),
    alt: file.name,
    title: file.name,
    mimeType: file.type,
    meta: { source: 'cdn' },
  })}
  mediaUpload={{
    validateFile: (file) =>
      file.type.startsWith('image/') ? null : new Error('Images only'),
    onUploadStart: (file) => console.log('start', file.name),
    onUploadSuccess: (file, asset) => console.log('done', file.name, asset.src),
  }}
/>
```

## 8. Markdown dialect options

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  markdownDialect={{
    normalizeListIndentation: true,
    normalizeTables: true,
    preserveOrderedListStart: true,
    textAlignSyntax: 'directive',
  }}
/>
```

## 9. Custom messages

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  messages={{
    loading: 'Loading editor...',
    modeRichText: 'Rich Text',
    modeMarkdown: 'Markdown',
    uploadClickOrDrop: 'Upload an image or drag it here',
    clearAllUploads: 'Clear queue',
    uploadInProgress: ({ count }) => `Uploading ${count} file${count === 1 ? '' : 's'}`,
    uploadLimit: ({ limit, maxSizeMB }) => `Up to ${limit} files, ${maxSizeMB}MB each.`,
  }}
/>
```

## 10. Layered styles for optional math

```tsx
import '@chenglu1/xeditor-editor/styles/core.css';
import '@chenglu1/xeditor-editor/styles/content.css';
import '@chenglu1/xeditor-editor/styles/math.css';
import '@chenglu1/xeditor-editor/styles/ui.css';
```

Only import `styles/math.css` when you enable the `math` preset.
