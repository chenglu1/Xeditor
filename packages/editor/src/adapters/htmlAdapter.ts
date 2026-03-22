import type { Editor } from '@tiptap/react';

export type SetContentOptions = NonNullable<
  Parameters<Editor['commands']['setContent']>[1]
>;

export function serializeHtmlContent(editor: Editor): string {
  return editor.getHTML();
}

export function createHtmlSetContentOptions(
  emitUpdate: boolean,
): SetContentOptions {
  return {
    emitUpdate,
  };
}
