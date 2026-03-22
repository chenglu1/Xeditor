import type { JSONContent } from '@tiptap/core';
import type { Editor } from '@tiptap/react';

import {
  createHtmlSetContentOptions,
  serializeHtmlContent,
} from '../adapters/htmlAdapter';
import {
  createMarkdownSetContentOptions,
  serializeMarkdownContent,
} from '../adapters/markdownAdapter';
import type {
  ContentType,
  EditorValue,
  EditorValueType,
} from '../types';

const contentAdapters = {
  markdown: {
    serialize: serializeMarkdownContent,
    createSetContentOptions: createMarkdownSetContentOptions,
  },
  html: {
    serialize: serializeHtmlContent,
    createSetContentOptions: createHtmlSetContentOptions,
  },
  json: {
    serialize: (editor: Editor) => editor.getJSON(),
    createSetContentOptions: createHtmlSetContentOptions,
  },
} as const;

export function resolveEditorValueType(
  valueType?: EditorValueType,
  contentType?: ContentType,
): EditorValueType {
  if (valueType) {
    return valueType;
  }

  return contentType || 'markdown';
}

export function createEmptyEditorValue(
  valueType: EditorValueType,
): EditorValue {
  if (valueType === 'json') {
    return {
      type: 'doc',
      content: [],
    };
  }

  return '';
}

export function getSerializedEditorContent(
  editor: Editor,
  valueType: EditorValueType,
): EditorValue {
  return contentAdapters[valueType].serialize(editor);
}

export function getEditorCharacterCount(editor: Editor): number {
  return editor.state.doc.textContent.length;
}

export function getEditorWordCount(editor: Editor): number {
  return editor.state.doc.textContent
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function createSetContentOptions(
  valueType: EditorValueType,
  emitUpdate: boolean,
) {
  return contentAdapters[valueType].createSetContentOptions(emitUpdate);
}

export function areEditorValuesEqual(
  left: EditorValue | undefined,
  right: EditorValue | undefined,
): boolean {
  if (left === right) {
    return true;
  }

  if (typeof left === 'string' || typeof right === 'string') {
    return left === right;
  }

  return JSON.stringify(left || null) === JSON.stringify(right || null);
}

export function syncExternalValue(
  editor: Editor | null,
  value: EditorValue | undefined,
  valueType: EditorValueType,
) {
  if (!editor || value === undefined) {
    return false;
  }

  const currentContent = getSerializedEditorContent(editor, valueType);
  if (areEditorValuesEqual(value, currentContent)) {
    return false;
  }

  editor.commands.setContent(
    value as string | JSONContent,
    createSetContentOptions(valueType, false) as any,
  );

  return true;
}
