# Xeditor Migration Guide

This guide covers the generalized editor API introduced after the refactor phase.

## What changed

- `valueType` is now the primary content protocol selector.
- `value` can now be `markdown`, `html`, or Tiptap `json`.
- `defaultValue` is available for uncontrolled usage.
- `onUpdate(event)` is the structured update callback.
- `viewerMode` controls whether read-only rendering uses a static renderer or the editor shell.
- `presets`, `extensions`, and `disableBuiltIns` control extension assembly.
- `toolbarSchema`, `renderToolbarItem`, and `supportedToolbarButtons` control toolbar composition.
- `mediaUpload` adds validation and lifecycle hooks around uploads.
- `markdownDialect` controls markdown normalization and custom syntax behavior.

## Backward compatibility

The legacy API still works:

- `contentType`
- `onChange(content, contentType, characterCount)`
- string `value` for markdown/html
- `uploadHandler`
- `uploadUrl`

If both old and new props are provided, the generalized props win:

- `valueType` overrides `contentType`
- `onUpdate` is emitted in addition to legacy `onChange` when the serialized value is a string

## Value migration

Old usage:

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  contentType="markdown"
  onChange={(next) => setMarkdown(next)}
/>
```

New usage:

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  onUpdate={(event) => {
    if (event.valueType === 'markdown') {
      setMarkdown(event.value as string);
    }
  }}
/>
```

JSON mode:

```tsx
<ConfigurableTiptapEditor
  value={doc}
  valueType="json"
  onUpdate={(event) => {
    if (event.valueType === 'json') {
      setDoc(event.value);
    }
  }}
/>
```

## Uncontrolled mode

```tsx
<ConfigurableTiptapEditor
  defaultValue="# Draft"
  valueType="markdown"
/>
```

## Read-only viewers

High-fidelity editor shell:

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  readOnly
  viewerMode="editor-shell"
/>
```

Lightweight static viewer:

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  readOnly
  viewerMode="static"
/>
```

## Toolbar customization

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  supportedToolbarButtons={['bold', 'italic', 'link']}
  toolbarSchema={[
    ['bold', 'italic'],
    ['link', { type: 'custom', id: 'insert-variable' }],
  ]}
  renderToolbarItem={({ item }) => {
    if (typeof item !== 'string' && item.id === 'insert-variable') {
      return <button type="button">Var</button>;
    }

    return null;
  }}
/>
```

## Extension presets

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  presets={['base', 'formatting', 'table']}
  disableBuiltIns={['placeholder']}
  extensions={[myCustomExtension]}
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

## Upload migration

Legacy upload handler:

```tsx
<ConfigurableTiptapEditor uploadHandler={legacyHandler} />
```

Structured asset handler:

```tsx
<ConfigurableTiptapEditor
  uploadHandler={async (file) => ({
    src: await uploadFile(file),
    alt: file.name,
    meta: { source: 'cdn' },
  })}
  mediaUpload={{
    validateFile: (file) =>
      file.type.startsWith('image/') ? null : new Error('Images only'),
    onUploadSuccess: (file, asset) => {
      console.log(file.name, asset.src);
    },
  }}
/>
```

## Markdown dialect options

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

## Error handling

Use `onError` for recoverable editor lifecycle errors:

```tsx
<ConfigurableTiptapEditor
  value={markdown}
  valueType="markdown"
  onError={({ phase, error, recoverable }) => {
    console.error(phase, recoverable, error);
  }}
/>
```

Phases currently reported:

- `init`
- `parse`
- `serialize`
- `upload`
- `viewer`
- `mode-switch`
