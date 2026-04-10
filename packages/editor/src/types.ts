import type { AnyExtension, JSONContent } from '@tiptap/core';
import type { Editor } from '@tiptap/react';
import type { KatexOptions } from 'katex';
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

export interface EditorMathOptions {
  katexOptions?: Partial<KatexOptions>;
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
  placeholder: string;
  toolbarRegionLabel: string;
  richTextEditorLabel: string;
  markdownInputLabel: string;
  modeRichText: string;
  modeMarkdown: string;
  toolbarUndo: string;
  toolbarRedo: string;
  toolbarHeading: string;
  toolbarHeadingLevel: (context: { level: number }) => string;
  toolbarFormatHeading: string;
  toolbarList: string;
  toolbarListOptions: string;
  toolbarBulletList: string;
  toolbarOrderedList: string;
  toolbarTaskList: string;
  toolbarBlockquote: string;
  toolbarCodeBlock: string;
  toolbarBold: string;
  toolbarItalic: string;
  toolbarStrike: string;
  toolbarCode: string;
  toolbarUnderline: string;
  toolbarHighlight: string;
  toolbarRemoveHighlight: string;
  toolbarHighlightColors: string;
  toolbarHighlightColor: (context: { label: string }) => string;
  toolbarLink: string;
  toolbarLinkPlaceholder: string;
  toolbarApplyLink: string;
  toolbarOpenLink: string;
  toolbarRemoveLink: string;
  toolbarSuperscript: string;
  toolbarSubscript: string;
  toolbarAlignLeft: string;
  toolbarAlignCenter: string;
  toolbarAlignRight: string;
  toolbarAlignJustify: string;
  toolbarInsertTable: string;
  toolbarAddImage: string;
  toolbarAddImageText: string;
  tableToolbarLabel: string;
  tableAddRowBefore: string;
  tableAddRowAfter: string;
  tableDeleteRow: string;
  tableAddColumnBefore: string;
  tableAddColumnAfter: string;
  tableDeleteColumn: string;
  tableDeleteTable: string;
  uploadClickOrDrop: string;
  uploadDropzoneLabel: string;
  uploadLimit: (context: { limit: number; maxSizeMB: number }) => string;
  uploadInProgress: (context: { count: number }) => string;
  clearAllUploads: string;
  uploadRemoveFile: string;
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
  stickyToolbar?: boolean;
  stickyToolbarTop?: string;
  scrollContainer?: boolean;
  containerHeight?: string;
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
  mathOptions?: EditorMathOptions;

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
  placeholder: 'Write something...',
  toolbarRegionLabel: 'Editor toolbar',
  richTextEditorLabel: 'Rich text editor',
  markdownInputLabel: 'Markdown source',
  modeRichText: 'Rich text mode',
  modeMarkdown: 'Markdown mode',
  toolbarUndo: 'Undo',
  toolbarRedo: 'Redo',
  toolbarHeading: 'Heading',
  toolbarHeadingLevel: ({ level }) => `Heading ${level}`,
  toolbarFormatHeading: 'Format text as heading',
  toolbarList: 'List',
  toolbarListOptions: 'List options',
  toolbarBulletList: 'Bullet list',
  toolbarOrderedList: 'Ordered list',
  toolbarTaskList: 'Task list',
  toolbarBlockquote: 'Blockquote',
  toolbarCodeBlock: 'Code block',
  toolbarBold: 'Bold',
  toolbarItalic: 'Italic',
  toolbarStrike: 'Strike',
  toolbarCode: 'Code',
  toolbarUnderline: 'Underline',
  toolbarHighlight: 'Highlight',
  toolbarRemoveHighlight: 'Remove highlight',
  toolbarHighlightColors: 'Highlight colors',
  toolbarHighlightColor: ({ label }) => `${label} highlight color`,
  toolbarLink: 'Link',
  toolbarLinkPlaceholder: 'Paste a link...',
  toolbarApplyLink: 'Apply link',
  toolbarOpenLink: 'Open in new window',
  toolbarRemoveLink: 'Remove link',
  toolbarSuperscript: 'Superscript',
  toolbarSubscript: 'Subscript',
  toolbarAlignLeft: 'Align left',
  toolbarAlignCenter: 'Align center',
  toolbarAlignRight: 'Align right',
  toolbarAlignJustify: 'Align justify',
  toolbarInsertTable: 'Insert table',
  toolbarAddImage: 'Add image',
  toolbarAddImageText: 'Add',
  tableToolbarLabel: 'Table actions',
  tableAddRowBefore: 'Add row above',
  tableAddRowAfter: 'Add row below',
  tableDeleteRow: 'Delete row',
  tableAddColumnBefore: 'Add column before',
  tableAddColumnAfter: 'Add column after',
  tableDeleteColumn: 'Delete column',
  tableDeleteTable: 'Delete table',
  uploadClickOrDrop: 'Click to upload or drag and drop',
  uploadDropzoneLabel: 'Upload files',
  uploadLimit: ({ limit, maxSizeMB }) =>
    `Maximum ${limit} file${limit === 1 ? '' : 's'}, ${maxSizeMB}MB each.`,
  uploadInProgress: ({ count }) => `Uploading ${count} file${count === 1 ? '' : 's'}`,
  clearAllUploads: 'Clear All',
  uploadRemoveFile: 'Remove file',
};

declare module '@tiptap/react';
