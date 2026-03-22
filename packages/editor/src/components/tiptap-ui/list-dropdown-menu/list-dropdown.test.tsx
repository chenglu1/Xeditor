import type { SVGProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ListDropdown } from './list-dropdown';

const mockMenuState = {
  canToggle: false,
  isActive: false,
  isVisible: true,
};

vi.mock('../../../hooks/use-tiptap-editor', () => ({
  useTiptapEditor: () => ({
    editor: {
      isEditable: true,
    },
  }),
}));

vi.mock('../../../core/editor-messages-context', () => ({
  useEditorMessages: () => ({
    toolbarListOptions: 'List options',
    toolbarList: 'List',
  }),
}));

vi.mock('./use-list-dropdown-menu', () => ({
  useListDropdownMenu: () => ({
    filteredLists: [],
    canToggle: mockMenuState.canToggle,
    isActive: mockMenuState.isActive,
    isVisible: mockMenuState.isVisible,
    Icon: (props: SVGProps<SVGSVGElement>) => (
      <svg {...props} data-testid="list-icon" />
    ),
  }),
}));

describe('ListDropdown disabled visibility', () => {
  it('keeps the trigger enabled when list conversion is unavailable for the current selection', () => {
    render(<ListDropdown />);

    const button = screen.getByRole('button', {
      name: 'List options',
    }) as HTMLButtonElement;

    expect(button).not.toBeNull();
    expect(button.disabled).toBe(false);
  });

  it('still respects an explicit disabled prop from the toolbar', () => {
    render(<ListDropdown disabled={true} />);

    const button = screen.getByRole('button', {
      name: 'List options',
    }) as HTMLButtonElement;

    expect(button).not.toBeNull();
    expect(button.disabled).toBe(true);
  });
});
