export { default as ConfigurableTiptapEditor } from './ConfigurableTiptapEditor';
export type {
  ConfigurableTiptapEditorProps,
  ContentType,
  ToolbarButton,
} from './ConfigurableTiptapEditor';
export type { ImageUploadHandler } from './types';

export {
  uploadImage,
  createUploadHandler,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_UPLOAD_URL,
} from './lib/upload-utils';
export type { UploadOptions, UploadResponse } from './lib/upload-utils';

