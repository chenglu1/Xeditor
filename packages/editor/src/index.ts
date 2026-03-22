// 自动导入样式，使用方无需手动引入
import './styles/index.scss';

export { default as ConfigurableTiptapEditor } from './ConfigurableTiptapEditor';
export { StaticContentViewer } from './views/StaticContentViewer';
export type {
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
  ToolbarButton,
  ToolbarCustomItem,
  ToolbarItem,
  ToolbarRenderItem,
  ToolbarSchema,
  UploadedAsset,
  AssetUploadHandler,
  AssetUploadContext,
  MediaUploadHooks,
  MarkdownDialectOptions,
  ImageUploadHandler,
} from './types';

// 导出上传工具
export {
  uploadImage,
  createUploadHandler,
  DEFAULT_MAX_FILE_SIZE,
} from './lib/upload-utils';
export type { UploadOptions, UploadResponse } from './lib/upload-utils';
