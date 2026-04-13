import type { Editor } from '@tiptap/react';
import { EditorContent, EditorContext } from '@tiptap/react';
import React from 'react';

import {
  DEFAULT_EDITOR_MESSAGES,
  type EditorMessages,
  type ToolbarConfig,
} from '../types';
import { ToolbarStateProvider } from '../features/toolbar/toolbar-state-context';
import { EditorFrame } from '../views/EditorFrame';
import { EditorPane } from '../views/EditorPane';
import { EditorToolbar } from './EditorToolbar';
import { ModeSwitchButtons } from './ModeSwitchButtons';
import { TableFloatingToolbar } from './tiptap-ui/table-floating-toolbar/table-floating-toolbar';

interface DualViewEditorProps {
  editor: Editor;
  activeMode: 'richtext' | 'markdown';
  placeholder: string;
  markdownValue: string;
  readOnly: boolean;
  toolbarConfig: ToolbarConfig;
  showToolbar: boolean;
  minHeight: string;
  compact: boolean;
  stickyToolbar?: boolean;
  stickyToolbarTop?: string;
  scrollContainer?: boolean;
  containerHeight?: string;
  className?: string;
  isMobile: boolean;
  disabled?: boolean;
  messages: EditorMessages;
  onMarkdownChange: (nextValue: string) => void;
  onSwitchToMarkdown: () => void;
  onSwitchToRichtext: () => void;
}

export const DualViewEditor: React.FC<DualViewEditorProps> = ({
  editor,
  activeMode,
  placeholder,
  markdownValue,
  readOnly,
  toolbarConfig,
  showToolbar,
  minHeight,
  compact,
  stickyToolbar = true,
  stickyToolbarTop = '0px',
  scrollContainer = false,
  containerHeight,
  className = '',
  isMobile,
  disabled = false,
  messages = DEFAULT_EDITOR_MESSAGES,
  onMarkdownChange,
  onSwitchToMarkdown,
  onSwitchToRichtext,
}) => {
  const isToolbarDisabled = readOnly || disabled;

  const modeSwitchButtons = (
    <ModeSwitchButtons
      activeMode={activeMode}
      disabled={disabled}
      richTextLabel={messages.modeRichText}
      markdownLabel={messages.modeMarkdown}
      onRichtextClick={onSwitchToRichtext}
      onMarkdownClick={onSwitchToMarkdown}
    />
  );

  const richtextHeader = showToolbar ? (
    <div className="xeditor-toolbar-slot">
      <div
        className={[
          'xeditor-toolbar-slot__main',
          isToolbarDisabled ? 'is-disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <EditorToolbar
          editor={editor}
          config={toolbarConfig}
          isMobile={isMobile}
          disabled={isToolbarDisabled}
        />
      </div>
      {modeSwitchButtons}
    </div>
  ) : (
    <div className="xeditor-toolbar-slot xeditor-toolbar-slot--mode-only">
      {modeSwitchButtons}
    </div>
  );

  return (
    <EditorFrame className={className} compact={compact} fillHeight>
      <div className="xeditor-layout">
        {activeMode === 'markdown' && (
          <EditorPane
            compact={compact}
            minHeight={minHeight}
            paneStyle={
              scrollContainer
                ? ({ height: containerHeight ?? minHeight } as React.CSSProperties)
                : undefined
            }
            headerClassName="xeditor-pane__header--muted"
            header={
              <div className="xeditor-toolbar-slot xeditor-toolbar-slot--mode-only xeditor-toolbar-slot--muted">
                {modeSwitchButtons}
              </div>
            }
            bodyStyle={{
              '--xeditor-markdown-padding': compact ? '0px' : '16px',
            } as React.CSSProperties}
            bodyClassName="xeditor-pane__body--flex"
          >
            <textarea
              value={markdownValue}
              onChange={(event) => onMarkdownChange(event.target.value)}
              placeholder={placeholder}
              readOnly={readOnly || disabled}
              aria-label={messages.markdownInputLabel}
              className="markdown-editor-textarea xeditor-markdown-textarea"
            />
          </EditorPane>
        )}

        {activeMode === 'richtext' && (
          <EditorContext.Provider value={{ editor }}>
            <ToolbarStateProvider editor={editor}>
              <EditorPane
                compact={compact}
                minHeight={minHeight}
                paneStyle={
                  scrollContainer
                    ? ({ height: containerHeight ?? minHeight } as React.CSSProperties)
                    : undefined
                }
                header={richtextHeader}
                headerClassName={stickyToolbar ? 'xeditor-pane__header--sticky' : ''}
                headerStyle={
                  stickyToolbar
                    ? ({ top: stickyToolbarTop } as React.CSSProperties)
                    : undefined
                }
                bodyClassName="tiptap-editor-scrollable xeditor-pane__body--scrollable"
                bodyStyle={{
                  '--xeditor-pane-body-padding': compact ? '0px' : '12px',
                } as React.CSSProperties}
              >
                <div className="editor-wrapper xeditor-richtext-wrapper">
                  <div className="xeditor-pane__body--padded">
                    <EditorContent
                      editor={editor}
                      className="tiptap"
                      aria-label={messages.richTextEditorLabel}
                    />
                  </div>
                  <TableFloatingToolbar editor={editor} />
                </div>
              </EditorPane>
            </ToolbarStateProvider>
          </EditorContext.Provider>
        )}
      </div>
    </EditorFrame>
  );
};
