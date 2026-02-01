/*
 * 增强的 Markdown 扩展
 * 功能：表格空行处理、列表缩进规范化、链接格式修复
 */
import { Markdown } from '@tiptap/markdown';
import type { MarkdownExtensionOptions } from '@tiptap/markdown';

// 常量定义
const LIST_ITEM_PATTERN = /^[-*+]\s+|^\d+[.)]\s+/;
const INDENT_PATTERN = /^( {2,})(\S.*)$/;
const STANDARD_INDENT = '    ';
const STANDARD_INDENT_SPACES = 4;

/**
 * 创建增强的 Markdown 扩展
 */
export const createEnhancedMarkdown = (
  options?: Partial<MarkdownExtensionOptions>,
) => {
  return Markdown.extend({
    onBeforeCreate() {
      if (this.parent) {
        this.parent({ editor: this.editor });
      }

      const storage = (
        this.editor.storage as {
          markdown?: {
            parser?: unknown;
            manager?: {
              parse: (markdown: string) => unknown;
              serialize: (docOrContent: unknown) => string;
            };
          };
        }
      ).markdown;
      if (!storage) return;

      const parser = storage.parser;
      if (parser) {
        configureMarkdownIt(parser);
      }

      const manager = storage.manager;
      if (!manager) return;

      // 增强 parse：预处理表格和列表格式
      const originalParse = manager.parse.bind(manager);
      manager.parse = (markdown: string) => {
        try {
          const processed = preprocessMarkdown(markdown);
          return originalParse(processed);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Markdown parse error:', error);
          return originalParse(markdown);
        }
      };

      // 增强 serialize：后处理链接格式
      const originalSerialize = manager.serialize.bind(manager);
      manager.serialize = (docOrContent: unknown) => {
        try {
          const markdown = originalSerialize(
            docOrContent as Parameters<typeof originalSerialize>[0],
          );
          return postProcessMarkdown(markdown);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Markdown serialize error:', error);
          return originalSerialize(
            docOrContent as Parameters<typeof originalSerialize>[0],
          );
        }
      };
    },
  }).configure(options || {});
};

// 辅助函数

function configureMarkdownIt(markdownIt: unknown) {
  if (!markdownIt) return;

  const md = markdownIt as {
    set: (options: {
      html: boolean;
      breaks: boolean;
      linkify: boolean;
      typographer: boolean;
    }) => void;
    enable?: (plugins: string[]) => void;
  };

  md.set({
    html: true,
    breaks: false,
    linkify: true,
    typographer: false,
  });

  if (md.enable) {
    try {
      md.enable(['table']);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Table plugin not available:', e);
    }
  }
}

/**
 * 预处理 Markdown 内容：处理表格、列表格式
 */
function preprocessMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return markdown || '';

  let processed = preprocessHtmlTables(markdown);
  processed = preprocessTableSpaces(processed);
  processed = normalizeListIndentation(processed);
  return processed;
}

/**
 * 处理 HTML 表格：确保表格前后有空行，避免影响后续 Markdown 解析
 */
function preprocessHtmlTables(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return markdown || '';

  // 匹配 <table>...</table> 标签，在前后添加空行确保独立的 HTML 块
  let processed = markdown.replace(/(<table[\s\S]*?<\/table>)/gi, (match) => {
    return `\n\n${match}\n\n`;
  });

  // 清理多余的连续空行（超过2个）
  processed = processed.replace(/\n{3,}/g, '\n\n');

  return processed;
}

/**
 * 移除表格行之间的空行（GFM表格要求行连续）
 */
function preprocessTableSpaces(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return markdown || '';

  const lines = markdown.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 检测表格开始（|开头结尾）
    if (trimmed && trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];

      // 收集表格行（跳过中间空行）
      while (i < lines.length) {
        const currentLine = lines[i];
        const currentTrimmed = currentLine.trim();

        if (currentTrimmed === '') {
          // 空行：前瞻检查后续是否还有表格行
          let hasMoreTableLines = false;
          for (let j = i + 1; j < lines.length; j++) {
            const futureLineTrimmed = lines[j].trim();
            if (futureLineTrimmed === '') continue;
            if (
              futureLineTrimmed.startsWith('|') &&
              futureLineTrimmed.endsWith('|')
            ) {
              hasMoreTableLines = true;
            }
            break;
          }

          if (hasMoreTableLines) {
            i++;
            continue;
          } else {
            break;
          }
        } else if (
          currentTrimmed.startsWith('|') &&
          currentTrimmed.endsWith('|')
        ) {
          tableLines.push(currentLine);
          i++;
        } else {
          break;
        }
      }

      // 输出表格（前后加空行）
      if (tableLines.length > 0) {
        if (result.length > 0 && result[result.length - 1].trim() !== '') {
          result.push('');
        }
        result.push(...tableLines);
        if (i < lines.length && lines[i].trim() !== '') {
          result.push('');
        }
      }
    } else {
      result.push(line);
      i++;
    }
  }

  return result.join('\n');
}

/**
 * 规范化列表缩进（2空格→4空格，移除列表项内空行）
 */
function normalizeListIndentation(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return markdown || '';

  const lines = markdown.split('\n');
  const result: string[] = [];
  let inListItem = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 检测列表项开始
    if (LIST_ITEM_PATTERN.test(trimmed)) {
      inListItem = true;
      result.push(line);
      continue;
    }

    if (inListItem) {
      // 处理空行
      if (trimmed === '') {
        if (isListContinuation(lines, i)) {
          continue; // 跳过列表项内空行
        }
        result.push(line);
        inListItem = false;
        continue;
      }

      // 处理缩进内容
      const indentMatch = line.match(INDENT_PATTERN);
      if (indentMatch) {
        const [, indent, content] = indentMatch;

        if (!LIST_ITEM_PATTERN.test(content)) {
          // 标准化缩进为4空格
          result.push(
            indent.length < STANDARD_INDENT_SPACES
              ? STANDARD_INDENT + content
              : line,
          );
          continue;
        }
      }

      if (trimmed) {
        inListItem = false;
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

/**
 * 检查是否为列表项的连续内容
 */
function isListContinuation(lines: string[], currentIndex: number): boolean {
  if (currentIndex + 1 >= lines.length) return false;

  const nextLine = lines[currentIndex + 1];
  const nextTrimmed = nextLine.trim();

  return (
    nextLine.match(INDENT_PATTERN) !== null &&
    nextTrimmed.length > 0 &&
    !LIST_ITEM_PATTERN.test(nextTrimmed)
  );
}

/**
 * 修复链接格式：`[text](url)` → [`text`](url)
 */
function postProcessMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return markdown || '';

  return markdown
    .replace(
      /`\[([^\]]+)\]\(([^)]+)\)`/g,
      (_, text, url) => `[\`${text}\`](${url})`,
    )
    .replace(
      /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g,
      (_, text, url) => `[**${text}**](${url})`,
    )
    .replace(
      /(?<!\*)\*\[([^\]]+)\]\(([^)]+)\)\*(?!\*)/g,
      (_, text, url) => `[*${text}*](${url})`,
    );
}
