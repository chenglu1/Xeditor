import { describe, expect, it, vi } from 'vitest';

import {
  createCurrentBlockCanChain,
  isNodeTypeSelected,
  selectionWithinConvertibleTypes,
} from './tiptap-utils';

describe('createCurrentBlockCanChain', () => {
  it('builds a dry-run chain for the current block content', () => {
    const textNode = {} as any;
    const currentBlock = {
      firstChild: textNode,
      lastChild: textNode,
      nodeSize: 6,
    } as any;

    const chain = {
      setNodeSelection: vi.fn(() => chain),
      setTextSelection: vi.fn(() => chain),
      clearNodes: vi.fn(() => chain),
    };

    const editor = {
      can: () => ({
        chain: () => chain,
      }),
      state: {
        selection: {
          $anchor: {
            depth: 1,
            node: () => currentBlock,
            parent: currentBlock,
          },
        },
        doc: {
          nodeAt: vi.fn((pos: number) => (pos === 0 ? currentBlock : null)),
          descendants: (callback: (node: unknown, pos: number) => boolean | void) => {
            callback(currentBlock, 0);
          },
        },
      },
    } as any;

    const convertedChain = createCurrentBlockCanChain(editor);

    expect(convertedChain).toBe(chain);
    expect(chain.setNodeSelection).toHaveBeenCalledWith(0);
    expect(chain.setTextSelection).toHaveBeenCalledWith({ from: 1, to: 5 });
    expect(chain.clearNodes).toHaveBeenCalledTimes(1);
  });

  it('treats cross-bundle text selections as convertible based on structure instead of instanceof', () => {
    const editor = {
      state: {
        selection: {
          from: 1,
          to: 6,
          empty: false,
          constructor: { name: 'TextSelection' },
        },
        doc: {
          nodesBetween: vi.fn((from: number, to: number, callback: (node: unknown) => boolean | void) => {
            expect(from).toBe(1);
            expect(to).toBe(6);
            callback({ isTextblock: true, type: { name: 'paragraph' } });
          }),
        },
      },
    } as any;

    expect(selectionWithinConvertibleTypes(editor, ['paragraph'])).toBe(true);
  });

  it('recognizes node selections by structure instead of relying on NodeSelection identity', () => {
    const editor = {
      state: {
        selection: {
          empty: false,
          node: { type: { name: 'image' } },
        },
      },
    } as any;

    expect(isNodeTypeSelected(editor, ['image'])).toBe(true);
  });
});
