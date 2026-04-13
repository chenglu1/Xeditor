import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { Editor } from '@tiptap/react';

import ConfigurableTiptapEditor from './ConfigurableTiptapEditor';

vi.mock('./hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

describe('toolbar click integration', () => {
  it('applies blockquote and code block formatting when the toolbar buttons are clicked', async () => {
    const editorRef = createRef<Editor | null>();
    const user = userEvent.setup();

    render(
      <ConfigurableTiptapEditor
        editorRef={editorRef}
        value="hello world"
        valueType="markdown"
        toolbarButtons={['blockquote', 'codeBlock']}
      />,
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
    });

    await act(async () => {
      editorRef.current?.commands.focus();
      editorRef.current?.commands.setTextSelection({ from: 1, to: 6 });
    });

    await user.click(screen.getByRole('button', { name: 'Blockquote' }));

    await waitFor(() => {
      expect(editorRef.current?.isActive('blockquote')).toBe(true);
    });

    await act(async () => {
      editorRef.current?.commands.setContent('<p>hello world</p>');
      editorRef.current?.commands.focus();
      editorRef.current?.commands.setTextSelection({ from: 1, to: 6 });
    });

    await user.click(screen.getByRole('button', { name: 'Code block' }));

    await waitFor(() => {
      expect(editorRef.current?.isActive('codeBlock')).toBe(true);
    });
  });
});