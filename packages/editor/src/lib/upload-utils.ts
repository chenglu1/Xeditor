import type { AssetUploadContext, UploadedAsset } from '../types';

export interface UploadOptions {
  file: File;
  onProgress?: (event: { progress: number }) => void;
  abortSignal?: AbortSignal;
  uploadUrl?: string;
  headers?: Record<string, string>;
  fileFieldName?: string;
  extraFormData?: Record<string, string | Blob>;
  parseResponse?: (response: unknown) => string | UploadedAsset;
}

export interface UploadResponse {
  code: number;
  data: string;
  msg?: string;
}

export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

const defaultParseResponse = (
  response: UploadResponse,
): string | UploadedAsset => {
  if (response.code === 0 && response.data) {
    return response.data;
  }

  throw new Error(response.msg || 'Upload failed');
};

export const uploadImage = async (
  options: UploadOptions,
): Promise<string | UploadedAsset> => {
  const {
    file,
    onProgress,
    abortSignal,
    uploadUrl,
    headers = {},
    fileFieldName = 'file',
    extraFormData = {},
    parseResponse = defaultParseResponse,
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  if (!uploadUrl) {
    throw new Error(
      'No upload URL configured. Provide uploadUrl or a custom uploadHandler.',
    );
  }

  const formData = new FormData();
  formData.append(fileFieldName, file);

  Object.entries(extraFormData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress({ progress });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(parseResponse(response));
        } catch (error) {
          reject(
            error instanceof Error
              ? error
              : new Error('Failed to parse response'),
          );
        }
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    xhr.open('POST', uploadUrl);

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.send(formData);
  });
};

export const createUploadHandler = (
  customOptions?: Partial<
    Omit<UploadOptions, 'file' | 'onProgress' | 'abortSignal'>
  >,
) => {
  return async (
    file: File,
    context?: AssetUploadContext,
  ): Promise<string | UploadedAsset> => {
    return uploadImage({
      file,
      onProgress: context?.onProgress,
      abortSignal: context?.abortSignal,
      ...customOptions,
    });
  };
};
