import { Extension } from '@tiptap/core';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_EDITOR_MESSAGES } from '../types';
import { createEditorExtensions } from './createEditorExtensions';

describe('createEditorExtensions', () => {
  it('assembles built-in extensions from the requested presets', () => {
    const extensions = createEditorExtensions({
      presets: ['base'],
      disableBuiltIns: ['placeholder'],
    });
    const names = extensions.map((extension) => extension.name);

    expect(names).toContain('starterKit');
    expect(names).toContain('taskList');
    expect(names).not.toContain('placeholder');
    expect(names).not.toContain('highlight');
    expect(names).not.toContain('imageUpload');
  });

  it('keeps defaults lean and auto-enables media when upload is configured', () => {
    const customExtension = Extension.create({
      name: 'customFeature',
    });

    const extensions = createEditorExtensions({
      imageUploadHandler: vi.fn(async () => '/uploads/image.png'),
      extensions: [customExtension],
      messages: DEFAULT_EDITOR_MESSAGES,
    });
    const names = extensions.map((extension) => extension.name);

    expect(names).toContain('table');
    expect(names).toContain('imageUpload');
    expect(names).not.toContain('blockMath');
    expect(names).not.toContain('inlineMath');
    expect(names).not.toContain('details');
    expect(names[names.length - 1]).toBe('customFeature');
  });

  it('supports replacing and inserting extension groups through extensionComposition', () => {
    const replacement = Extension.create({
      name: 'replacementFeature',
    });
    const insertedBefore = Extension.create({
      name: 'insertedBeforeLink',
    });
    const insertedAfter = Extension.create({
      name: 'insertedAfterLink',
    });

    const extensions = createEditorExtensions({
      presets: ['base'],
      extensionComposition: [
        {
          key: 'custom-placeholder',
          extension: replacement,
          placement: 'replace',
          target: 'placeholder',
        },
        {
          key: 'before-link',
          extension: insertedBefore,
          placement: 'before',
          target: 'link',
        },
        {
          key: 'after-link',
          extension: insertedAfter,
          placement: 'after',
          target: 'link',
        },
      ],
    });
    const names = extensions.map((extension) => extension.name);

    expect(names).toContain('replacementFeature');
    expect(names).not.toContain('placeholder');
    expect(names.indexOf('insertedBeforeLink')).toBeLessThan(names.indexOf('link'));
    expect(names.indexOf('insertedAfterLink')).toBeGreaterThan(names.indexOf('link'));
  });
});
