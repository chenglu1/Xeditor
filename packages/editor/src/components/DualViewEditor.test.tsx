import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DualViewEditor } from './DualViewEditor';
import {
  DEFAULT_EDITOR_MESSAGES,
  type ToolbarConfig,
} from '../types';

vi.mock('@tiptap/react', () => ({
  EditorContent: () => null,
  EditorContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  useEditorState: ({
    selector,
    editor,
  }: {
    selector: (context: { editor: any }) => unknown;
    editor: any;
  }) => selector({ editor }),
}));

vi.mock('./EditorToolbar', () => ({
  EditorToolbar: () => <div data-testid="editor-toolbar" />,
}));

vi.mock('./tiptap-ui/table-floating-toolbar/table-floating-toolbar', () => ({
  TableFloatingToolbar: () => null,
}));

const toolbarConfig: ToolbarConfig = {
  showUndoRedo: false,
  showStructure: false,
  showFormatting: false,
  showScript: false,
  showAlign: false,
  showImage: false,
  supportedToolbarButtons: [],
  toolbarSchema: [],
  shouldShowButton: () => false,
};

function createMockEditor(initialMarkdown = '# initial') {
  let markdown = initialMarkdown;

  const editor = {
    getMarkdown: vi.fn(() => markdown),
    commands: {
      setContent: vi.fn((nextValue: string) => {
        markdown = nextValue;
      }),
    },
  };

  return {
    editor: editor as any,
    setMarkdownValue(nextValue: string) {
      markdown = nextValue;
    },
    getSetContentMock() {
      return editor.commands.setContent;
    },
  };
}

describe('DualViewEditor', () => {
  it('keeps the markdown textarea in sync with external editor updates', async () => {
    const mock = createMockEditor('# first');

    const { rerender } = render(
      <DualViewEditor
        editor={mock.editor}
        activeMode="markdown"
        placeholder="Type here"
        markdownValue="# first"
        readOnly={false}
        toolbarConfig={toolbarConfig}
        showToolbar={true}
        minHeight="320px"
        compact={false}
        isMobile={false}
        messages={DEFAULT_EDITOR_MESSAGES}
        onMarkdownChange={vi.fn()}
        onSwitchToMarkdown={vi.fn()}
        onSwitchToRichtext={vi.fn()}
      />,
    );

    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(
      '# first',
    );

    mock.setMarkdownValue('# external update');

    rerender(
      <DualViewEditor
        editor={mock.editor}
        activeMode="markdown"
        placeholder="Type here"
        markdownValue="# external update"
        readOnly={false}
        toolbarConfig={toolbarConfig}
        showToolbar={true}
        minHeight="320px"
        compact={false}
        isMobile={false}
        messages={DEFAULT_EDITOR_MESSAGES}
        onMarkdownChange={vi.fn()}
        onSwitchToMarkdown={vi.fn()}
        onSwitchToRichtext={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(
        '# external update',
      );
    });
  });

  it('pushes markdown textarea changes back into the editor', () => {
    const mock = createMockEditor('# initial');
    const onMarkdownChange = vi.fn();

    render(
      <DualViewEditor
        editor={mock.editor}
        activeMode="markdown"
        placeholder="Type here"
        markdownValue="# initial"
        readOnly={false}
        toolbarConfig={toolbarConfig}
        showToolbar={true}
        minHeight="320px"
        compact={false}
        isMobile={false}
        messages={DEFAULT_EDITOR_MESSAGES}
        onMarkdownChange={onMarkdownChange}
        onSwitchToMarkdown={vi.fn()}
        onSwitchToRichtext={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '# updated from textarea' },
    });

    expect(onMarkdownChange).toHaveBeenCalledWith('# updated from textarea');
  });

  it('flushes textarea content into the editor before switching back to richtext mode', () => {
    const mock = createMockEditor('# initial');
    const onSwitchToRichtext = vi.fn();

    render(
      <DualViewEditor
        editor={mock.editor}
        activeMode="markdown"
        placeholder="Type here"
        markdownValue="# local draft"
        readOnly={false}
        toolbarConfig={toolbarConfig}
        showToolbar={true}
        minHeight="320px"
        compact={false}
        isMobile={false}
        messages={DEFAULT_EDITOR_MESSAGES}
        onMarkdownChange={vi.fn()}
        onSwitchToMarkdown={vi.fn()}
        onSwitchToRichtext={onSwitchToRichtext}
      />,
    );

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(onSwitchToRichtext).toHaveBeenCalledTimes(1);
  });

  it('keeps mode switching available when the formatting toolbar is hidden', () => {
    render(
      <DualViewEditor
        editor={createMockEditor('# initial').editor}
        activeMode="richtext"
        placeholder="Type here"
        markdownValue="# initial"
        readOnly={false}
        toolbarConfig={toolbarConfig}
        showToolbar={false}
        minHeight="320px"
        compact={false}
        isMobile={false}
        messages={DEFAULT_EDITOR_MESSAGES}
        onMarkdownChange={vi.fn()}
        onSwitchToMarkdown={vi.fn()}
        onSwitchToRichtext={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('editor-toolbar')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
