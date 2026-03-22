import React from 'react';

interface EditorFrameProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  fillHeight?: boolean;
}

export const EditorFrame: React.FC<EditorFrameProps> = ({
  children,
  className = '',
  compact = false,
  fillHeight = false,
}) => {
  return (
    <div
      className={[
        'configurable-tiptap-editor',
        'xeditor-frame',
        compact ? 'compact-mode' : '',
        fillHeight ? 'xeditor-frame--fill-height' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};
