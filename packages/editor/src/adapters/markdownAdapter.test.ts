import { describe, expect, it, vi } from 'vitest';

import {
  convertMarkdownTextAlignToHtml,
  configureMarkdownIt,
  installMarkdownAdapter,
  registerMarkdownParseTransform,
  registerMarkdownSerializeTransform,
  serializeMarkdownTextAlign,
} from './markdownAdapter';

describe('markdownAdapter', () => {
  it('converts custom markdown align blocks into HTML before parsing', () => {
    expect(
      convertMarkdownTextAlignToHtml(':::{align=center}\n## Hello\n:::'),
    ).toBe('<h2 style="text-align: center">Hello</h2>');
  });

  it('wraps aligned blocks with custom markdown syntax during serialization', () => {
    const doc = {
      content: {
        forEach(callback: (node: any) => void) {
          callback({
            type: { name: 'paragraph' },
            attrs: { textAlign: 'center' },
          });
        },
      },
    } as any;

    expect(serializeMarkdownTextAlign(doc, 'Hello')).toBe(
      ':::{align=center}\nHello\n:::',
    );
  });

  it('routes markdown adapter fallback diagnostics through the injected logger', () => {
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
    };
    const editor = {
      storage: {},
      state: {
        doc: undefined,
      },
    } as any;
    const manager = {
      parse: vi.fn((markdown: string) => ({ markdown })),
      serialize: vi.fn(() => 'serialized'),
    };

    registerMarkdownParseTransform(editor, {
      key: 'boom:parse',
      transform: () => {
        throw new Error('parse transform failed');
      },
    });
    registerMarkdownSerializeTransform(editor, {
      key: 'boom:serialize',
      transform: () => {
        throw new Error('serialize transform failed');
      },
    });

    installMarkdownAdapter(editor, {
      manager,
      logger,
    });

    expect(manager.parse('## hello')).toEqual({ markdown: '## hello' });
    expect(manager.serialize({})).toBe('serialized');
    expect(logger.error).toHaveBeenCalledTimes(2);
    expect(String(logger.error.mock.calls[0][0])).toContain('Markdown parse failed');
    expect(String(logger.error.mock.calls[1][0])).toContain(
      'Markdown serialize failed',
    );
  });

  it('routes markdown-it capability warnings through the injected logger', () => {
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
    };
    const markdownIt = {
      set: vi.fn(),
      enable: vi.fn(() => {
        throw new Error('table plugin missing');
      }),
    };

    configureMarkdownIt(markdownIt, { logger });

    expect(markdownIt.set).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      'Markdown-it table plugin is not available.',
      expect.objectContaining({
        phase: 'parse',
      }),
    );
  });
});
