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
  readOnly?: boolean;
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
  readOnly = false,
}) => {
  return (
    <div
      className={`configurable-tiptap-editor ${compact ? 'compact-mode' : ''} ${className}`}
    >
      <EditorContext.Provider value={{ editor }}>
        {showToolbar && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: compact ? 'transparent' : 'white',
              borderTopLeftRadius: compact ? '0' : '8px',
              borderTopRightRadius: compact ? '0' : '8px',
              border: compact ? 'none' : '1px solid #e5e7eb',
              borderBottom: compact ? 'none' : '1px solid #e5e7eb',
              ...(readOnly && {
                filter: 'grayscale(1)',
                opacity: 0.45,
                pointerEvents: 'none',
                userSelect: 'none',
                cursor: 'not-allowed',
              }),
            }}
          >
            <EditorToolbar config={toolbarConfig} isMobile={isMobile} />
          </div>
        )}

        <div
          className="editor-wrapper"
          style={{
            border: compact ? 'none' : '1px solid #e5e7eb',
            borderTop: showToolbar && !compact ? 'none' : compact ? 'none' : '1px solid #e5e7eb',
            borderBottomLeftRadius: compact ? '0' : '8px',
            borderBottomRightRadius: compact ? '0' : '8px',
            overflow: 'hidden',
            backgroundColor: compact ? 'transparent' : 'white',
            boxShadow: compact ? 'none' : undefined,
          }}
        >
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
        </div>
      </EditorContext.Provider>
    </div>
  );
};
