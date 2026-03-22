'use client';

import type { Editor } from '@tiptap/react';
import { useMemo } from 'react';

// --- Hooks ---
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';
import {
  getListTypeLabel,
  useEditorMessages,
} from '../../../core/editor-messages-context';

// --- Icons ---
import { isNodeInSchema } from '../../../lib/tiptap-utils';
import { ListIcon } from '../../tiptap-icons/list-icon';
import { ListOrderedIcon } from '../../tiptap-icons/list-ordered-icon';
import { ListTodoIcon } from '../../tiptap-icons/list-todo-icon';

// --- Lib ---

// --- Tiptap UI ---
import {
  canToggleList,
  isListActive,
  listIcons,
  type ListType,
} from '../list-button';

/**
 * Configuration for the list dropdown menu functionality
 */
export interface UseListDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The list types to display in the dropdown.
   * @default ["bulletList", "orderedList", "taskList"]
   */
  types?: ListType[];
  /**
   * Whether the dropdown should be hidden when no list types are available
   * @default false
   */
  hideWhenUnavailable?: boolean;
}

export interface ListOption {
  label: string;
  type: ListType;
  icon: React.ElementType;
}

export function createListOptions(messages: ReturnType<typeof useEditorMessages>): ListOption[] {
  return [
    {
      label: getListTypeLabel(messages, 'bulletList'),
      type: 'bulletList',
      icon: ListIcon,
    },
    {
      label: getListTypeLabel(messages, 'orderedList'),
      type: 'orderedList',
      icon: ListOrderedIcon,
    },
    {
      label: getListTypeLabel(messages, 'taskList'),
      type: 'taskList',
      icon: ListTodoIcon,
    },
  ];
}

export function canToggleAnyList(
  editor: Editor | null,
  listTypes: ListType[],
): boolean {
  if (!editor || !editor.isEditable) return false;
  return listTypes.some((type) => canToggleList(editor, type));
}

export function isAnyListActive(
  editor: Editor | null,
  listTypes: ListType[],
): boolean {
  if (!editor) return false;
  return listTypes.some((type) => isListActive(editor, type));
}

export function getFilteredListOptions(
  options: ListOption[],
  availableTypes: ListType[],
): ListOption[] {
  return options.filter(
    (option) => !option.type || availableTypes.includes(option.type),
  );
}

export function shouldShowListDropdown(params: {
  editor: Editor | null;
  listTypes: ListType[];
  hideWhenUnavailable: boolean;
  listInSchema: boolean;
  canToggleAny: boolean;
}): boolean {
  const { editor, hideWhenUnavailable, listInSchema, canToggleAny } = params;

  if (!listInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleAny;
  }

  return true;
}

/**
 * Gets the currently active list type from the available types
 */
export function getActiveListType(
  editor: Editor | null,
  availableTypes: ListType[],
): ListType | undefined {
  if (!editor) return undefined;
  return availableTypes.find((type) => isListActive(editor, type));
}

/**
 * Custom hook that provides list dropdown menu functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MyListDropdown() {
 *   const {
 *     isVisible,
 *     activeType,
 *     isAnyActive,
 *     canToggleAny,
 *     filteredLists,
 *   } = useListDropdownMenu()
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <DropdownMenu>
 *       // dropdown content
 *     </DropdownMenu>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedListDropdown() {
 *   const {
 *     isVisible,
 *     activeType,
 *   } = useListDropdownMenu({
 *     editor: myEditor,
 *     types: ["bulletList", "orderedList"],
 *     hideWhenUnavailable: true,
 *   })
 *
 *   // component implementation
 * }
 * ```
 */
export function useListDropdownMenu(config?: UseListDropdownMenuConfig) {
  const {
    editor: providedEditor,
    types = ['bulletList', 'orderedList', 'taskList'],
    hideWhenUnavailable = false,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const messages = useEditorMessages();
  const listOptions = useMemo(() => createListOptions(messages), [messages]);

  const listInSchema = types.some((type) => isNodeInSchema(type, editor));

  const filteredLists = useMemo(
    () => getFilteredListOptions(listOptions, types),
    [listOptions, types],
  );

  const canToggleAny = canToggleAnyList(editor, types);
  const isAnyActive = isAnyListActive(editor, types);
  const activeType = getActiveListType(editor, types);
  const activeList = filteredLists.find((option) => option.type === activeType);
  const isVisible = shouldShowListDropdown({
    editor,
    listTypes: types,
    hideWhenUnavailable,
    listInSchema,
    canToggleAny,
  });

  return {
    isVisible,
    activeType,
    isActive: isAnyActive,
    canToggle: canToggleAny,
    types,
    filteredLists,
    label: messages.toolbarList,
    Icon: activeList ? listIcons[activeList.type] : ListIcon,
  };
}
