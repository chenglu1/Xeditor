import { describe, expect, it } from 'vitest';

import { createToolbarConfig } from './createToolbarConfig';

describe('createToolbarConfig', () => {
  it('filters unsupported toolbar buttons while preserving custom schema items', () => {
    const customItem = { type: 'custom', id: 'insert-variable' } as const;

    const config = createToolbarConfig({
      toolbarSchema: [['bold', 'underline', customItem], ['image']],
      supportedToolbarButtons: ['bold'],
    });

    expect(config.toolbarSchema).toEqual([['bold', customItem]]);
    expect(config.showFormatting).toBe(true);
    expect(config.showImage).toBe(false);
  });

  it('only exposes the image button when image uploads are enabled', () => {
    const hiddenConfig = createToolbarConfig({
      toolbarSchema: [['image']],
    });
    const visibleConfig = createToolbarConfig({
      toolbarSchema: [['image']],
      includeImageButton: true,
    });

    expect(hiddenConfig.toolbarSchema).toEqual([]);
    expect(hiddenConfig.showImage).toBe(false);
    expect(visibleConfig.toolbarSchema).toEqual([['image']]);
    expect(visibleConfig.showImage).toBe(true);
  });
});
