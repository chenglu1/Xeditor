/*
 * @Description: 支持起始编号的有序列表扩展
 * 通过拦截 Markdown manager 的 serialize 方法来保留列表起始编号
 */
import { Extension } from '@tiptap/core';
import { OrderedList as TiptapOrderedList } from '@tiptap/extension-ordered-list';
import type { Node as TiptapNode } from '@tiptap/pm/model';

/**
 * 增强的 OrderedList 扩展
 * 使用 onBeforeCreate 钩子拦截序列化，保留列表起始编号
 */
export const OrderedListWithStart = Extension.create({
  name: 'orderedListWithStart',

  addExtensions() {
    // 添加标准的 OrderedList 功能
    return [TiptapOrderedList];
  },

  onBeforeCreate() {
    const markdownStorage = (
      this.editor.storage as {
        markdown?: {
          manager?: {
            serialize: (docOrContent: unknown) => string;
          };
        };
      }
    ).markdown;

    if (!markdownStorage?.manager) {
      return;
    }

    const manager = markdownStorage.manager;

    // 拦截 serialize 方法，在序列化后修复列表起始编号
    const originalSerialize = manager.serialize.bind(manager);
    manager.serialize = (docOrContent: unknown) => {
      const markdown = originalSerialize(docOrContent);
      return fixOrderedListStart(markdown, this.editor.state.doc);
    };
  },
});

/**
 * 修复有序列表的起始编号
 * 策略：从文档树获取真实的 start 值，映射到 Markdown 的列表段
 */
function fixOrderedListStart(markdown: string, doc: TiptapNode): string {
  if (!markdown || !doc) return markdown;

  // 收集所有 orderedList 的 start 信息（这是真实的起始编号）
  const listStarts: number[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc.content.forEach((node: any) => {
    if (node.type?.name === 'orderedList') {
      listStarts.push(node.attrs?.start || 1);
    }
  });

  // 如果没有 start>1 的列表，不需要处理
  if (listStarts.length === 0 || !listStarts.some((start) => start > 1)) {
    return markdown;
  }

  const lines = markdown.split('\n');
  const result = [...lines];

  // 识别 Markdown 中的列表段（序列化后都是从1开始的连续编号）
  const listSegments: Array<{
    startLine: number;
    endLine: number;
    listIndex: number; // 对应文档树中第几个列表
  }> = [];

  let segmentStartLine = -1;
  let currentListIndex = 0;
  let consecutiveNonListLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const listItemMatch = lines[i].match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (listItemMatch) {
      const currentNumber = parseInt(listItemMatch[2], 10);

      if (segmentStartLine === -1) {
        // 新列表段开始
        segmentStartLine = i;
      } else if (currentNumber === 1) {
        // 编号重置为1，说明是新的列表段
        listSegments.push({
          startLine: segmentStartLine,
          endLine: i - 1,
          listIndex: currentListIndex,
        });
        currentListIndex++;
        segmentStartLine = i;
      }

      consecutiveNonListLines = 0;
    } else if (segmentStartLine !== -1) {
      // 在列表段中遇到非列表行
      consecutiveNonListLines++;

      // 连续2行非空非列表行，认为列表段结束
      if (consecutiveNonListLines >= 2 && lines[i].trim() !== '') {
        listSegments.push({
          startLine: segmentStartLine,
          endLine: i - consecutiveNonListLines,
          listIndex: currentListIndex,
        });
        currentListIndex++;
        segmentStartLine = -1;
      }
    }
  }

  // 保存最后一段
  if (segmentStartLine !== -1) {
    listSegments.push({
      startLine: segmentStartLine,
      endLine: lines.length - 1,
      listIndex: currentListIndex,
    });
  }

  // 修复列表段，使用文档树中的真实 start 值
  listSegments.forEach(({ startLine, endLine, listIndex }) => {
    const actualStart = listStarts[listIndex] || 1;

    // 只修复 start > 1 的段落
    if (actualStart > 1) {
      let currentNum = actualStart;
      for (let i = startLine; i <= endLine; i++) {
        const listItemMatch = result[i].match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (listItemMatch) {
          const [, indent, , content] = listItemMatch;
          result[i] = `${indent}${currentNum}. ${content}`;
          currentNum++;
        }
      }
    }
  });

  return result.join('\n');
}
