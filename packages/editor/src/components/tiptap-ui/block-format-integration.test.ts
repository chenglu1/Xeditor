import { Editor } from '@tiptap/core';
import { afterEach, describe, expect, it } from 'vitest';

import { createEditorExtensions } from '../../extensions/createEditorExtensions';
import {
  canToggleBlockquote,
  toggleBlockquote,
} from './blockquote-button/use-blockquote';
import {
  canToggle as canToggleCodeBlock,
  toggleCodeBlock,
} from './code-block-button/use-code-block';
import {
  canToggle as canToggleHeading,
  toggleHeading,
} from './heading-button/use-heading';
import { canToggleList, toggleList } from './list-button/use-list';

function createRealEditor() {
  return new Editor({
    element: document.createElement('div'),
    extensions: createEditorExtensions({}),
    content: '<p>hello world</p>',
    editable: true,
  });
}

describe('block-format availability integration', () => {
  let editor: Editor | null = null;

  afterEach(() => {
    editor?.destroy();
    editor = null;
  });

  it('keeps block-format actions available for a text selection inside a paragraph', () => {
    editor = createRealEditor();
    editor.commands.setTextSelection({ from: 1, to: 6 });

    expect(canToggleHeading(editor as any, 2)).toBe(true);
    expect(canToggleList(editor as any, 'bulletList')).toBe(true);
    expect(canToggleBlockquote(editor as any)).toBe(true);
    expect(canToggleCodeBlock(editor as any)).toBe(true);
  });

  it('keeps block-format actions available after the editor view loses DOM focus', () => {
    editor = createRealEditor();
    editor.commands.setTextSelection({ from: 1, to: 6 });
    editor.view.dom.blur();

    expect(canToggleHeading(editor as any, 2)).toBe(true);
    expect(canToggleList(editor as any, 'bulletList')).toBe(true);
    expect(canToggleBlockquote(editor as any)).toBe(true);
    expect(canToggleCodeBlock(editor as any)).toBe(true);
  });

  it('applies blockquote and code block actions from a text selection', () => {
    editor = createRealEditor();
    editor.commands.setTextSelection({ from: 1, to: 6 });

    expect(toggleBlockquote(editor as any)).toBe(true);
    expect(editor.isActive('blockquote')).toBe(true);

    editor.commands.setContent('<p>hello world</p>');
    editor.commands.setTextSelection({ from: 1, to: 6 });

    expect(toggleCodeBlock(editor as any)).toBe(true);
    expect(editor.isActive('codeBlock')).toBe(true);
  });

  it('applies heading and bullet list actions from a text selection', () => {
    editor = createRealEditor();
    editor.commands.setTextSelection({ from: 1, to: 6 });

    expect(toggleHeading(editor as any, 2)).toBe(true);
    expect(editor.isActive('heading', { level: 2 })).toBe(true);

    editor.commands.setContent('<p>hello world</p>');
    editor.commands.setTextSelection({ from: 1, to: 6 });

    expect(toggleList(editor as any, 'bulletList')).toBe(true);
    expect(editor.isActive('bulletList')).toBe(true);
  });
});