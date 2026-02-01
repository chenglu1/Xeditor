import type { Editor } from '@tiptap/react';
import { EditorContent, EditorContext } from '@tiptap/react';
import React from 'react';

import { EditorToolbar } from './EditorToolbar';
import type { ToolbarConfig } from '../types';
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
}

export const SingleViewEditor: React.FC<SingleViewEditorProps> = ({
  editor,
  placeholder,
  minHeight,
  compact,
  showToolbar,
  toolbarConfig,
  isMobile,
  className = '',
}) => {
  return (
    <div
      className={`configurable-tiptap-editor ${compact ? 'compact-mode' : ''} ${className}`}
    >
      <div
        className="editor-wrapper"
        style={{
          border: compact ? 'none' : '1px solid #e5e7eb',
          borderRadius: compact ? '0' : '8px',
          overflow: 'hidden',
          backgroundColor: compact ? 'transparent' : 'white',
          boxShadow: compact ? 'none' : undefined,
        }}
      >
        <EditorContext.Provider value={{ editor }}>
          {showToolbar && (
            <EditorToolbar config={toolbarConfig} isMobile={isMobile} />
          )}

          <div
            style={{
              minHeight,
              padding: compact ? '0' : '12px',
              width: '100%',
              maxWidth: '100%',
            }}
            className={compact ? 'compact-mode' : ''}
          >
            <EditorContent editor={editor} className="tiptap" />
          </div>

          <TableFloatingToolbar editor={editor} />
        </EditorContext.Provider>
      </div>
    </div>
  );
};
