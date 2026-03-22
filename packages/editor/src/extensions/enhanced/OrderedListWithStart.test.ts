import { describe, expect, it } from 'vitest';

import { fixOrderedListStart } from './OrderedListWithStart';

describe('fixOrderedListStart', () => {
  it('restores ordered list numbering from the document start attribute', () => {
    const doc = {
      content: [
        {
          type: { name: 'orderedList' },
          attrs: { start: 3 },
        },
      ],
    };

    const markdown = ['1. first', '2. second', '3. third'].join('\n');

    expect(fixOrderedListStart(markdown, doc as any)).toBe(
      ['3. first', '4. second', '5. third'].join('\n'),
    );
  });

  it('leaves markdown unchanged when all ordered lists start at one', () => {
    const doc = {
      content: [
        {
          type: { name: 'orderedList' },
          attrs: { start: 1 },
        },
      ],
    };

    const markdown = ['1. first', '2. second'].join('\n');

    expect(fixOrderedListStart(markdown, doc as any)).toBe(markdown);
  });
});
