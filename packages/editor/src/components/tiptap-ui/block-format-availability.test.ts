import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateCurrentBlockCanChain } = vi.hoisted(() => ({
  mockCreateCurrentBlockCanChain: vi.fn(),
}));

vi.mock('../../lib/tiptap-utils', async () => {
  const actual =
    await vi.importActual<typeof import('../../lib/tiptap-utils')>(
      '../../lib/tiptap-utils'
    );

  return {
    ...actual,
    createCurrentBlockCanChain: mockCreateCurrentBlockCanChain,
    isNodeInSchema: vi.fn(() => true),
    isNodeTypeSelected: vi.fn(() => false),
    selectionWithinConvertibleTypes: vi.fn(() => true),
  };
});

import { canToggle as canToggleCodeBlock } from './code-block-button/use-code-block';
import { canToggleBlockquote } from './blockquote-button/use-blockquote';
import { canToggle as canToggleHeading } from './heading-button/use-heading';
import { canToggleList } from './list-button/use-list';

function createEditor() {
  return {
    isEditable: true,
    can: () => ({
      setNode: () => false,
      clearNodes: () => false,
      toggleBulletList: () => false,
      toggleOrderedList: () => false,
      toggleList: () => false,
      toggleWrap: () => false,
      toggleNode: () => false,
    }),
  } as any;
}

function createConvertedBlockChain() {
  return {
    setNode: vi.fn(() => ({
      run: () => true,
    })),
    toggleBulletList: vi.fn(() => ({
      run: () => true,
    })),
    toggleList: vi.fn(() => ({
      run: () => true,
    })),
    toggleWrap: vi.fn(() => ({
      run: () => true,
    })),
    toggleNode: vi.fn(() => ({
      run: () => true,
    })),
  };
}

describe('block-format toolbar availability', () => {
  beforeEach(() => {
    mockCreateCurrentBlockCanChain.mockReset();
  });

  it('keeps heading conversion available when the converted block chain can run', () => {
    const editor = createEditor();
    const convertedBlockChain = createConvertedBlockChain();

    mockCreateCurrentBlockCanChain.mockReturnValue(convertedBlockChain);

    expect(canToggleHeading(editor, 2)).toBe(true);
    expect(convertedBlockChain.setNode).toHaveBeenCalledWith('heading', {
      level: 2,
    });
  });

  it('keeps list conversion available when the converted block chain can run', () => {
    const editor = createEditor();
    const convertedBlockChain = createConvertedBlockChain();

    mockCreateCurrentBlockCanChain.mockReturnValue(convertedBlockChain);

    expect(canToggleList(editor, 'bulletList')).toBe(true);
    expect(convertedBlockChain.toggleBulletList).toHaveBeenCalledTimes(1);
  });

  it('keeps blockquote conversion available when the converted block chain can run', () => {
    const editor = createEditor();
    const convertedBlockChain = createConvertedBlockChain();

    mockCreateCurrentBlockCanChain.mockReturnValue(convertedBlockChain);

    expect(canToggleBlockquote(editor)).toBe(true);
    expect(convertedBlockChain.toggleWrap).toHaveBeenCalledWith('blockquote');
  });

  it('keeps code block conversion available when the converted block chain can run', () => {
    const editor = createEditor();
    const convertedBlockChain = createConvertedBlockChain();

    mockCreateCurrentBlockCanChain.mockReturnValue(convertedBlockChain);

    expect(canToggleCodeBlock(editor)).toBe(true);
    expect(convertedBlockChain.toggleNode).toHaveBeenCalledWith(
      'codeBlock',
      'paragraph',
    );
  });
});
