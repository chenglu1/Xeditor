import type { NodeType } from '@tiptap/pm/model';
import { mergeAttributes, Node, ReactNodeViewRenderer } from '@tiptap/react';

import type {
  AssetUploadHandler,
  EditorMessages,
  UploadedAsset,
} from '../../../types';
import { ImageUploadNode as ImageUploadNodeComponent } from './image-upload-node';

export type UploadFunction = AssetUploadHandler;

export interface ImageUploadNodeOptions {
  type?: string | NodeType | undefined;
  accept?: string;
  limit?: number;
  maxSize?: number;
  messages?: EditorMessages;
  upload?: UploadFunction;
  onError?: (error: Error) => void;
  onSuccess?: (asset: UploadedAsset) => void;
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUploadNode: (options?: ImageUploadNodeOptions) => ReturnType;
    };
  }
}

export const ImageUploadNode = Node.create<ImageUploadNodeOptions>({
  name: 'imageUpload',

  group: 'block',
  draggable: true,
  selectable: true,
  atom: true,

  addOptions() {
    return {
      type: 'image',
      accept: 'image/*',
      limit: 1,
      maxSize: 0,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      accept: {
        default: this.options.accept,
      },
      limit: {
        default: this.options.limit,
      },
      maxSize: {
        default: this.options.maxSize,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-type': 'image-upload' }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadNodeComponent);
  },

  addCommands() {
    return {
      setImageUploadNode:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        const { nodeAfter } = selection.$from;

        if (
          nodeAfter &&
          nodeAfter.type.name === 'imageUpload' &&
          editor.isActive('imageUpload')
        ) {
          const nodeEl = editor.view.nodeDOM(selection.$from.pos);
          if (nodeEl && nodeEl instanceof HTMLElement) {
            const firstChild = nodeEl.firstChild;
            if (firstChild && firstChild instanceof HTMLElement) {
              firstChild.click();
              return true;
            }
          }
        }

        return false;
      },
    };
  },
});

export default ImageUploadNode;
