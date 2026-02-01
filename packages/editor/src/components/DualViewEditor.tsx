import type { Editor } from '@tiptap/react';
import { EditorContent, EditorContext } from '@tiptap/react';
import React, { useState, useEffect, useCallback } from 'react';

import { EditorToolbar } from './EditorToolbar';
import { ModeSwitchButtons } from './ModeSwitchButtons';
import type { ToolbarConfig, ContentType } from '../types';
import { TableFloatingToolbar } from './tiptap-ui/table-floating-toolbar/table-floating-toolbar';

interface DualViewEditorProps {
  editor: Editor;
  activeMode: 'richtext' | 'markdown';
  placeholder: string;
  readOnly: boolean;
  contentType: ContentType;
  toolbarConfig: ToolbarConfig;
  isMobile: boolean;
  onModeChange: (mode: 'richtext' | 'markdown') => void;
}

export const DualViewEditor: React.FC<DualViewEditorProps> = ({
  editor,
  activeMode,
  placeholder,
  readOnly,
  contentType,
  toolbarConfig,
  isMobile,
  onModeChange,
}) => {
  // 使用本地状态管理 textarea 的值
  const [textareaValue, setTextareaValue] = useState(editor.getMarkdown());

  // 当切换到 markdown 模式时，同步到 textarea
  useEffect(() => {
    if (activeMode === 'markdown') {
      setTextareaValue(editor.getMarkdown());
    }
  }, [activeMode]); // 移除 editor 依赖，避免不必要的重渲染

  const handleRichtextClick = useCallback(() => {
    // 切换到富文本前，将 textarea 的内容更新到 editor
    editor?.commands.setContent(textareaValue, {
      emitUpdate: false,
      ...(contentType === 'markdown' && { contentType: 'markdown' }),
    });
    onModeChange('richtext');
  }, [textareaValue, contentType, editor, onModeChange]);

  const handleMarkdownClick = useCallback(() => {
    // 切换到 markdown 时，从 editor 获取最新内容
    setTextareaValue(editor.getMarkdown());
    onModeChange('markdown');
  }, [editor, onModeChange]);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setTextareaValue(newContent);

      // 实时更新到 editor 并触发 onChange 回调，更新外部状态
      editor?.commands.setContent(newContent, {
        emitUpdate: true,
        ...(contentType === 'markdown' && { contentType: 'markdown' }),
      });
    },
    [contentType, editor],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 主内容区域：根据 activeMode 显示对应编辑器 */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Markdown 源码编辑 */}
        {activeMode === 'markdown' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white',
              flex: 1,
              minHeight: 0,
              height: '450px',
            }}
          >
            {/* 工具栏 - 包含模式切换按钮 */}
            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: '8px 12px',
                borderBottom: '1px solid #e5e7eb',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <ModeSwitchButtons
                activeMode={activeMode}
                onRichtextClick={handleRichtextClick}
                onMarkdownClick={handleMarkdownClick}
              />
            </div>

            <textarea
              value={textareaValue}
              onChange={handleTextareaChange}
              placeholder={placeholder}
              readOnly={readOnly}
              className="markdown-editor-textarea"
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                outline: 'none',
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                resize: 'none',
                backgroundColor: 'white',
                color: '#1f2937',
                overflow: 'auto',
                minHeight: 0,
              }}
            />
          </div>
        )}

        {/* TipTap 富文本编辑器 */}
        {activeMode === 'richtext' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white',
              flex: 1,
              minHeight: 0,
              height: '450px',
            }}
          >
            <div
              style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
              className="tiptap-editor-scrollable"
            >
              <div className="configurable-tiptap-editor">
                <div
                  className="editor-wrapper"
                  style={{ border: 'none', borderRadius: 0 }}
                >
                  <EditorContext.Provider value={{ editor }}>
                    <EditorToolbar
                      config={toolbarConfig}
                      isMobile={isMobile}
                      additionalContent={
                        <ModeSwitchButtons
                          activeMode={activeMode}
                          onRichtextClick={handleRichtextClick}
                          onMarkdownClick={handleMarkdownClick}
                        />
                      }
                    />
                    <div
                      style={{
                        padding: '12px',
                        width: '100%',
                        maxWidth: '100%',
                      }}
                    >
                      <EditorContent editor={editor} className="tiptap" />
                    </div>
                    <TableFloatingToolbar editor={editor} />
                  </EditorContext.Provider>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
