/**
 * 通用图片上传工具
 * 支持自定义上传接口、请求头、进度回调等
 */

export interface UploadOptions {
  /** 上传的文件 */
  file: File;
  /** 上传进度回调 */
  onProgress?: (event: { progress: number }) => void;
  /** 取消上传信号 */
  abortSignal?: AbortSignal;
  /** 自定义上传接口 URL，默认使用 '/tenant-api/tai/config/img/upload' */
  uploadUrl?: string;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** FormData 中文件字段名，默认为 'file' */
  fileFieldName?: string;
  /** 额外的 FormData 字段 */
  extraFormData?: Record<string, string | Blob>;
  /** 自定义响应解析函数 */
  parseResponse?: (response: unknown) => string;
}

export interface UploadResponse {
  code: number;
  data: string;
  msg?: string;
}

/** 默认最大文件大小 5MB */
export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

/** 默认上传接口地址 */
export const DEFAULT_UPLOAD_URL = '/tenant-api/tai/config/img/upload';

/**
 * 默认响应解析函数
 * 适配 { code: 0, data: "url", msg: "" } 格式
 */
const defaultParseResponse = (response: UploadResponse): string => {
  if (response.code === 0 && response.data) {
    return response.data;
  }
  throw new Error(response.msg || 'Upload failed');
};

/**
 * 通用图片上传函数
 * @param options 上传配置选项
 * @returns Promise resolving to the URL of the uploaded image
 */
export const uploadImage = async (options: UploadOptions): Promise<string> => {
  const {
    file,
    onProgress,
    abortSignal,
    uploadUrl = DEFAULT_UPLOAD_URL,
    headers = {},
    fileFieldName = 'file',
    extraFormData = {},
    parseResponse = defaultParseResponse,
  } = options;

  // 验证文件
  if (!file) {
    throw new Error('No file provided');
  }

  // 构建 FormData
  const formData = new FormData();
  formData.append(fileFieldName, file);

  // 添加额外的表单字段
  Object.entries(extraFormData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // 获取默认的认证信息
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 监听取消信号
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }

    // 监听上传进度
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress({ progress });
      }
    });

    // 监听请求完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const url = parseResponse(response);
          resolve(url);
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

    // 监听请求错误
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    // 监听请求中止
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // 发送请求
    xhr.open('POST', uploadUrl);

    // 设置默认的认证 headers
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    if (tenantId) {
      xhr.setRequestHeader('tenant-id', tenantId);
    }

    // 设置自定义 headers
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.send(formData);
  });
};

/**
 * 创建上传函数工厂
 * 用于生成适配 TipTap 编辑器的上传函数
 * @param customOptions 自定义配置
 * @returns 适配 TipTap 的上传函数
 */
export const createUploadHandler = (
  customOptions?: Partial<
    Omit<UploadOptions, 'file' | 'onProgress' | 'abortSignal'>
  >,
) => {
  return async (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal,
  ): Promise<string> => {
    return uploadImage({
      file,
      onProgress,
      abortSignal,
      ...customOptions,
    });
  };
};
