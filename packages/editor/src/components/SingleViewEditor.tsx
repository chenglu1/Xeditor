import type { Editor } from '@tiptap/react';
import { EditorContent, EditorContext } from '@tiptap/react';
import React from 'react';

import type { EditorMessages, ToolbarConfig } from '../types';
import { DEFAULT_EDITOR_MESSAGES } from '../types';
import { EditorFrame } from '../views/EditorFrame';
import { EditorPane } from '../views/EditorPane';
import { ToolbarStateProvider } from '../features/toolbar/toolbar-state-context';
import { EditorToolbar } from './EditorToolbar';
import { TableFloatingToolbar } from './tiptap-ui/table-floating-toolbar/table-floating-toolbar';

interface SingleViewEditorProps {
  editor: Editor;
  placeholder: string;
  minHeight: string;
  compact: boolean;
  showToolbar: boolean;
  toolbarConfig: ToolbarConfig;
  isMobile: boolean;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
  messages: EditorMessages;
}

export const SingleViewEditor: React.FC<SingleViewEditorProps> = ({
  editor,
  minHeight,
  compact,
  showToolbar,
  toolbarConfig,
  isMobile,
  className = '',
  readOnly = false,
  disabled = false,
  messages = DEFAULT_EDITOR_MESSAGES,
}) => {
  const isToolbarDisabled = readOnly || disabled;

  return (
    <EditorFrame className={className} compact={compact}>
      <EditorContext.Provider value={{ editor }}>
        <ToolbarStateProvider editor={editor}>
          <EditorPane
            compact={compact}
            minHeight={minHeight}
            paneClassName="editor-wrapper"
            headerClassName="xeditor-pane__header--sticky"
            header={
              showToolbar ? (
                <div className="xeditor-toolbar-slot">
                  <div
                    className={[
                      'xeditor-toolbar-slot__main',
                      isToolbarDisabled ? 'is-disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                  <EditorToolbar config={toolbarConfig} isMobile={isMobile} />
                  </div>
                </div>
              ) : null
            }
            bodyStyle={{
              '--xeditor-pane-body-padding': compact ? '0px' : '12px',
            } as React.CSSProperties}
            bodyClassName="xeditor-pane__body--padded"
          >
            <EditorContent
              editor={editor}
              className={`tiptap ${compact ? 'compact-mode' : ''}`.trim()}
            />
            <TableFloatingToolbar editor={editor} />
          </EditorPane>
        </ToolbarStateProvider>
      </EditorContext.Provider>
    </EditorFrame>
  );
};
