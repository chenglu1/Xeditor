import { Markdown } from '@tiptap/markdown';
import type { MarkdownExtensionOptions } from '@tiptap/markdown';

import {
  configureMarkdownIt,
  installMarkdownAdapter,
  isListContinuation,
  normalizeListIndentation,
  postProcessMarkdown,
  preprocessHtmlTables,
  preprocessMarkdown,
  preprocessTableSpaces,
  registerMarkdownParseTransform,
  registerMarkdownParserSetup,
  registerMarkdownSerializeTransform,
} from '../../adapters/markdownAdapter';
import type { EditorLogger, MarkdownDialectOptions } from '../../types';

function createDialectPreprocessor(options?: MarkdownDialectOptions) {
  const {
    normalizeListIndentation: shouldNormalizeListIndentation = true,
    normalizeTables = true,
  } = options || {};

  return (markdown: string) => {
    if (!markdown || typeof markdown !== 'string') {
      return markdown || '';
    }

    let processedMarkdown = markdown;

    if (normalizeTables) {
      processedMarkdown = preprocessHtmlTables(processedMarkdown);
      processedMarkdown = preprocessTableSpaces(processedMarkdown);
    }

    if (shouldNormalizeListIndentation) {
      processedMarkdown = normalizeListIndentation(processedMarkdown);
    }

    return processedMarkdown;
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
        transform:
          options?.dialect?.normalizeListIndentation === false &&
          options?.dialect?.normalizeTables === false
            ? (markdown) => markdown
            : dialectPreprocessor,
      });
      registerMarkdownSerializeTransform(this.editor, {
        key: 'enhanced:postprocess',
        priority: 10,
        transform: (markdown) => postProcessMarkdown(markdown),
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
  postProcessMarkdown,
  preprocessHtmlTables,
  preprocessMarkdown,
  preprocessTableSpaces,
};
