import type { UploadedAsset } from '@chenglu1/xeditor-editor';

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to read file'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function handleDemoImageUpload(
  file: File,
): Promise<UploadedAsset> {
  await new Promise((resolve) => window.setTimeout(resolve, 300));
  const src = await readFileAsDataUrl(file);

  return {
    src,
    alt: file.name,
    title: file.name,
    mimeType: file.type,
    meta: {
      size: file.size,
      source: 'demo',
    },
  };
}
