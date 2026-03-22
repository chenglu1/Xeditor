import { Extension } from '@tiptap/core';
import { OrderedList as TiptapOrderedList } from '@tiptap/extension-ordered-list';

import {
  fixOrderedListStart,
  installMarkdownAdapter,
  registerMarkdownSerializeTransform,
} from '../../adapters/markdownAdapter';

export function createOrderedListWithStart(options?: {
  preserveOrderedListStart?: boolean;
}) {
  return Extension.create({
    name: 'orderedListWithStart',

    addExtensions() {
      return [TiptapOrderedList];
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

      if (!markdownStorage || options?.preserveOrderedListStart === false) {
        return;
      }

      registerMarkdownSerializeTransform(this.editor, {
        key: 'ordered-list:start',
        priority: 20,
        transform: (markdown, doc) => fixOrderedListStart(markdown, doc),
      });
      installMarkdownAdapter(this.editor, {
        parser: markdownStorage.parser,
        manager: markdownStorage.manager,
      });
    },
  });
}

export const OrderedListWithStart = createOrderedListWithStart();
export { fixOrderedListStart };
