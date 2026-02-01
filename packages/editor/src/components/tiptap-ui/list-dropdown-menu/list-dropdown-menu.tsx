import { forwardRef } from 'react';

import { ListDropdown } from './list-dropdown';
import type { ListDropdownProps } from './list-dropdown';

export type ListDropdownMenuProps = ListDropdownProps;

/**
 * Dropdown menu component for selecting list types in a Tiptap editor.
 * 使用原生实现替代 Radix UI
 */
export const ListDropdownMenu = forwardRef<
  HTMLButtonElement,
  ListDropdownMenuProps
>((props, ref) => {
  return <ListDropdown {...props} ref={ref} />;
});

ListDropdownMenu.displayName = 'ListDropdownMenu';

export default ListDropdownMenu;
