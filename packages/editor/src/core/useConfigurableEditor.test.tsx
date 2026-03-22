import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useConfigurableEditor } from './useConfigurableEditor';

const mockUseEditor = vi.fn();
const mockCreateEditorExtensions = vi.fn(() => []);
const mockUseIsMobile = vi.fn(() => false);

vi.mock('@tiptap/react', () => ({
  useEditor: (options: unknown) => mockUseEditor(options),
}));

vi.mock('../extensions/createEditorExtensions', () => ({
  createEditorExtensions: (options: unknown) =>
    mockCreateEditorExtensions(options),
}));

vi.mock('../hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

function createMockEditor(initialMarkdown = '# initial') {
  let markdown = initialMarkdown;

  const editor = {
    getMarkdown: vi.fn(() => markdown),
    getHTML: vi.fn(() => `<p>${markdown}</p>`),
    getJSON: vi.fn(() => ({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: markdown }],
        },
      ],
    })),
    state: {
      doc: {
        textContent: initialMarkdown,
      },
    },
    commands: {
      setContent: vi.fn((nextValue: any) => {
        markdown =
          typeof nextValue === 'string' ? nextValue : JSON.stringify(nextValue);
        editor.state.doc.textContent = markdown;
      }),
    },
  };

  return editor;
}

describe('useConfigurableEditor', () => {
  beforeEach(() => {
    mockUseEditor.mockReset();
    mockCreateEditorExtensions.mockClear();
    mockUseIsMobile.mockReturnValue(false);
  });

  it('degrades dualView to single-view mode for non-markdown content and reports the warning through logger once', () => {
    const mockEditor = createMockEditor();
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockUseEditor.mockImplementation(() => mockEditor);

    const { result, rerender } = renderHook(() =>
      useConfigurableEditor({
        value: '<p>hello</p>',
        contentType: 'html',
        dualView: true,
        logger,
      }),
    );

    expect(result.current.isDualViewEnabled).toBe(false);

    rerender();

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(String(logger.warn.mock.calls[0][0])).toContain(
      'dualView only supports markdown',
    );
  });

  it('uses defaultValue as the initial uncontrolled content', () => {
    const mockEditor = createMockEditor('# draft');
    let latestOptions: any;

    mockUseEditor.mockImplementation((options) => {
      latestOptions = options;
      return mockEditor;
    });

    const { result } = renderHook(() =>
      useConfigurableEditor({
        defaultValue: '# draft',
        valueType: 'markdown',
      }),
    );

    expect(latestOptions.content).toBe('# draft');
    expect(result.current.markdownValue).toBe('# draft');
  });

  it('keeps markdown source state aligned with editor updates when dualView is enabled', () => {
    const mockEditor = createMockEditor('# initial');
    let latestOptions: any;

    mockUseEditor.mockImplementation((options) => {
      latestOptions = options;
      return mockEditor;
    });

    const { result } = renderHook(() =>
      useConfigurableEditor({
        value: '# initial',
        contentType: 'markdown',
        dualView: true,
      }),
    );

    expect(result.current.markdownValue).toBe('# initial');

    mockEditor.getMarkdown.mockReturnValue('## from editor update');
    act(() => {
      latestOptions.onUpdate({ editor: mockEditor });
    });

    return waitFor(() => {
      expect(result.current.markdownValue).toBe('## from editor update');
    });
  });

  it('emits structured update events for json mode', () => {
    const mockEditor = createMockEditor('# initial');
    const onUpdate = vi.fn();
    let latestOptions: any;
    const jsonValue = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '# initial' }],
        },
      ],
    };

    mockEditor.getJSON.mockReturnValue(jsonValue);
    mockEditor.state.doc.textContent = '# initial';

    mockUseEditor.mockImplementation((options) => {
      latestOptions = options;
      return mockEditor;
    });

    renderHook(() =>
      useConfigurableEditor({
        value: jsonValue,
        valueType: 'json',
        onUpdate,
      }),
    );

    act(() => {
      latestOptions.onUpdate({ editor: mockEditor });
    });

    expect(onUpdate.mock.calls.at(-1)?.[0]).toEqual({
      value: jsonValue,
      valueType: 'json',
      characterCount: '# initial'.length,
      wordCount: 2,
      source: 'user',
    });
  });

  it('assigns the editor instance to editorRef and passes generalized options to extension assembly', () => {
    const mockEditor = createMockEditor('# initial');
    const editorRef = { current: null as unknown };

    mockUseEditor.mockImplementation(() => mockEditor);

    renderHook(() =>
      useConfigurableEditor({
        value: '# initial',
        valueType: 'markdown',
        editorRef,
        presets: ['base', 'media'],
        extensionComposition: [
          {
            key: 'after-link',
            placement: 'after',
            target: 'link',
            extension: {
              name: 'afterLinkExtension',
            } as any,
          },
        ],
        disableBuiltIns: ['placeholder'],
        messages: {
          loading: 'Loading custom editor',
        },
      }),
    );

    expect(editorRef.current).toBe(mockEditor);
    expect(mockCreateEditorExtensions).toHaveBeenCalledWith(
      expect.objectContaining({
        presets: ['base', 'media'],
        extensionComposition: expect.any(Array),
        disableBuiltIns: ['placeholder'],
        messages: expect.objectContaining({
          loading: 'Loading custom editor',
        }),
      }),
    );
  });

  it('reports recoverable serialization errors through onError', () => {
    const mockEditor = createMockEditor('# initial');
    const onError = vi.fn();
    let latestOptions: any;

    mockEditor.getJSON.mockImplementation(() => {
      throw new Error('boom');
    });

    mockUseEditor.mockImplementation((options) => {
      latestOptions = options;
      return mockEditor;
    });

    renderHook(() =>
      useConfigurableEditor({
        defaultValue: {
          type: 'doc',
          content: [],
        },
        valueType: 'json',
        onError,
      }),
    );

    act(() => {
      latestOptions.onUpdate({ editor: mockEditor });
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: 'serialize',
        recoverable: true,
      }),
    );
  });
});
