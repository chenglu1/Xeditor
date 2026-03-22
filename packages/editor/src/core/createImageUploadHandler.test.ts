import { describe, expect, it, vi } from 'vitest';

import { createImageUploadHandler } from './createImageUploadHandler';

describe('createImageUploadHandler', () => {
  it('reuses an explicit upload handler behavior when provided', async () => {
    const file = new File(['image'], 'cover.png', { type: 'image/png' });
    const uploadHandler = vi.fn(async () => '/uploads/cover.png');
    const handler = createImageUploadHandler({
      uploadHandler,
    });

    await expect(handler?.(file)).resolves.toEqual({
      src: '/uploads/cover.png',
    });
    expect(uploadHandler).toHaveBeenCalledWith(file, {
      abortSignal: undefined,
      onProgress: expect.any(Function),
    });
  });

  it('returns null when no upload integration is configured', () => {
    expect(createImageUploadHandler({})).toBeNull();
  });

  it('creates a generic upload handler when uploadUrl is provided', () => {
    expect(
      createImageUploadHandler({
        uploadUrl: '/upload',
      }),
    ).toEqual(expect.any(Function));
  });

  it('runs media upload hooks around the base upload handler', async () => {
    const file = new File(['image'], 'cover.png', { type: 'image/png' });
    const transformedFile = new File(['image'], 'transformed.png', {
      type: 'image/png',
    });
    const uploadHandler = vi.fn(async () => ({
      src: '/uploads/transformed.png',
      alt: 'Transformed',
    }));
    const validateFile = vi.fn(() => null);
    const beforeUpload = vi.fn(() => [file]);
    const transformFile = vi.fn(() => transformedFile);
    const onUploadStart = vi.fn();
    const onUploadProgress = vi.fn();
    const onUploadSuccess = vi.fn();

    const handler = createImageUploadHandler({
      uploadHandler,
      mediaUpload: {
        validateFile,
        beforeUpload,
        transformFile,
        onUploadStart,
        onUploadProgress,
        onUploadSuccess,
      },
    });

    const result = await handler?.(file, {
      onProgress: ({ progress }) => {
        onUploadProgress(file, progress);
      },
    });

    expect(validateFile).toHaveBeenCalledWith(file);
    expect(beforeUpload).toHaveBeenCalledWith([file]);
    expect(transformFile).toHaveBeenCalledWith(file);
    expect(onUploadStart).toHaveBeenCalledWith(transformedFile);
    expect(uploadHandler).toHaveBeenCalledWith(transformedFile, {
      abortSignal: undefined,
      onProgress: expect.any(Function),
    });
    expect(onUploadSuccess).toHaveBeenCalledWith(transformedFile, {
      src: '/uploads/transformed.png',
      alt: 'Transformed',
    });
    expect(result).toEqual({
      src: '/uploads/transformed.png',
      alt: 'Transformed',
    });
  });
});
