import { forwardRef, Fragment, useMemo, useRef } from 'react';

// --- Tiptap UI Primitive ---
import { cn, parseShortcutKeys } from '../../../lib/tiptap-utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  showTooltip?: boolean;
  tooltip?: React.ReactNode;
  shortcutKeys?: string;
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null;

  return (
    <div>
      {shortcuts.map((key, index) => (
        <Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </div>
  );
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      onClick,
      onMouseDown,
      onMouseUp,
      tooltip,
      showTooltip = true,
      shortcutKeys,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const shouldDispatchClickRef = useRef(false);
    const ignoreNextNativeClickRef = useRef(false);
    const shortcuts = useMemo<string[]>(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys],
    );

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseDown?.(event);
      shouldDispatchClickRef.current = false;

      // Keep the editor selection stable while toolbar buttons are clicked.
      if (
        !event.defaultPrevented &&
        !props.disabled &&
        event.button === 0
      ) {
        event.preventDefault();
        shouldDispatchClickRef.current = true;
      }
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseUp?.(event);

      if (
        shouldDispatchClickRef.current &&
        !event.defaultPrevented &&
        !props.disabled &&
        event.button === 0
      ) {
        shouldDispatchClickRef.current = false;
        ignoreNextNativeClickRef.current = true;
        event.currentTarget.click();
        return;
      }

      shouldDispatchClickRef.current = false;
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ignoreNextNativeClickRef.current) {
        if (event.detail === 0) {
          onClick?.(event);
          return;
        }

        ignoreNextNativeClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={cn('tiptap-button', className)}
          ref={ref}
          aria-label={ariaLabel}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          {...props}
        >
          {children}
        </button>
      );
    }

    return (
      <Tooltip delay={200}>
        <TooltipTrigger
          className={cn('tiptap-button', className)}
          ref={ref}
          aria-label={ariaLabel}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          {...props}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
          <ShortcutDisplay shortcuts={shortcuts} />
        </TooltipContent>
      </Tooltip>
    );
  },
);

Button.displayName = 'Button';

export const ButtonGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    orientation?: 'horizontal' | 'vertical';
  }
>(({ className, children, orientation = 'vertical', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('tiptap-button-group', className)}
      data-orientation={orientation}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
});
ButtonGroup.displayName = 'ButtonGroup';

export default Button;
