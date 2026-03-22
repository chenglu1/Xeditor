import type { AnyExtension, Editor } from '@tiptap/core';
import { CharacterCount } from '@tiptap/extension-character-count';
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from '@tiptap/extension-details';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Placeholder as TiptapPlaceholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import StarterKit from '@tiptap/starter-kit';

import { ImageUploadNode } from '../components/tiptap-node/image-upload-node/image-upload-node-extension';
import type {
  AssetUploadHandler,
  EditorExtensionCompositionItem,
  EditorLogger,
  EditorMessages,
  EditorPresetName,
  MarkdownDialectOptions,
} from '../types';
import { createEnhancedMarkdown } from './enhanced/EnhancedMarkdown';
import {
  EnhancedBlockMath,
  EnhancedInlineMath,
} from './enhanced/EnhancedMathematics';
import { createOrderedListWithStart } from './enhanced/OrderedListWithStart';
import { createTextAlignWithMarkdown } from './enhanced/TextAlignWithMarkdown';
import { Subscript, Superscript } from './marks';
import { CustomImage, CustomReactNode } from './nodes';

export interface CreateEditorExtensionsOptions {
  placeholder?: string;
  maxFileSize?: number;
  maxLength?: number;
  imageUploadHandler?: AssetUploadHandler | null;
  messages?: EditorMessages;
  presets?: EditorPresetName[];
  extensions?: AnyExtension[];
  extensionComposition?: EditorExtensionCompositionItem[];
  disableBuiltIns?: string[];
  markdownDialect?: MarkdownDialectOptions;
  logger?: EditorLogger;
  onUploadError?: (error: Error) => void;
}

export const DEFAULT_EDITOR_PRESETS: EditorPresetName[] = [
  'base',
  'formatting',
  'table',
  'math',
  'media',
  'details',
  'markdownDialect',
];

export const EDITOR_BUILT_IN_EXTENSION_KEYS = [
  'starter-kit',
  'placeholder',
  'task-list',
  'link',
  'custom-image',
  'custom-react-node',
  'highlight',
  'subscript',
  'superscript',
  'table',
  'math',
  'details',
  'markdown',
  'ordered-list-start',
  'text-align-markdown',
  'image-upload',
  'character-count',
] as const;

export type EditorBuiltInExtensionKey =
  (typeof EDITOR_BUILT_IN_EXTENSION_KEYS)[number];

interface BuiltInExtensionEntry {
  key: string;
  presets: EditorPresetName[];
  create: (context: {
    placeholder: string;
    maxFileSize?: number;
    maxLength?: number;
    imageUploadHandler?: AssetUploadHandler | null;
    messages?: EditorMessages;
    markdownDialect?: MarkdownDialectOptions;
    logger?: EditorLogger;
    onUploadError?: (error: Error) => void;
  }) => AnyExtension | AnyExtension[] | null;
}

interface ExtensionGroup {
  key: string;
  extensions: AnyExtension[];
}

const builtInExtensionRegistry: BuiltInExtensionEntry[] = [
  {
    key: 'starter-kit',
    presets: ['base'],
    create: () =>
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        orderedList: false,
        link: false,
      }),
  },
  {
    key: 'placeholder',
    presets: ['base'],
    create: ({ placeholder }) =>
      TiptapPlaceholder.configure({
        placeholder: ({
          pos,
          editor,
        }: {
          pos: number;
          editor: Editor;
        }) => {
          if (pos === 0 && editor.isEmpty) {
            return placeholder;
          }

          return '';
        },
        showOnlyWhenEditable: true,
      }),
  },
  {
    key: 'task-list',
    presets: ['base'],
    create: () => [TaskList, TaskItem.configure({ nested: true })],
  },
  {
    key: 'link',
    presets: ['base'],
    create: () =>
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'tiptap-link',
        },
        protocols: ['http', 'https', 'mailto'],
      }),
  },
  {
    key: 'custom-image',
    presets: ['base'],
    create: ({ logger }) => CustomImage.configure({ logger } as any),
  },
  {
    key: 'custom-react-node',
    presets: ['base'],
    create: () => CustomReactNode,
  },
  {
    key: 'highlight',
    presets: ['formatting'],
    create: () => Highlight,
  },
  {
    key: 'subscript',
    presets: ['formatting'],
    create: () => Subscript,
  },
  {
    key: 'superscript',
    presets: ['formatting'],
    create: () => Superscript,
  },
  {
    key: 'table',
    presets: ['table'],
    create: () => [
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
  },
  {
    key: 'math',
    presets: ['math'],
    create: ({ logger }) => {
      const katexConfig = {
        throwOnError: false,
        errorColor: '#cc0000',
        strict: false,
        trust: true,
      };

      return [
        EnhancedBlockMath.configure({
          katexOptions: katexConfig,
          logger,
        } as any),
        EnhancedInlineMath.configure({
          katexOptions: katexConfig,
          logger,
        } as any),
      ];
    },
  },
  {
    key: 'details',
    presets: ['details'],
    create: () => [Details, DetailsSummary, DetailsContent],
  },
  {
    key: 'markdown',
    presets: ['markdownDialect'],
    create: ({ markdownDialect, logger }) =>
      createEnhancedMarkdown({
        dialect: markdownDialect,
        logger,
      }),
  },
  {
    key: 'ordered-list-start',
    presets: ['markdownDialect'],
    create: ({ markdownDialect }) =>
      createOrderedListWithStart({
        preserveOrderedListStart:
          markdownDialect?.preserveOrderedListStart ?? true,
      }),
  },
  {
    key: 'text-align-markdown',
    presets: ['markdownDialect'],
    create: ({ markdownDialect }) =>
      createTextAlignWithMarkdown({
        textAlignSyntax: markdownDialect?.textAlignSyntax ?? 'directive',
      }),
  },
  {
    key: 'image-upload',
    presets: ['media'],
    create: ({
      imageUploadHandler,
      maxFileSize,
      messages,
      onUploadError,
    }) => {
      if (!imageUploadHandler) {
        return null;
      }

      return ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: maxFileSize,
        limit: 3,
        messages,
        upload: imageUploadHandler,
        onError: (error: unknown) => {
          const uploadError =
            error instanceof Error ? error : new Error('Upload failed');
          onUploadError?.(uploadError);
        },
      });
    },
  },
  {
    key: 'character-count',
    presets: ['base'],
    create: ({ maxLength }) => {
      if (!maxLength) {
        return null;
      }

      return CharacterCount.configure({
        limit: maxLength,
      });
    },
  },
];

function toExtensionArray(
  extension: AnyExtension | AnyExtension[] | null,
): AnyExtension[] {
  if (!extension) {
    return [];
  }

  return Array.isArray(extension) ? extension : [extension];
}

function upsertExtensionGroupAt(
  groups: ExtensionGroup[],
  nextGroup: ExtensionGroup,
  index: number,
) {
  const withoutExisting = groups.filter((group) => group.key !== nextGroup.key);
  withoutExisting.splice(index, 0, nextGroup);
  return withoutExisting;
}

function appendExtensionGroup(
  groups: ExtensionGroup[],
  nextGroup: ExtensionGroup,
) {
  return [...groups.filter((group) => group.key !== nextGroup.key), nextGroup];
}

function prependExtensionGroup(
  groups: ExtensionGroup[],
  nextGroup: ExtensionGroup,
) {
  return [nextGroup, ...groups.filter((group) => group.key !== nextGroup.key)];
}

function applyExtensionComposition(options: {
  groups: ExtensionGroup[];
  extensionComposition: EditorExtensionCompositionItem[];
  logger?: EditorLogger;
}) {
  const { extensionComposition, logger } = options;
  let groups = [...options.groups];

  extensionComposition.forEach((item) => {
    const placement = item.placement ?? 'append';
    const nextGroup: ExtensionGroup = {
      key: item.key,
      extensions: toExtensionArray(item.extension),
    };

    if (nextGroup.extensions.length === 0) {
      return;
    }

    if (placement === 'append') {
      groups = appendExtensionGroup(groups, nextGroup);
      return;
    }

    if (placement === 'prepend') {
      groups = prependExtensionGroup(groups, nextGroup);
      return;
    }

    const targetKey = item.target ?? item.key;
    const targetIndex = groups.findIndex((group) => group.key === targetKey);

    if (targetIndex === -1) {
      logger?.warn(
        'Editor extension composition target was not found. Appending extension group instead.',
        {
          key: item.key,
          placement,
          target: item.target,
        },
      );
      groups = appendExtensionGroup(groups, nextGroup);
      return;
    }

    if (placement === 'replace') {
      groups = groups.map((group, index) =>
        index === targetIndex ? nextGroup : group,
      );
      groups = groups.filter(
        (group, index) => index === targetIndex || group.key !== nextGroup.key,
      );
      return;
    }

    const insertionIndex =
      placement === 'before' ? targetIndex : targetIndex + 1;
    groups = upsertExtensionGroupAt(groups, nextGroup, insertionIndex);
  });

  return groups;
}

export const createEditorExtensions = ({
  placeholder = '开始输入...',
  maxFileSize,
  maxLength,
  imageUploadHandler,
  messages,
  presets = DEFAULT_EDITOR_PRESETS,
  extensions = [],
  extensionComposition = [],
  disableBuiltIns = [],
  markdownDialect,
  logger,
  onUploadError,
}: CreateEditorExtensionsOptions) => {
  const enabledPresets = new Set(presets);
  const disabledBuiltIns = new Set(disableBuiltIns);
  const builtInGroups: ExtensionGroup[] = [];

  builtInExtensionRegistry.forEach((entry) => {
    if (disabledBuiltIns.has(entry.key)) {
      return;
    }

    if (!entry.presets.some((preset) => enabledPresets.has(preset))) {
      return;
    }

    const nextExtension = toExtensionArray(
      entry.create({
      placeholder,
      maxFileSize,
      maxLength,
      imageUploadHandler,
      messages,
      markdownDialect,
      logger,
      onUploadError,
    }),
    );

    if (nextExtension.length === 0) {
      return;
    }

    builtInGroups.push({
      key: entry.key,
      extensions: nextExtension,
    });
  });

  const groupsWithComposition = applyExtensionComposition({
    groups: builtInGroups,
    extensionComposition,
    logger,
  });

  const legacyExtensionGroups = extensions.map((extension, index) => ({
    key: `legacy-extension:${index}`,
    extensions: [extension],
  }));

  return [...groupsWithComposition, ...legacyExtensionGroups].flatMap(
    (group) => group.extensions,
  );
};
