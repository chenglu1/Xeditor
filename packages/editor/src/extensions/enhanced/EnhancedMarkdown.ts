import { Markdown } from '@tiptap/markdown';
import type { MarkdownExtensionOptions } from '@tiptap/markdown';

import {
  configureMarkdownIt,
  installMarkdownAdapter,
  isListContinuation,
  normalizeListIndentation,
  normalizeStandaloneImageSpacing,
  postProcessMarkdown,
  preprocessMarkdownForDialect,
  preprocessHtmlTables,
  preprocessMarkdown,
  preprocessTableSpaces,
  registerMarkdownParseTransform,
  registerMarkdownParserSetup,
  registerMarkdownSerializeTransform,
} from '../../adapters/markdownAdapter';
import type { EditorLogger, MarkdownDialectOptions } from '../../types';

function createDialectPreprocessor(options?: MarkdownDialectOptions) {
  return (markdown: string) => {
    return preprocessMarkdownForDialect(markdown, options);
  };
}

export const createEnhancedMarkdown = (options?: {
  markdown?: Partial<MarkdownExtensionOptions>;
  dialect?: MarkdownDialectOptions;
  logger?: EditorLogger;
}) => {
  const dialectPreprocessor = createDialectPreprocessor(options?.dialect);

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

      if (!storage) {
        return;
      }

      registerMarkdownParserSetup(this.editor, {
        key: 'enhanced:markdown-it',
        priority: 10,
        setup: (markdownIt) =>
          configureMarkdownIt(markdownIt, {
            logger: options?.logger,
          }),
      });
      registerMarkdownParseTransform(this.editor, {
        key: 'enhanced:preprocess',
        priority: 20,
        transform: dialectPreprocessor,
      });
      registerMarkdownSerializeTransform(this.editor, {
        key: 'enhanced:postprocess',
        priority: 10,
        transform: (markdown) => postProcessMarkdown(markdown, options?.dialect),
      });
      installMarkdownAdapter(this.editor, {
        parser: storage.parser,
        manager: storage.manager,
        logger: options?.logger,
      });
    },
  }).configure(options?.markdown || {});
};

export {
  isListContinuation,
  normalizeListIndentation,
  normalizeStandaloneImageSpacing,
  postProcessMarkdown,
  preprocessHtmlTables,
  preprocessMarkdown,
  preprocessTableSpaces,
};
