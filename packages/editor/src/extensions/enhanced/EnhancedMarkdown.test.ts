import { describe, expect, it } from 'vitest';

import {
  normalizeStandaloneImageSpacing,
  postProcessMarkdown,
  preprocessMarkdown,
} from './EnhancedMarkdown';

describe('EnhancedMarkdown helpers', () => {
  it('normalizes html table spacing and removes blank lines inside markdown tables', () => {
    const input = [
      'Before',
      '<table><tr><td>A</td></tr></table>',
      '| Col |',
      '| --- |',
      '',
      '| Row |',
      'After',
    ].join('\n');

    expect(preprocessMarkdown(input)).toBe(
      [
        'Before',
        '',
        '<table><tr><td>A</td></tr></table>',
        '',
        '| Col |',
        '| --- |',
        '| Row |',
        '',
        'After',
      ].join('\n'),
    );
  });

  it('restores formatting markers around markdown links after serialization', () => {
    const input = [
      '`[code](https://example.com)`',
      '**[bold](https://example.com)**',
      '*[italic](https://example.com)*',
    ].join('\n');

    expect(postProcessMarkdown(input)).toBe(
      [
        '[`code`](https://example.com)',
        '[**bold**](https://example.com)',
        '[*italic*](https://example.com)',
      ].join('\n'),
    );
  });

  it('removes only the trailing empty paragraph marker emitted by Tiptap paragraph serialization', () => {
    const input = [
      'Before',
      '',
      '&nbsp;',
    ].join('\n');

    const doc = {
      lastChild: {
        type: { name: 'paragraph' },
        childCount: 0,
      },
    } as any;

    expect(postProcessMarkdown(input, undefined, doc)).toBe(
      [
        'Before',
      ].join('\n'),
    );
  });

  it('keeps non-trailing placeholder paragraph entities untouched when the document does not end with an empty paragraph', () => {
    const input = [
      'Before',
      '&nbsp;',
      'After',
    ].join('\n');

    const doc = {
      lastChild: {
        type: { name: 'paragraph' },
        childCount: 1,
      },
    } as any;

    expect(postProcessMarkdown(input, undefined, doc)).toBe(input);
  });

  it('keeps standalone markdown images isolated from surrounding paragraphs', () => {
    const input = [
      'Before image',
      '![Cover](https://example.com/cover.png)',
      'After image',
    ].join('\n');

    expect(normalizeStandaloneImageSpacing(input)).toBe(
      [
        'Before image',
        '',
        '![Cover](https://example.com/cover.png)',
        '',
        'After image',
      ].join('\n'),
    );
  });

  it('does not rewrite standalone markdown images inside fenced code blocks', () => {
    const input = [
      '```md',
      '![Cover](https://example.com/cover.png)',
      '```',
    ].join('\n');

    expect(normalizeStandaloneImageSpacing(input)).toBe(input);
  });

  it('allows standalone image spacing normalization to be disabled after serialization', () => {
    const input = [
      'Before image',
      '![Cover](https://example.com/cover.png)',
      'After image',
    ].join('\n');

    expect(
      postProcessMarkdown(input, {
        standaloneImageSpacing: false,
      }),
    ).toBe(input);
  });
});
