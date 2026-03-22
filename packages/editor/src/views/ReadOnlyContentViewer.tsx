import type { Editor } from '@tiptap/react';
import { EditorContent } from '@tiptap/react';
import React from 'react';

import { EditorFrame } from './EditorFrame';
import { EditorPane } from './EditorPane';

interface ReadOnlyContentViewerProps {
  editor: Editor;
  minHeight: string;
  compact: boolean;
  className?: string;
}

export const ReadOnlyContentViewer: React.FC<ReadOnlyContentViewerProps> = ({
  editor,
  minHeight,
  compact,
  className = '',
}) => {
  return (
    <EditorFrame className={className} compact={compact}>
      <EditorPane
        compact={compact}
        minHeight={minHeight}
        paneClassName="editor-wrapper"
        bodyStyle={{
          padding: compact ? '0' : '12px',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <EditorContent
          editor={editor}
          className={`tiptap ${compact ? 'compact-mode' : ''}`.trim()}
        />
      </EditorPane>
    </EditorFrame>
  );
};
