/*
 * @Description: 支持 Markdown 的文本对齐扩展
 * 使用自定义语法 :::{align=xxx} 在 Markdown 中保存对齐信息
 */
import { Extension } from '@tiptap/core';
import { TextAlign as TiptapTextAlign } from '@tiptap/extension-text-align';
import type { Node as TiptapNode } from '@tiptap/pm/model';

// 自定义语法的正则表达式
const ALIGN_SYNTAX_PATTERN = /:::\{align=(\w+)\}\n([\s\S]*?)\n:::/g;

/**
 * TextAlign 扩展 - 为 paragraph/heading 添加对齐支持
 *
 * 工作原理：
 * 1. Tiptap → MD: 拦截 serialize，在带对齐属性的段落周围包裹 :::{align=xxx}
 * 2. MD → Tiptap: 拦截 parse，将 :::{align=xxx} 转换为 <p style="text-align: xxx">
 */
export const TextAlignWithMarkdown = Extension.create({
  name: 'textAlignMarkdown',

  addExtensions() {
    // 添加 TextAlign 扩展功能
    return [
      TiptapTextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
    ];
  },

  onBeforeCreate() {
    const markdownStorage = (
      this.editor.storage as {
        markdown?: {
          manager?: {
            parse: (markdown: string) => unknown;
            serialize: (docOrContent: unknown) => string;
          };
        };
      }
    ).markdown;

    if (!markdownStorage?.manager) return;

    const manager = markdownStorage.manager;

    // 1. 增强 parse: MD → Tiptap
    //    将自定义对齐语法转换为 HTML style 属性（在 EnhancedMarkdown 之后链式调用）
    const originalParse = manager.parse.bind(manager);
    manager.parse = (markdown: string) => {
      const processed = markdown.replace(
        ALIGN_SYNTAX_PATTERN,
        (_, align, content) => {
          const trimmedContent = content.trim();

          // 检测内容类型，保持原有结构
          if (trimmedContent.startsWith('#')) {
            // 标题：提取标题级别和文本
            const headingMatch = trimmedContent.match(/^(#{1,6})\s+(.*)$/);
            if (headingMatch) {
              const [, hashes, text] = headingMatch;
              const level = hashes.length;
              return `<h${level} style="text-align: ${align}">${text}</h${level}>`;
            }
          }

          // 默认作为段落处理
          return `<p style="text-align: ${align}">${trimmedContent}</p>`;
        },
      );
      return originalParse(processed);
    };

    // 2. 增强 serialize: Tiptap → MD
    //    为带对齐属性的段落添加自定义语法包裹（在 EnhancedMarkdown 之前链式调用）
    const originalSerialize = manager.serialize.bind(manager);
    manager.serialize = (docOrContent: unknown) => {
      const markdown = originalSerialize(docOrContent);
      return this.options.postProcessTextAlign(this.editor.state.doc, markdown);
    };
  },

  addOptions() {
    return {
      /**
       * 后处理序列化的 markdown，添加对齐标记
       */
      postProcessTextAlign: (doc: TiptapNode, markdown: string): string => {
        if (!doc?.content || !markdown) return markdown;

        const lines = markdown.split('\n');
        const alignments: Array<{ lineIndex: number; align: string }> = [];
        let currentLineIndex = 0;

        // 遍历文档节点，找到带对齐属性的段落/标题
        doc.content.forEach((node: TiptapNode) => {
          const nodeName = node.type?.name;
          const align = node.attrs?.textAlign;

          // 记录非默认对齐的段落位置
          if (
            (nodeName === 'paragraph' || nodeName === 'heading') &&
            align &&
            align !== 'left'
          ) {
            alignments.push({ lineIndex: currentLineIndex, align });
          }

          // 跳过空行，定位到下一个实际内容行
          if (nodeName === 'paragraph' || nodeName === 'heading') {
            currentLineIndex++;
            while (
              currentLineIndex < lines.length &&
              lines[currentLineIndex].trim() === ''
            ) {
              currentLineIndex++;
            }
          } else if (nodeName) {
            currentLineIndex++;
          }
        });

        if (alignments.length === 0) return markdown;

        // 从后向前插入对齐标记（避免索引偏移）
        const result = [...lines];
        for (let i = alignments.length - 1; i >= 0; i--) {
          const { lineIndex, align } = alignments[i];
          if (lineIndex < result.length && result[lineIndex].trim() !== '') {
            result.splice(lineIndex, 0, `:::{align=${align}}`);
            result.splice(lineIndex + 2, 0, `:::`);
          }
        }

        return result.join('\n');
      },
    };
  },
});
