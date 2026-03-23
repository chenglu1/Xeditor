import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StaticContentViewer } from './StaticContentViewer';

const mockGenerateHTML = vi.fn();
const mockGenerateJSON = vi.fn();
const mockMarkdownParse = vi.fn();
const mockCreateEditorExtensions = vi.fn(() => []);
const mockPreprocessMarkdownForDialect = vi.fn();

vi.mock('@tiptap/core', () => ({
  generateHTML: (...args: unknown[]) => mockGenerateHTML(...args),
  generateJSON: (...args: unknown[]) => mockGenerateJSON(...args),
}));

vi.mock('@tiptap/markdown', () => ({
  MarkdownManager: vi.fn().mockImplementation(() => ({
    parse: (...args: unknown[]) => mockMarkdownParse(...args),
  })),
}));

vi.mock('../adapters/markdownAdapter', async () => {
  const actual = await vi.importActual<typeof import('../adapters/markdownAdapter')>(
    '../adapters/markdownAdapter'
  );

  return {
    ...actual,
    preprocessMarkdownForDialect: (...args: Parameters<typeof actual.preprocessMarkdownForDialect>) =>
      mockPreprocessMarkdownForDialect(...args),
  };
});

vi.mock('../extensions/createEditorExtensions', () => ({
  createEditorExtensions: (...args: unknown[]) =>
    mockCreateEditorExtensions(...(args as any)),
}));

describe('StaticContentViewer', () => {
  beforeEach(() => {
    mockGenerateHTML.mockReset();
    mockGenerateJSON.mockReset();
    mockMarkdownParse.mockReset();
    mockCreateEditorExtensions.mockClear();
    mockPreprocessMarkdownForDialect.mockReset();

    mockGenerateJSON.mockReturnValue({
      type: 'doc',
      content: [],
    });
    mockPreprocessMarkdownForDialect.mockImplementation((value: string) => value);
    mockMarkdownParse.mockReturnValue({
      type: 'doc',
      content: [],
    });
    mockGenerateHTML.mockReturnValue('<p>safe</p>');
  });

  it('runs sanitizeHtml before rendering static HTML output', () => {
    mockGenerateHTML.mockReturnValueOnce('<p>safe</p><script>alert(1)</script>');
    const sanitizeHtml = vi.fn((html: string) =>
      html.replace('<script>alert(1)</script>', ''),
    );
    const { container } = render(
      <StaticContentViewer
        value="<p>unsafe</p>"
        valueType="html"
        sanitizeHtml={sanitizeHtml}
      />,
    );

    expect(sanitizeHtml).toHaveBeenCalledWith(
      '<p>safe</p><script>alert(1)</script>',
      expect.objectContaining({
        source: 'static-viewer',
        valueType: 'html',
        value: '<p>unsafe</p>',
      }),
    );
    expect(container.querySelector('.tiptap')?.innerHTML).toBe('<p>safe</p>');
  });

  it('falls back to raw content and reports viewer errors when sanitizeHtml throws', () => {
    const onError = vi.fn();

    render(
      <StaticContentViewer
        value="<p>unsafe</p>"
        valueType="html"
        sanitizeHtml={() => {
          throw new Error('sanitize failed');
        }}
        onError={onError}
      />,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: 'viewer',
        recoverable: true,
      }),
    );
    expect(screen.getByText('<p>unsafe</p>')).not.toBeNull();
  });

  it('warns through logger when html static rendering is used without sanitizeHtml', () => {
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
    };

    render(
      <StaticContentViewer
        value="<p>unsafe</p>"
        valueType="html"
        logger={logger}
      />,
    );

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(String(logger.warn.mock.calls[0][0])).toContain(
      'without sanitizeHtml',
    );
  });

  it('does not rebuild static renderer work when only frame props change', () => {
    const { rerender } = render(
      <StaticContentViewer
        value="# Title"
        valueType="markdown"
        className="viewer-shell"
      />,
    );

    expect(mockCreateEditorExtensions).toHaveBeenCalledTimes(1);

    rerender(
      <StaticContentViewer
        value="# Title"
        valueType="markdown"
        className="viewer-shell compact"
        compact
        minHeight="180px"
      />,
    );

    expect(mockCreateEditorExtensions).toHaveBeenCalledTimes(1);
  });

  it('reuses the shared markdown preprocessing pipeline for standalone images', () => {
    const markdown = [
      'Before image',
      '![Cover](https://example.com/cover.png)',
      'After image',
    ].join('\n');
    mockPreprocessMarkdownForDialect.mockImplementationOnce((value: string) => value);

    render(<StaticContentViewer value={markdown} valueType="markdown" />);

    expect(mockPreprocessMarkdownForDialect).toHaveBeenCalledWith(
      markdown,
      undefined,
    );
  });

  it('allows standalone image spacing normalization to be disabled for static markdown rendering', () => {
    const markdown = [
      'Before image',
      '![Cover](https://example.com/cover.png)',
      'After image',
    ].join('\n');
    const dialect = { standaloneImageSpacing: false } as const;
    mockPreprocessMarkdownForDialect.mockImplementationOnce((value: string) => value);

    render(
      <StaticContentViewer
        value={markdown}
        valueType="markdown"
        markdownDialect={dialect}
      />,
    );

    expect(mockPreprocessMarkdownForDialect).toHaveBeenCalledWith(
      markdown,
      dialect,
    );
  });
});
