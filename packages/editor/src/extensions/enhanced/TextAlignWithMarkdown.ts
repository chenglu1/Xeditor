import { Extension } from '@tiptap/core';
import { TextAlign as TiptapTextAlign } from '@tiptap/extension-text-align';

import {
  convertMarkdownTextAlignToHtml,
  installMarkdownAdapter,
  registerMarkdownParseTransform,
  registerMarkdownSerializeTransform,
  serializeMarkdownTextAlign,
} from '../../adapters/markdownAdapter';

export function createTextAlignWithMarkdown(options?: {
  textAlignSyntax?: 'disabled' | 'directive';
}) {
  return Extension.create({
    name: 'textAlignMarkdown',

    addExtensions() {
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
            parser?: unknown;
            manager?: {
              parse: (markdown: string) => unknown;
              serialize: (docOrContent: unknown) => string;
            };
          };
        }
      ).markdown;

      if (!markdownStorage || options?.textAlignSyntax === 'disabled') {
        return;
      }

      registerMarkdownParseTransform(this.editor, {
        key: 'text-align:parse',
        priority: 10,
        transform: convertMarkdownTextAlignToHtml,
      });
      registerMarkdownSerializeTransform(this.editor, {
        key: 'text-align:serialize',
        priority: 30,
        transform: (markdown, doc) =>
          this.options.postProcessTextAlign(doc, markdown),
      });
      installMarkdownAdapter(this.editor, {
        parser: markdownStorage.parser,
        manager: markdownStorage.manager,
      });
    },

    addOptions() {
      return {
        postProcessTextAlign: serializeMarkdownTextAlign,
      };
    },
  });
}

export const TextAlignWithMarkdown = createTextAlignWithMarkdown();
