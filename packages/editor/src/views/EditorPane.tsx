import React from 'react';

interface EditorPaneProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  compact?: boolean;
  minHeight?: string;
  paneClassName?: string;
  paneStyle?: React.CSSProperties;
  headerClassName?: string;
  headerStyle?: React.CSSProperties;
  bodyClassName?: string;
  bodyStyle?: React.CSSProperties;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  children,
  header,
  compact = false,
  minHeight,
  paneClassName = '',
  paneStyle,
  headerClassName = '',
  headerStyle,
  bodyClassName = '',
  bodyStyle,
}) => {
  return (
    <div
      className={['xeditor-pane', compact ? 'xeditor-pane--compact' : '', paneClassName]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--xeditor-pane-min-height': minHeight ?? '0px',
          ...paneStyle,
        } as React.CSSProperties
      }
    >
      {header !== undefined && header !== null && (
        <div
          className={['xeditor-pane__header', headerClassName]
            .filter(Boolean)
            .join(' ')}
          style={headerStyle}
        >
          {header}
        </div>
      )}

      <div
        className={['xeditor-pane__body', bodyClassName].filter(Boolean).join(' ')}
        style={{
          ...bodyStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};
