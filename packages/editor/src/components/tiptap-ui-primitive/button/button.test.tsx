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

  it('dispatches click on mouse up after preventing mouse down default', () => {
    const onClick = vi.fn();

    render(
      <Button showTooltip={false} onClick={onClick}>
        Toggle
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Toggle' });

    fireEvent.mouseDown(button, { button: 0 });
    fireEvent.mouseUp(button, { button: 0 });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores the duplicate native click that follows the synthetic mouse up click', () => {
    const onClick = vi.fn();

    render(
      <Button showTooltip={false} onClick={onClick}>
        Toggle
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Toggle' });

    fireEvent.mouseDown(button, { button: 0 });
    fireEvent.mouseUp(button, { button: 0 });
    fireEvent.click(button, { detail: 1 });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('dispatches click on mouse up when rendered through TooltipTrigger', () => {
    const onClick = vi.fn();

    render(
      <Button tooltip="Toggle tooltip" onClick={onClick}>
        Toggle
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Toggle' });

    fireEvent.mouseDown(button, { button: 0 });
    fireEvent.mouseUp(button, { button: 0 });

    expect(onClick).toHaveBeenCalledTimes(1);
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

  it('still calls the consumer mouse up handler', () => {
    const onMouseUp = vi.fn();

    render(
      <Button showTooltip={false} onMouseUp={onMouseUp}>
        Toggle
      </Button>,
    );

    fireEvent.mouseUp(screen.getByRole('button', { name: 'Toggle' }), {
      button: 0,
    });

    expect(onMouseUp).toHaveBeenCalledTimes(1);
  });
});