import type { Editor } from '@tiptap/react';

export type ContentType = 'markdown' | 'html';

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

/** 图片上传函数类型 */
export type ImageUploadHandler = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal,
) => Promise<string>;

export interface ConfigurableTiptapEditorProps {
  // 内容相关
  value?: string; // 编辑器内容
  contentType?: ContentType; // 内容格式类型：'markdown' 或 'html'
  placeholder?: string; // 占位符
  readOnly?: boolean; // 是否只读
  maxLength?: number; // 最大字符数限制

  // 工具栏相关
  showToolbar?: boolean; // 是否显示工具栏
  toolbarButtons?: ToolbarButton[]; // 显示哪些工具栏按钮，不传则显示全部
  dualView?: boolean; // 是否启用双视图模式（左侧源码，右侧编辑器）

  // 样式相关
  className?: string; // 自定义类名
  minHeight?: string; // 最小高度
  compact?: boolean; // 紧凑模式 - 用于卡片内嵌入显示,移除边框和内边距

  // 上传相关
  uploadHandler?: ImageUploadHandler; // 自定义图片上传函数
  uploadUrl?: string; // 自定义上传接口 URL
  maxFileSize?: number; // 最大文件大小，默认 5MB

  // 回调函数
  onChange?: (
    content: string,
    contentType: ContentType,
    characterCount?: number,
  ) => void; // 内容变化回调
}

export interface ToolbarConfig {
  showUndoRedo: boolean;
  showStructure: boolean;
  showFormatting: boolean;
  showScript: boolean;
  showAlign: boolean;
  showImage: boolean;
  shouldShowButton: (button: ToolbarButton) => boolean;
}

export interface EditorContextType {
  editor: Editor;
}

declare module '@tiptap/react';
