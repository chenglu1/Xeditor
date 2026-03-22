import type { Editor } from '@tiptap/react';
import { useCurrentEditor } from '@tiptap/react';
import { useMemo } from 'react';

import { useToolbarState } from '../core/useToolbarState';
import {
  selectToolbarCanCommand,
  selectToolbarEditor,
  selectToolbarEditorState,
} from '../features/toolbar/selectors';
import { useToolbarStateContext } from '../features/toolbar/toolbar-state-context';

export function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null;
  editorState?: Editor['state'];
  canCommand?: Editor['can'];
} {
  const { editor: coreEditor } = useCurrentEditor();
  const toolbarState = useToolbarStateContext();
  const contextEditor = selectToolbarEditor(toolbarState);

  const mainEditor = useMemo(
    () => providedEditor || contextEditor || coreEditor,
    [providedEditor, contextEditor, coreEditor],
  );
  const shouldUseToolbarContext =
    !!toolbarState && (!providedEditor || providedEditor === contextEditor);
  const fallbackState = useToolbarState(
    shouldUseToolbarContext ? null : mainEditor,
  );

  if (shouldUseToolbarContext) {
    return {
      editor: contextEditor,
      editorState: selectToolbarEditorState(toolbarState),
      canCommand: selectToolbarCanCommand(toolbarState),
    };
  }

  return {
    editor: fallbackState.editor,
    editorState: fallbackState.editorState,
    canCommand: fallbackState.canCommand,
  };
}
