import type { SVGProps } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HeadingDropdown } from './heading-dropdown';

vi.mock('../../../hooks/use-tiptap-editor', () => ({
  useTiptapEditor: () => ({
    editor: {
      isEditable: true,
      commands: {
        focus: vi.fn(),
      },
    },
  }),
}));

vi.mock('../../../core/editor-messages-context', () => ({
  useEditorMessages: () => ({
    toolbarHeading: 'Heading',
    toolbarFormatHeading: 'Format text as heading',
  }),
  getHeadingLevelLabel: (_messages: unknown, level: number) => `Heading ${level}`,
}));

vi.mock('./use-heading-dropdown-menu', () => ({
  useHeadingDropdownMenu: () => ({
    isVisible: true,
    isActive: false,
    canToggle: false,
    Icon: (props: SVGProps<SVGSVGElement>) => (
      <svg {...props} data-testid="heading-icon" />
    ),
  }),
}));

describe('HeadingDropdown trigger state', () => {
  it('keeps the trigger enabled when heading conversion is unavailable for the current selection', () => {
    render(<HeadingDropdown />);

    const button = screen.getByRole('button', {
      name: 'Format text as heading',
    }) as HTMLButtonElement;

    expect(button.disabled).toBe(false);
  });
});
