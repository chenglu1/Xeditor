import { forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// --- Icons ---

// --- Hooks ---

// --- Tiptap UI ---
import type { UseHeadingDropdownMenuConfig } from './index';
import { useHeadingDropdownMenu } from './index';
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';
import { ChevronDownIcon } from '../../tiptap-icons/chevron-down-icon';

// --- UI Primitives ---
import type { ButtonProps } from '../../tiptap-ui-primitive/button';
import { Button } from '../../tiptap-ui-primitive/button';
import { HeadingButton } from '../heading-button';
import '../../tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss';
import '../../tiptap-ui-primitive/card/card.scss';

export interface HeadingDropdownProps
  extends Omit<ButtonProps, 'type'>, UseHeadingDropdownMenuConfig {
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * 简化版标题下拉菜单 - 不依赖 Radix UI
 */
export const HeadingDropdown = forwardRef<
  HTMLButtonElement,
  HeadingDropdownProps
>(
  (
    {
      editor: providedEditor,
      levels = [1, 2, 3, 4, 5, 6],
      hideWhenUnavailable = false,
      onOpenChange,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, isActive, canToggle, Icon } = useHeadingDropdownMenu({
      editor,
      levels,
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

    if (!isVisible) {
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

    const handleSelectLevel = (level: number) => {
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
          aria-label="Format text as heading"
          aria-pressed={isActive}
          aria-expanded={isOpen}
          tooltip="Heading"
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
              <div className="tiptap-card-body">
                <div
                  className="tiptap-card-item-group"
                  data-orientation="vertical"
                >
                  {levels.map((level) => (
                    <HeadingButton
                      key={`heading-${level}`}
                      editor={editor}
                      level={level as 1 | 2 | 3 | 4 | 5 | 6}
                      text={`Heading ${level}`}
                      onToggled={() => handleSelectLevel(level)}
                      tooltip=""
                    />
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

HeadingDropdown.displayName = 'HeadingDropdown';

export default HeadingDropdown;
