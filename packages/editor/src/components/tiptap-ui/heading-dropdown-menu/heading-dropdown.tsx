import { forwardRef, useState, useRef, useEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

// --- Icons ---

// --- Hooks ---
import {
  getHeadingLevelLabel,
  useEditorMessages,
} from '../../../core/editor-messages-context';

// --- Tiptap UI ---
import type { UseHeadingDropdownMenuConfig } from './index';
import { useHeadingDropdownMenu } from './index';
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';
import { ChevronDownIcon } from '../../tiptap-icons/chevron-down-icon';

// --- UI Primitives ---
import type { ButtonProps } from '../../tiptap-ui-primitive/button';
import { Button } from '../../tiptap-ui-primitive/button';
import { HeadingButton } from '../heading-button';

export interface HeadingDropdownProps
  extends Omit<ButtonProps, 'type'>, UseHeadingDropdownMenuConfig {
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

const HEADING_PREVIEW_STYLES: Record<1 | 2 | 3 | 4 | 5 | 6, CSSProperties> = {
  1: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2 },
  2: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.25 },
  3: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 },
  4: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.35 },
  5: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4 },
  6: { fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.45 },
};

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
    const messages = useEditorMessages();
    const { isVisible, isActive, Icon } = useHeadingDropdownMenu({
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

    if (!isVisible) {
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

    const handleSelectLevel = () => {
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
          aria-label={messages.toolbarFormatHeading}
          aria-pressed={isActive}
          aria-expanded={isOpen}
          tooltip={messages.toolbarHeading}
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
                      style={HEADING_PREVIEW_STYLES[level as 1 | 2 | 3 | 4 | 5 | 6]}
                      text={getHeadingLevelLabel(messages, level)}
                      onToggled={handleSelectLevel}
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
