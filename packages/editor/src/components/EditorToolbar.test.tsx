import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EditorToolbar } from './EditorToolbar';
import { EditorMessagesProvider } from '../core/editor-messages-context';
import { DEFAULT_EDITOR_MESSAGES, type ToolbarConfig } from '../types';

const mockHeadingDropdownMenu = vi.fn(() => null);

vi.mock('./tiptap-ui/heading-dropdown-menu', () => ({
  HeadingDropdownMenu: (props: unknown) => mockHeadingDropdownMenu(props),
}));

describe('EditorToolbar', () => {
  it('forwards mobile state to custom toolbar renderers', () => {
    const renderToolbarItem = vi.fn(() => <button type="button">Custom</button>);
    const config: ToolbarConfig = {
      showUndoRedo: false,
      showStructure: false,
      showFormatting: false,
      showScript: false,
      showAlign: false,
      showImage: false,
      supportedToolbarButtons: [],
      toolbarSchema: [[{ type: 'custom', id: 'custom-action' }]],
      renderToolbarItem,
      shouldShowButton: () => false,
    };

    render(
      <EditorMessagesProvider messages={DEFAULT_EDITOR_MESSAGES}>
        <EditorToolbar config={config} isMobile={true} />
      </EditorMessagesProvider>,
    );

    expect(screen.getByRole('toolbar', { name: 'Editor toolbar' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Custom' })).not.toBeNull();
    expect(renderToolbarItem).toHaveBeenCalledWith(
      expect.objectContaining({
        isMobile: true,
      }),
    );
  });

  it('exposes heading levels h1 through h6 in the built-in heading dropdown', () => {
    mockHeadingDropdownMenu.mockClear();

    const config: ToolbarConfig = {
      showUndoRedo: false,
      showStructure: true,
      showFormatting: false,
      showScript: false,
      showAlign: false,
      showImage: false,
      supportedToolbarButtons: ['heading'],
      toolbarSchema: [['heading']],
      shouldShowButton: () => true,
    };

    render(
      <EditorMessagesProvider messages={DEFAULT_EDITOR_MESSAGES}>
        <EditorToolbar config={config} isMobile={false} />
      </EditorMessagesProvider>,
    );

    expect(mockHeadingDropdownMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: [1, 2, 3, 4, 5, 6],
      }),
    );
  });
});
