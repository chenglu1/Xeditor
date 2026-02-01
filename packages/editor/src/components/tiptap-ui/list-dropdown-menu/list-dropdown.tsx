import { type Editor } from '@tiptap/react';
import { forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// --- Hooks ---
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';

// --- Icons ---
import { ChevronDownIcon } from '../../tiptap-icons/chevron-down-icon';

// --- Tiptap UI ---
import { ListButton, type ListType } from '../list-button';
import { useListDropdownMenu } from './use-list-dropdown-menu';

// --- UI Primitives ---
import type { ButtonProps } from '../../tiptap-ui-primitive/button';
import { Button } from '../../tiptap-ui-primitive/button';
export interface ListDropdownProps extends Omit<ButtonProps, 'type'> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor;
  /**
   * The list types to display in the dropdown.
   */
  types?: ListType[];
  /**
   * Whether the dropdown should be hidden when no list types are available
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * 原生实现的列表下拉菜单（不依赖 Radix UI）
 */
export const ListDropdown = forwardRef<HTMLButtonElement, ListDropdownProps>(
  (
    {
      editor: providedEditor,
      types = ['bulletList', 'orderedList', 'taskList'],
      hideWhenUnavailable = false,
      onOpenChange,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { filteredLists, canToggle, isActive, isVisible, Icon } =
      useListDropdownMenu({
        editor,
        types,
        hideWhenUnavailable,
      });

    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const buttonRef =
      useRef<HTMLButtonElement | null>(null) as React.MutableRefObject<HTMLButtonElement | null>;

    // 点击外部关闭
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          onOpenChange?.(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onOpenChange]);

    // ESC 键关闭
    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          onOpenChange?.(false);
          buttonRef.current?.focus();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onOpenChange]);

    if (!isVisible || !editor || !editor.isEditable) {
      return null;
    }

    const handleToggle = () => {
      const newState = !isOpen;
      if (newState && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
        });
      }
      setIsOpen(newState);
      onOpenChange?.(newState);
    };

    const handleSelectList = () => {
      setIsOpen(false);
      onOpenChange?.(false);
      setTimeout(() => {
        editor?.commands.focus();
      }, 100);
    };

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button
          ref={(node) => {
            buttonRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type="button"
          data-style="ghost"
          data-active-state={isActive ? 'on' : 'off'}
          role="button"
          tabIndex={-1}
          disabled={!canToggle}
          data-disabled={!canToggle}
          aria-label="List options"
          aria-pressed={isActive}
          aria-expanded={isOpen}
          tooltip="List"
          onClick={handleToggle}
          {...buttonProps}
        >
          <Icon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>

        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="tiptap-dropdown-menu tiptap-card"
              data-state="open"
              style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 9999,
              }}
            >
              <div
                className="tiptap-card-body"
                style={{ listStyleType: 'none' }}
              >
                <div
                  className="tiptap-card-item-group"
                  data-orientation="vertical"
                  style={{ listStyle: 'none', listStyleType: 'none' }}
                >
                  {filteredLists.map((option) => (
                    <div key={option.type} style={{ listStyleType: 'none' }}>
                      <ListButton
                        editor={editor}
                        type={option.type}
                        text={option.label}
                        onToggled={handleSelectList}
                        tooltip=""
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

ListDropdown.displayName = 'ListDropdown';

export default ListDropdown;
