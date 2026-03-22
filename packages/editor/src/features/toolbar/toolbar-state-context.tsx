import type { Editor } from '@tiptap/react';
import React, { createContext, useContext } from 'react';

import {
  type ToolbarStateSnapshot,
  useToolbarState,
} from '../../core/useToolbarState';

const ToolbarStateContext = createContext<ToolbarStateSnapshot | null>(null);

export function ToolbarStateProvider(props: {
  editor: Editor | null;
  children: React.ReactNode;
}) {
  const toolbarState = useToolbarState(props.editor);

  return (
    <ToolbarStateContext.Provider value={toolbarState}>
      {props.children}
    </ToolbarStateContext.Provider>
  );
}

export function useToolbarStateContext() {
  return useContext(ToolbarStateContext);
}
