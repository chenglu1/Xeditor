import type { Editor } from '@tiptap/react';

export function serializeHtmlContent(editor: Editor): string {
  return editor.getHTML();
}

export function createHtmlSetContentOptions(emitUpdate: boolean) {
  return {
    emitUpdate,
  };
}
