/*
 * @Description: 自定义上标扩展，支持 Markdown 语法 ^text^
 */
import { Mark } from '@tiptap/core';
import type {
  MarkdownToken,
  MarkdownParseHelpers,
  MarkdownParseResult,
} from '@tiptap/core';

export interface SuperscriptOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    superscript: {
      /**
       * Set a superscript mark
       */
      setSuperscript: () => ReturnType;
      /**
       * Toggle a superscript mark
       */
      toggleSuperscript: () => ReturnType;
      /**
       * Unset a superscript mark
       */
      unsetSuperscript: () => ReturnType;
    };
  }
}

export const Superscript = Mark.create<SuperscriptOptions>({
  name: 'superscript',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'sup' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['sup', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setSuperscript:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleSuperscript:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetSuperscript:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-.': () => this.editor.commands.toggleSuperscript(),
    };
  },
  markdownTokenName: 'superscript',

  parseMarkdown: (
    token: MarkdownToken,
    helpers: MarkdownParseHelpers,
  ): MarkdownParseResult => {
    const content = helpers.parseInline(token.tokens || []);
    return helpers.applyMark('superscript', content);
  },
  // Markdown 序列化支持（仅输出，不解析）
  renderMarkdown: (node: unknown, helpers: unknown) => {
    const content = (
      helpers as { renderChildren: (children: unknown[]) => string }
    ).renderChildren((node as { content?: unknown[] }).content || []);
    return `^${content}^`;
  },
  markdownTokenizer: {
    name: 'superscript',
    level: 'inline',
    start: (src: string) => src.indexOf('^'),
    tokenize: (src, _tokens, lexer) => {
      const match = /^\^([^^]+)\^/.exec(src);
      if (!match) return undefined;

      return {
        type: 'superscript',
        raw: match[0],
        text: match[1],
        tokens: lexer.inlineTokens(match[1]),
      };
    },
  },
  // 设置较低优先级，让数学公式扩展先处理
  priority: 50,
});
