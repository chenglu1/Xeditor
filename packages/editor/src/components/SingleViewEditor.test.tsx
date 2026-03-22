import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SingleViewEditor } from './SingleViewEditor';
import type { ToolbarConfig } from '../types';

vi.mock('@tiptap/react', () => ({
  EditorContent: ({ className }: { className?: string }) => (
    <div data-testid="editor-content" className={className} />
  ),
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

describe('SingleViewEditor', () => {
  it('applies the shared frame props and keeps the configured minHeight', () => {
    const { container } = render(
      <SingleViewEditor
        editor={{} as any}
        placeholder="Type here"
        minHeight="320px"
        compact={true}
        showToolbar={true}
        toolbarConfig={toolbarConfig}
        isMobile={false}
        className="custom-shell"
        readOnly={false}
      />,
    );

    const root = container.firstChild as HTMLElement;
    const editorContentParent = screen.getByTestId('editor-content')
      .parentElement as HTMLElement;
    const editorPane = editorContentParent.parentElement as HTMLElement;

    expect(root.className).toContain('configurable-tiptap-editor');
    expect(root.className).toContain('compact-mode');
    expect(root.className).toContain('custom-shell');
    expect(screen.getByTestId('editor-toolbar')).not.toBeNull();
    expect(editorPane.style.getPropertyValue('--xeditor-pane-min-height')).toBe(
      '320px',
    );
    expect(
      editorContentParent.style.getPropertyValue('--xeditor-pane-body-padding'),
    ).toBe('0px');
  });

  it('omits the formatting toolbar when showToolbar is false', () => {
    render(
      <SingleViewEditor
        editor={{} as any}
        placeholder="Type here"
        minHeight="320px"
        compact={false}
        showToolbar={false}
        toolbarConfig={toolbarConfig}
        isMobile={false}
        readOnly={false}
      />,
    );

    expect(screen.queryByTestId('editor-toolbar')).toBeNull();
  });
});
