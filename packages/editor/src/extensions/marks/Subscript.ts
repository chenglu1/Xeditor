/*
 * @Description: 自定义下标扩展，支持 Markdown 语法 ~text~
 */
import { Mark } from '@tiptap/core';
import type {
  MarkdownToken,
  MarkdownParseHelpers,
  MarkdownParseResult,
} from '@tiptap/core';

export interface SubscriptOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    subscript: {
      /**
       * Set a subscript mark
       */
      setSubscript: () => ReturnType;
      /**
       * Toggle a subscript mark
       */
      toggleSubscript: () => ReturnType;
      /**
       * Unset a subscript mark
       */
      unsetSubscript: () => ReturnType;
    };
  }
}

export const Subscript = Mark.create<SubscriptOptions>({
  name: 'subscript',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'sub' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['sub', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setSubscript:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleSubscript:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetSubscript:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-,': () => this.editor.commands.toggleSubscript(),
    };
  },
  // Markdown 支持
  markdownTokenName: 'subscript',

  parseMarkdown: (
    token: MarkdownToken,
    helpers: MarkdownParseHelpers,
  ): MarkdownParseResult => {
    const content = helpers.parseInline(token.tokens || []);
    return helpers.applyMark('subscript', content);
  },
  // Markdown 序列化支持（仅输出，不解析）
  renderMarkdown: (node: unknown, helpers: unknown) => {
    const content = (
      helpers as { renderChildren: (children: unknown[]) => string }
    ).renderChildren((node as { content?: unknown[] }).content || []);
    return `~${content}~`;
  },
  markdownTokenizer: {
    name: 'subscript',
    level: 'inline',
    start: (src: string) => src.indexOf('~'),
    tokenize: (src, _tokens, lexer) => {
      const match = /^~([^~]+)~/.exec(src);
      if (!match) return undefined;

      return {
        type: 'subscript',
        raw: match[0],
        text: match[1],
        tokens: lexer.inlineTokens(match[1]),
      };
    },
  },
  // 设置较低优先级，让数学公式扩展先处理
  priority: 50,
});
