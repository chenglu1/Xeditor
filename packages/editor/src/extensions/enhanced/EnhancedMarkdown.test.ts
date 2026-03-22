import { describe, expect, it } from 'vitest';

import {
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
});
