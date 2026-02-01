import { forwardRef } from 'react';

import { HeadingDropdown } from './heading-dropdown';
import type { HeadingDropdownProps } from './heading-dropdown';

export type HeadingDropdownMenuProps = HeadingDropdownProps;

/**
 * Dropdown menu component for selecting heading levels in a Tiptap editor.
 * 使用简化版实现替代 Radix UI
 */
export const HeadingDropdownMenu = forwardRef<
  HTMLButtonElement,
  HeadingDropdownMenuProps
>((props, ref) => {
  return <HeadingDropdown {...props} ref={ref} />;
});

HeadingDropdownMenu.displayName = 'HeadingDropdownMenu';

export default HeadingDropdownMenu;
