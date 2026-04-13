import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('prevents mouse down default to preserve editor focus', () => {
    render(<Button showTooltip={false}>Toggle</Button>);

    const button = screen.getByRole('button', { name: 'Toggle' });
    const event = createEvent.mouseDown(button);

    fireEvent(button, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('keeps the same focus-preserving behavior when rendered through TooltipTrigger', () => {
    render(<Button tooltip="Toggle tooltip">Toggle</Button>);

    const button = screen.getByRole('button', { name: 'Toggle' });
    const event = createEvent.mouseDown(button);

    fireEvent(button, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('still calls the consumer mouse down handler', () => {
    const onMouseDown = vi.fn();

    render(
      <Button showTooltip={false} onMouseDown={onMouseDown}>
        Toggle
      </Button>,
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Toggle' }));

    expect(onMouseDown).toHaveBeenCalledTimes(1);
  });
});