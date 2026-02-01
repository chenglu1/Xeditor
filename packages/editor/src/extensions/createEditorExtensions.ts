import type { AnyExtension, Editor } from '@tiptap/core';
import { CharacterCount } from '@tiptap/extension-character-count';
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from '@tiptap/extension-details';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Placeholder as TiptapPlaceholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import StarterKit from '@tiptap/starter-kit';

import { ImageUploadNode } from '../components/tiptap-node/image-upload-node/image-upload-node-extension';
import type { ImageUploadHandler } from '../types';
import { createEnhancedMarkdown } from './enhanced/EnhancedMarkdown';
import {
  EnhancedBlockMath,
  EnhancedInlineMath,
} from './enhanced/EnhancedMathematics';
import { TextAlignWithMarkdown } from './enhanced/TextAlignWithMarkdown';
import { OrderedListWithStart } from './enhanced/OrderedListWithStart';
import { Subscript, Superscript } from './marks';
import { CustomImage, CustomReactNode } from './nodes';

export interface CreateEditorExtensionsOptions {
  placeholder?: string;
  maxFileSize?: number;
  maxLength?: number;
  imageUploadHandler: ImageUploadHandler;
}

export const createEditorExtensions = ({
  placeholder = '开始输入...',
  maxFileSize,
  maxLength,
  imageUploadHandler,
}: CreateEditorExtensionsOptions) => {
  // KaTeX配置：通用的数学公式渲染选项
  const katexConfig = {
    throwOnError: false,
    errorColor: '#cc0000',
    strict: false,
    trust: true,
  };

  const extensions: AnyExtension[] = [
    // 核心编辑器功能
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      orderedList: false,
      link: false,
    }),

    // 占位符提示
    TiptapPlaceholder.configure({
      placeholder: ({
        pos,
        editor,
      }: {
        pos: number;
        editor: Editor;
      }) => {
        if (pos === 0 && editor.isEmpty) {
          return placeholder;
        }
        return '';
      },
      showOnlyWhenEditable: true,
    }),

    // 折叠详情组件
    Details,
    DetailsSummary,
    DetailsContent,

    // 任务列表
    TaskList,
    TaskItem.configure({ nested: true }),

    // 链接功能
    Link.configure({
      openOnClick: true,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'tiptap-link',
      },
      protocols: ['http', 'https', 'mailto'],
    }),

    // 图片支持
    CustomImage,

    // 表格功能
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,

    // Markdown支持（增强版，必须在最前面以便其他扩展可以注册序列化器）
    createEnhancedMarkdown(),

    // 支持起始编号的有序列表（必须在 EnhancedMarkdown 之后注册）
    OrderedListWithStart,

    // 文本对齐（带Markdown支持，必须在 EnhancedMarkdown 之后）
    TextAlignWithMarkdown,

    // 文本高亮
    Highlight,

    // 数学公式支持（增强版，支持LaTeX语法修复）
    EnhancedBlockMath.configure({
      katexOptions: katexConfig,
    }),
    EnhancedInlineMath.configure({
      katexOptions: katexConfig,
    }),

    // 上标和下标
    Subscript,
    Superscript,

    // 图片上传节点
    ImageUploadNode.configure({
      accept: 'image/*',
      maxSize: maxFileSize,
      limit: 3,
      upload: imageUploadHandler,
      onError: (error: unknown) => {
        // eslint-disable-next-line no-console
        console.error('Upload failed:', error);
      },
    }),

    // 自定义React节点
    CustomReactNode,
  ];

  // 可选：字符计数限制
  if (maxLength) {
    extensions.push(
      CharacterCount.configure({
        limit: maxLength,
      }),
    );
  }

  return extensions;
};
