import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

if (!globalThis.ResizeObserver) {
  class ResizeObserverMock {
    observe() {}

    unobserve() {}

    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserverMock;
}

if (
  typeof HTMLElement !== 'undefined' &&
  !HTMLElement.prototype.scrollIntoView
) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

const mockRect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  toJSON() {
    return this;
  },
} as DOMRect;

const mockRectList = {
  0: mockRect,
  length: 1,
  item: (index: number) => (index === 0 ? mockRect : null),
  *[Symbol.iterator]() {
    yield mockRect;
  },
} as unknown as DOMRectList;

function defineGeometryMethod(
  prototype: { [key: string]: unknown } | undefined,
  methodName: 'getBoundingClientRect' | 'getClientRects',
  implementation: () => DOMRect | DOMRectList,
) {
  if (!prototype || methodName in prototype) {
    return;
  }

  Object.defineProperty(prototype, methodName, {
    configurable: true,
    value: implementation,
  });
}

defineGeometryMethod(
  typeof Range !== 'undefined' ? (Range.prototype as { [key: string]: unknown }) : undefined,
  'getBoundingClientRect',
  () => mockRect,
);
defineGeometryMethod(
  typeof Range !== 'undefined' ? (Range.prototype as { [key: string]: unknown }) : undefined,
  'getClientRects',
  () => mockRectList,
);
defineGeometryMethod(
  typeof Text !== 'undefined' ? (Text.prototype as { [key: string]: unknown }) : undefined,
  'getBoundingClientRect',
  () => mockRect,
);
defineGeometryMethod(
  typeof Text !== 'undefined' ? (Text.prototype as { [key: string]: unknown }) : undefined,
  'getClientRects',
  () => mockRectList,
);
