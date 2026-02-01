import 'katex/dist/katex.min.css';

import { useEditor } from '@tiptap/react';
import React, { useState, useEffect, useRef } from 'react';

import { DualViewEditor } from './components/DualViewEditor';
import { SingleViewEditor } from './components/SingleViewEditor';
import { createEditorExtensions } from './extensions/createEditorExtensions';
import { useIsMobile } from './hooks/use-mobile';
import { MAX_FILE_SIZE } from './lib/tiptap-utils';
import { createUploadHandler } from './lib/upload-utils';
import type {
  ConfigurableTiptapEditorProps,
  ToolbarButton,
  ToolbarConfig,
} from './types';

// 导出类型供外部使用
export type {
  ContentType,
  ToolbarButton,
  ConfigurableTiptapEditorProps,
} from './types';

const ConfigurableTiptapEditor: React.FC<ConfigurableTiptapEditorProps> = ({
  value = '',
  contentType = 'markdown',
  placeholder = '开始输入...',
  readOnly = false,
  showToolbar = true,
  toolbarButtons,
  dualView = false,
  className = '',
  minHeight = '300px',
  compact = false,
  uploadHandler,
  uploadUrl,
  maxFileSize = MAX_FILE_SIZE,
  maxLength,
  onChange,
}) => {
  const isMobile = useIsMobile();
  const [activeMode, setActiveMode] = useState<'richtext' | 'markdown'>(
    'richtext',
  );

  // 创建上传处理函数
  const imageUploadHandler =
    uploadHandler ||
    createUploadHandler({
      uploadUrl,
      extraFormData: maxFileSize ? {} : undefined,
    });

  // 判断是否显示某个按钮
  const shouldShowButton = (button: ToolbarButton) => {
    if (!toolbarButtons) return true;
    return toolbarButtons.includes(button);
  };

  // 工具栏配置
  const toolbarConfig: ToolbarConfig = {
    showUndoRedo: shouldShowButton('undo') || shouldShowButton('redo'),
    showStructure:
      shouldShowButton('heading') ||
      shouldShowButton('list') ||
      shouldShowButton('blockquote') ||
      shouldShowButton('codeBlock') ||
      shouldShowButton('table'),
    showFormatting:
      shouldShowButton('bold') ||
      shouldShowButton('italic') ||
      shouldShowButton('strike') ||
      shouldShowButton('code') ||
      shouldShowButton('underline') ||
      shouldShowButton('highlight') ||
      shouldShowButton('link'),
    showScript:
      shouldShowButton('superscript') || shouldShowButton('subscript'),
    showAlign:
      shouldShowButton('alignLeft') ||
      shouldShowButton('alignCenter') ||
      shouldShowButton('alignRight') ||
      shouldShowButton('alignJustify'),
    showImage: shouldShowButton('image'),
    shouldShowButton,
  };

  const editor = useEditor({
    extensions: createEditorExtensions({
      placeholder,
      maxFileSize,
      maxLength,
      imageUploadHandler,
    }),
    // 不在初始化时设置 content，确保所有内容都通过 setContent → manager.parse 流程
    contentType: contentType === 'markdown' ? 'markdown' : undefined,
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
      // 阻止超出最大长度的输入
      handleTextInput: (view, from, to, text) => {
        if (!maxLength) return false;

        // 使用 CharacterCount 扩展的字符数
        const currentCount = view.state.doc.textContent.length;
        const selectedLength = to - from;
        const newLength = currentCount - selectedLength + text.length;

        // 如果新长度超过限制，阻止输入
        if (newLength > maxLength) {
          return true; // 返回 true 阻止默认行为
        }
        return false;
      },
      // 阻止超出最大长度的粘贴
      handlePaste: (view, event) => {
        if (!maxLength) return false;

        const text = event.clipboardData?.getData('text/plain') || '';
        const { selection } = view.state;
        const currentCount = view.state.doc.textContent.length;
        const selectedLength = selection.$to.pos - selection.$from.pos;
        const remaining = maxLength - (currentCount - selectedLength);

        if (remaining <= 0) {
          return true; // 完全阻止粘贴
        }

        // 如果粘贴内容超出限制，截断后粘贴
        if (text.length > remaining) {
          const truncatedText = text.slice(0, remaining);
          const { tr } = view.state;
          view.dispatch(
            tr.insertText(truncatedText, selection.from, selection.to),
          );
          return true; // 阻止默认粘贴行为
        }

        return false;
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        try {
          const content =
            contentType === 'markdown'
              ? editor.getMarkdown()
              : editor.getHTML();

          // 使用 textContent.length 来统计字符数（与输入限制逻辑一致）
          const characterCount = editor.state.doc.textContent.length;

          onChange(content, contentType, characterCount);
        } catch (_error) {
          // console.error('Failed to get editor content:', _error);
        }
      }
    },
  });

  // 更新编辑器内容：初始化和值改变时都通过 setContent 确保预处理生效
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent =
        contentType === 'markdown' ? editor.getMarkdown() : editor.getHTML();

      if (value !== currentContent) {
        const options: any = {
          emitUpdate: false,
        };
        if (contentType === 'markdown') {
          options.contentType = 'markdown';
        }
        editor.commands.setContent(value, options);
      }
    }
  }, [value, contentType, editor]);

  if (!editor) {
    return <div>Loading editor…</div>;
  }

  // 处理模式切换
  const onModeChange = (mode: 'richtext' | 'markdown') => {
    setActiveMode(mode);
    // 双视图模式：模式切换时触发 onChange
    if (dualView && onChange) {
      try {
        const content =
          contentType === 'markdown' ? editor.getMarkdown() : editor.getHTML();
        onChange(content, contentType);
      } catch (_error) {
        // console.error('Failed to get editor content:', _error);
      }
    }
  };

  // 双视图模式的渲染
  if (dualView) {
    return (
      <DualViewEditor
        editor={editor}
        activeMode={activeMode}
        placeholder={placeholder}
        readOnly={readOnly}
        contentType={contentType}
        toolbarConfig={toolbarConfig}
        isMobile={isMobile}
        onModeChange={onModeChange}
      />
    );
  }

  // 单视图模式的渲染
  return (
    <SingleViewEditor
      editor={editor}
      placeholder={placeholder}
      minHeight={minHeight}
      compact={compact}
      showToolbar={showToolbar}
      toolbarConfig={toolbarConfig}
      isMobile={isMobile}
      className={className}
    />
  );
};

export default ConfigurableTiptapEditor;
