import type { AnyExtension, JSONContent } from '@tiptap/core';
import type { Editor } from '@tiptap/react';
import type { ReactNode, Ref } from 'react';

export type ContentType = 'markdown' | 'html';
export type EditorValueType = 'json' | 'markdown' | 'html';
export type EditorValue = string | JSONContent;

export type ToolbarButton =
  | 'undo'
  | 'redo'
  | 'heading'
  | 'list'
  | 'blockquote'
  | 'codeBlock'
  | 'table'
  | 'bold'
  | 'italic'
  | 'strike'
  | 'code'
  | 'underline'
  | 'highlight'
  | 'link'
  | 'superscript'
  | 'subscript'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'image';

export interface ToolbarCustomItem {
  type: 'custom';
  id: string;
}

export type ToolbarItem = ToolbarButton | ToolbarCustomItem;
export type ToolbarSchema = ToolbarItem[][];

export type EditorExtensionPlacement =
  | 'append'
  | 'prepend'
  | 'before'
  | 'after'
  | 'replace';

export interface EditorExtensionCompositionItem {
  key: string;
  extension: AnyExtension | AnyExtension[];
  placement?: EditorExtensionPlacement;
  target?: string;
}

export type ToolbarRenderItem = (context: {
  item: ToolbarItem;
  isMobile: boolean;
  supportedToolbarButtons: ToolbarButton[];
}) => ReactNode;

export type EditorPresetName =
  | 'base'
  | 'formatting'
  | 'table'
  | 'math'
  | 'media'
  | 'details'
  | 'markdownDialect';

export interface MarkdownDialectOptions {
  normalizeListIndentation?: boolean;
  normalizeTables?: boolean;
  preserveOrderedListStart?: boolean;
  textAlignSyntax?: 'disabled' | 'directive';
  standaloneImageSpacing?: boolean;
}

export interface EditorUpdateEvent {
  value: EditorValue;
  valueType: EditorValueType;
  characterCount: number;
  wordCount?: number;
  source: 'user' | 'external-sync' | 'mode-switch';
}

export interface EditorErrorEvent {
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

export interface EditorLogger {
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
}

export interface EditorHtmlSanitizeContext {
  source: 'static-viewer';
  valueType: EditorValueType;
  value: EditorValue;
}

export type EditorHtmlSanitizer = (
  html: string,
  context: EditorHtmlSanitizeContext,
) => string;

export interface UploadedAsset {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  meta?: Record<string, unknown>;
}

export interface AssetUploadContext {
  onProgress?: (event: { progress: number }) => void;
  abortSignal?: AbortSignal;
}

export type AssetUploadResult = string | UploadedAsset;

export type AssetUploadHandler = (
  file: File,
  context?: AssetUploadContext,
) => Promise<AssetUploadResult>;

export type ImageUploadHandler = AssetUploadHandler;

export interface MediaUploadHooks {
  beforeUpload?: (files: File[]) => Promise<File[] | void> | File[] | void;
  validateFile?: (file: File) => Error | null | void;
  transformFile?: (file: File) => Promise<File> | File;
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (file: File, progress: number) => void;
  onUploadSuccess?: (file: File, asset: UploadedAsset) => void;
  onUploadError?: (file: File, error: Error) => void;
}

export interface EditorMessages {
  loading: string;
  modeRichText: string;
  modeMarkdown: string;
  uploadClickOrDrop: string;
  uploadLimit: (context: { limit: number; maxSizeMB: number }) => string;
  uploadInProgress: (context: { count: number }) => string;
  clearAllUploads: string;
}

export interface ConfigurableTiptapEditorProps {
  value?: EditorValue;
  defaultValue?: EditorValue;
  valueType?: EditorValueType;
  contentType?: ContentType;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;

  showToolbar?: boolean;
  toolbarButtons?: ToolbarButton[];
  supportedToolbarButtons?: ToolbarButton[];
  toolbarSchema?: ToolbarSchema;
  renderToolbarItem?: ToolbarRenderItem;
  dualView?: boolean;

  className?: string;
  minHeight?: string;
  compact?: boolean;
  viewerMode?: 'static' | 'editor-shell';
  messages?: Partial<EditorMessages>;
  sanitizeHtml?: EditorHtmlSanitizer;
  logger?: Partial<EditorLogger>;

  uploadHandler?: AssetUploadHandler;
  uploadUrl?: string;
  maxFileSize?: number;
  mediaUpload?: MediaUploadHooks;

  presets?: EditorPresetName[];
  extensions?: AnyExtension[];
  extensionComposition?: EditorExtensionCompositionItem[];
  disableBuiltIns?: string[];
  markdownDialect?: MarkdownDialectOptions;

  editorRef?: Ref<Editor | null>;
  onUpdate?: (event: EditorUpdateEvent) => void;
  onError?: (event: EditorErrorEvent) => void;
  onChange?: (
    content: string,
    contentType: ContentType,
    characterCount?: number,
  ) => void;
}

export interface ToolbarConfig {
  showUndoRedo: boolean;
  showStructure: boolean;
  showFormatting: boolean;
  showScript: boolean;
  showAlign: boolean;
  showImage: boolean;
  supportedToolbarButtons: ToolbarButton[];
  toolbarSchema: ToolbarSchema;
  renderToolbarItem?: ToolbarRenderItem;
  shouldShowButton: (button: ToolbarButton) => boolean;
}

export interface EditorContextType {
  editor: Editor;
}

export const DEFAULT_EDITOR_MESSAGES: EditorMessages = {
  loading: 'Loading editor...',
  modeRichText: 'Rich text mode',
  modeMarkdown: 'Markdown mode',
  uploadClickOrDrop: 'Click to upload or drag and drop',
  uploadLimit: ({ limit, maxSizeMB }) =>
    `Maximum ${limit} file${limit === 1 ? '' : 's'}, ${maxSizeMB}MB each.`,
  uploadInProgress: ({ count }) => `Uploading ${count} file${count === 1 ? '' : 's'}`,
  clearAllUploads: 'Clear All',
};

declare module '@tiptap/react';
