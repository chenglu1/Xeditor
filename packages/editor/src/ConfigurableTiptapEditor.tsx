import 'katex/dist/katex.min.css';

import React from 'react';

import { DualViewEditor } from './components/DualViewEditor';
import { SingleViewEditor } from './components/SingleViewEditor';
import { createEditorMessages } from './core/createEditorMessages';
import { useConfigurableEditor } from './core/useConfigurableEditor';
import { MAX_FILE_SIZE } from './lib/tiptap-utils';
import type { ConfigurableTiptapEditorProps } from './types';
import { ReadOnlyContentViewer } from './views/ReadOnlyContentViewer';
import { StaticContentViewer } from './views/StaticContentViewer';

export type {
  AssetUploadContext,
  AssetUploadHandler,
  ConfigurableTiptapEditorProps,
  ContentType,
  EditorErrorEvent,
  EditorExtensionCompositionItem,
  EditorExtensionPlacement,
  EditorHtmlSanitizeContext,
  EditorHtmlSanitizer,
  EditorLogger,
  EditorMessages,
  EditorPresetName,
  EditorUpdateEvent,
  EditorValue,
  EditorValueType,
  ImageUploadHandler,
  MarkdownDialectOptions,
  MediaUploadHooks,
  ToolbarButton,
  ToolbarCustomItem,
  ToolbarItem,
  ToolbarRenderItem,
  ToolbarSchema,
  UploadedAsset,
} from './types';

const ConfigurableTiptapEditorInner: React.FC<ConfigurableTiptapEditorProps> = ({
  value,
  defaultValue,
  valueType,
  contentType = 'markdown',
  placeholder = '寮€濮嬭緭鍏?..',
  readOnly = false,
  disabled = false,
  showToolbar = true,
  toolbarButtons,
  supportedToolbarButtons,
  toolbarSchema,
  renderToolbarItem,
  dualView = false,
  className = '',
  minHeight = '300px',
  compact = false,
  viewerMode = 'editor-shell',
  messages,
  logger,
  uploadHandler,
  uploadUrl,
  maxFileSize = MAX_FILE_SIZE,
  maxLength,
  mediaUpload,
  presets,
  extensions,
  extensionComposition,
  disableBuiltIns,
  markdownDialect,
  editorRef,
  onUpdate,
  onError,
  onChange,
}) => {
  const resolvedMessages = createEditorMessages(messages);
  const {
    activeMode,
    editor,
    isDualViewEnabled,
    isMobile,
    messages: editorMessages,
    markdownValue,
    onMarkdownChange,
    onSwitchToMarkdown,
    onSwitchToRichtext,
    toolbarConfig,
  } = useConfigurableEditor({
    value,
    defaultValue,
    valueType,
    contentType,
    placeholder,
    readOnly,
    disabled,
    showToolbar,
    toolbarButtons,
    supportedToolbarButtons,
    toolbarSchema,
    renderToolbarItem,
    dualView,
    className,
    minHeight,
    compact,
    viewerMode,
    messages: resolvedMessages,
    logger,
    uploadHandler,
    uploadUrl,
    maxFileSize,
    maxLength,
    mediaUpload,
    presets,
    extensions,
    extensionComposition,
    disableBuiltIns,
    markdownDialect,
    editorRef,
    onUpdate,
    onError,
    onChange,
  });

  if (!editor) {
    return <div>{resolvedMessages.loading}</div>;
  }

  if (readOnly) {
    return (
      <ReadOnlyContentViewer
        editor={editor}
        minHeight={minHeight}
        compact={compact}
        className={className}
      />
    );
  }

  if (isDualViewEnabled) {
    return (
      <DualViewEditor
        editor={editor}
        activeMode={activeMode}
        placeholder={placeholder}
        markdownValue={markdownValue}
        readOnly={readOnly}
        disabled={disabled}
        toolbarConfig={toolbarConfig}
        showToolbar={showToolbar}
        minHeight={minHeight}
        compact={compact}
        className={className}
        isMobile={isMobile}
        messages={editorMessages}
        onMarkdownChange={onMarkdownChange}
        onSwitchToMarkdown={onSwitchToMarkdown}
        onSwitchToRichtext={onSwitchToRichtext}
      />
    );
  }

  return (
    <SingleViewEditor
      editor={editor}
      placeholder={placeholder}
      minHeight={minHeight}
      compact={compact}
      showToolbar={showToolbar}
      toolbarConfig={toolbarConfig}
      isMobile={isMobile}
      className={className}
      readOnly={readOnly}
      disabled={disabled}
      messages={editorMessages}
    />
  );
};

const ConfigurableTiptapEditor: React.FC<ConfigurableTiptapEditorProps> = (
  props,
) => {
  if (props.readOnly && props.viewerMode === 'static') {
    return <StaticContentViewer {...props} />;
  }

  return <ConfigurableTiptapEditorInner {...props} />;
};

export default ConfigurableTiptapEditor;
