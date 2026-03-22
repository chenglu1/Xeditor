import { type Editor } from '@tiptap/react';
import { forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// --- Hooks ---
import { useEditorMessages } from '../../../core/editor-messages-context';
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

const DROPDOWN_OFFSET = 4;
const VIEWPORT_PADDING = 8;

function getOverlayPosition(
  anchorElement: HTMLButtonElement,
  panelElement: HTMLDivElement | null,
) {
  const anchorRect = anchorElement.getBoundingClientRect();
  const panelWidth = panelElement?.offsetWidth ?? 0;
  const panelHeight = panelElement?.offsetHeight ?? 0;

  let left = anchorRect.left;
  if (panelWidth > 0) {
    const maxLeft = Math.max(
      VIEWPORT_PADDING,
      window.innerWidth - panelWidth - VIEWPORT_PADDING,
    );
    left = Math.min(left, maxLeft);
  }
  left = Math.max(VIEWPORT_PADDING, left);

  let top = anchorRect.bottom + DROPDOWN_OFFSET;
  if (panelHeight > 0) {
    const canPlaceAbove =
      anchorRect.top - panelHeight - DROPDOWN_OFFSET >= VIEWPORT_PADDING;
    const wouldOverflowBelow =
      top + panelHeight > window.innerHeight - VIEWPORT_PADDING;

    if (wouldOverflowBelow && canPlaceAbove) {
      top = anchorRect.top - panelHeight - DROPDOWN_OFFSET;
    } else {
      const maxTop = Math.max(
        VIEWPORT_PADDING,
        window.innerHeight - panelHeight - VIEWPORT_PADDING,
      );
      top = Math.min(top, maxTop);
    }
  }
  top = Math.max(VIEWPORT_PADDING, top);

  return { top, left };
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
    const messages = useEditorMessages();
    const { filteredLists, isActive, isVisible, Icon } =
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

    useEffect(() => {
      if (!isOpen || !buttonRef.current) {
        return;
      }

      const syncPosition = () => {
        if (!buttonRef.current) {
          return;
        }

        setPosition(getOverlayPosition(buttonRef.current, dropdownRef.current));
      };

      syncPosition();
      const frameId = window.requestAnimationFrame(syncPosition);
      window.addEventListener('resize', syncPosition);
      window.addEventListener('scroll', syncPosition, true);

      return () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener('resize', syncPosition);
        window.removeEventListener('scroll', syncPosition, true);
      };
    }, [isOpen]);

    if (!isVisible || !editor) {
      return null;
    }

    const handleToggle = () => {
      const newState = !isOpen;
      if (newState && buttonRef.current) {
        setPosition(getOverlayPosition(buttonRef.current, dropdownRef.current));
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
      <div className="xeditor-overlay-anchor">
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
          aria-label={messages.toolbarListOptions}
          aria-pressed={isActive}
          aria-expanded={isOpen}
          tooltip={messages.toolbarList}
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
              className="tiptap-dropdown-menu tiptap-card xeditor-overlay-panel"
              data-state="open"
              style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
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
