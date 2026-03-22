import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';

export interface ToolbarStateSnapshot {
  editor: Editor | null;
  editorState?: Editor['state'];
  canCommand?: Editor['can'];
  isEditable: boolean;
}

const EMPTY_TOOLBAR_STATE: ToolbarStateSnapshot = {
  editor: null,
  editorState: undefined,
  canCommand: undefined,
  isEditable: false,
};

export function useToolbarState(
  editor: Editor | null | undefined,
): ToolbarStateSnapshot {
  const snapshot = useEditorState({
    editor: editor ?? null,
    selector(context) {
      if (!context.editor) {
        return EMPTY_TOOLBAR_STATE;
      }

      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
        isEditable: context.editor.isEditable,
      };
    },
  });

  return snapshot || EMPTY_TOOLBAR_STATE;
}
