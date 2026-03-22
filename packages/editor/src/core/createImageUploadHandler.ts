import { createUploadHandler } from '../lib/upload-utils';
import type {
  AssetUploadHandler,
  MediaUploadHooks,
  UploadedAsset,
} from '../types';

interface CreateImageUploadHandlerOptions {
  uploadHandler?: AssetUploadHandler;
  uploadUrl?: string;
  maxFileSize?: number;
  mediaUpload?: MediaUploadHooks;
}

function normalizeUploadedAsset(result: string | UploadedAsset): UploadedAsset {
  if (typeof result === 'string') {
    return {
      src: result,
    };
  }

  return result;
}

export function createImageUploadHandler({
  uploadHandler,
  uploadUrl,
  maxFileSize,
  mediaUpload,
}: CreateImageUploadHandlerOptions): AssetUploadHandler | null {
  const baseHandler =
    uploadHandler ||
    (uploadUrl
      ? createUploadHandler({
          uploadUrl,
          extraFormData: maxFileSize ? {} : undefined,
        })
      : null);

  if (!baseHandler) {
    return null;
  }

  return async (file, context) => {
    try {
      const validatedError = mediaUpload?.validateFile?.(file);
      if (validatedError) {
        throw validatedError;
      }

      const preparedFiles =
        (await mediaUpload?.beforeUpload?.([file])) || [file];
      const nextFile = preparedFiles[0];

      if (!nextFile) {
        throw new Error('Upload was cancelled before it started.');
      }

      const transformedFile = mediaUpload?.transformFile
        ? await mediaUpload.transformFile(nextFile)
        : nextFile;

      mediaUpload?.onUploadStart?.(transformedFile);

      const result = await baseHandler(transformedFile, {
        onProgress: (event) => {
          context?.onProgress?.(event);
          mediaUpload?.onUploadProgress?.(transformedFile, event.progress);
        },
        abortSignal: context?.abortSignal,
      });

      const asset = normalizeUploadedAsset(result);
      mediaUpload?.onUploadSuccess?.(transformedFile, asset);
      return asset;
    } catch (error) {
      const uploadError =
        error instanceof Error ? error : new Error('Upload failed');
      mediaUpload?.onUploadError?.(file, uploadError);
      throw uploadError;
    }
  };
}
