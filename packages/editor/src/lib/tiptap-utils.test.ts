import { describe, expect, it, vi } from 'vitest';

import { createCurrentBlockCanChain } from './tiptap-utils';

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
});
