import type { Editor } from '@tiptap/core';
import type { Node as TiptapNode } from '@tiptap/pm/model';
import type { Editor as ReactEditor } from '@tiptap/react';

import type { EditorLogger, MarkdownDialectOptions } from '../types';
import type { SetContentOptions } from './htmlAdapter';

const LIST_ITEM_PATTERN = /^[-*+]\s+|^\d+[.)]\s+/;
const INDENT_PATTERN = /^( {2,})(\S.*)$/;
const STANDARD_INDENT = '    ';
const STANDARD_INDENT_SPACES = 4;
const ALIGN_SYNTAX_PATTERN = /:::\{align=(\w+)\}\n([\s\S]*?)\n:::/g;
const MARKDOWN_ADAPTER_STORAGE_KEY = 'xeditorMarkdownAdapter';
const MARKDOWN_IMAGE_PATTERN = /^!\[[^\]]*]\((?:[^()]|\([^()]*\))*\)$/;

interface MarkdownManager {
  parse: (markdown: string) => unknown;
  serialize: (docOrContent: unknown) => string;
}

type MarkdownParseTransform = (markdown: string) => string;
type MarkdownSerializeTransform = (
  markdown: string,
  doc?: TiptapNode,
) => string;
type MarkdownParserSetup = (parser: unknown) => void;

interface RegisteredMarkdownTransform<TTransform> {
  key: string;
  priority: number;
  transform: TTransform;
}

interface MarkdownAdapterStorage {
  installed: boolean;
  logger?: EditorLogger;
  manager?: MarkdownManager;
  parser?: unknown;
  parseTransforms: Array<RegisteredMarkdownTransform<MarkdownParseTransform>>;
  serializeTransforms: Array<
    RegisteredMarkdownTransform<MarkdownSerializeTransform>
  >;
  parserSetups: Array<RegisteredMarkdownTransform<MarkdownParserSetup>>;
}

function getMarkdownAdapterStorage(editor: Editor): MarkdownAdapterStorage {
  const storage = editor.storage as unknown as Record<string, unknown> & {
    xeditorMarkdownAdapter?: MarkdownAdapterStorage;
  };

  if (!storage[MARKDOWN_ADAPTER_STORAGE_KEY]) {
    storage[MARKDOWN_ADAPTER_STORAGE_KEY] = {
      installed: false,
      parseTransforms: [],
      serializeTransforms: [],
      parserSetups: [],
    };
  }

  return storage[MARKDOWN_ADAPTER_STORAGE_KEY] as MarkdownAdapterStorage;
}

function upsertTransform<TTransform>(
  transforms: Array<RegisteredMarkdownTransform<TTransform>>,
  nextTransform: RegisteredMarkdownTransform<TTransform>,
) {
  const existingIndex = transforms.findIndex(
    (transform) => transform.key === nextTransform.key,
  );

  if (existingIndex >= 0) {
    transforms[existingIndex] = nextTransform;
  } else {
    transforms.push(nextTransform);
  }

  transforms.sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    return left.key.localeCompare(right.key);
  });
}

function runMarkdownParseTransforms(
  transforms: Array<RegisteredMarkdownTransform<MarkdownParseTransform>>,
  markdown: string,
) {
  return transforms.reduce((currentMarkdown, transform) => {
    return transform.transform(currentMarkdown);
  }, markdown);
}

function runMarkdownSerializeTransforms(
  transforms: Array<RegisteredMarkdownTransform<MarkdownSerializeTransform>>,
  markdown: string,
  doc?: TiptapNode,
) {
  return transforms.reduce((currentMarkdown, transform) => {
    return transform.transform(currentMarkdown, doc);
  }, markdown);
}

function applyMarkdownParserSetups(
  parserSetups: Array<RegisteredMarkdownTransform<MarkdownParserSetup>>,
  parser: unknown,
) {
  parserSetups.forEach(({ transform }) => {
    transform(parser);
  });
}

export function installMarkdownAdapter(editor: Editor, options: {
  manager?: MarkdownManager;
  parser?: unknown;
  logger?: EditorLogger;
}) {
  const { manager, parser, logger } = options;
  const storage = getMarkdownAdapterStorage(editor);

  if (logger) {
    storage.logger = logger;
  }

  if (parser) {
    storage.parser = parser;
    applyMarkdownParserSetups(storage.parserSetups, parser);
  }

  if (manager) {
    storage.manager = manager;
  }

  if (!storage.manager || storage.installed) {
    return;
  }

  const originalParse = storage.manager.parse.bind(storage.manager);
  storage.manager.parse = (markdown: string) => {
    try {
      const processedMarkdown = runMarkdownParseTransforms(
        storage.parseTransforms,
        markdown,
      );
      return originalParse(processedMarkdown);
    } catch (error) {
      storage.logger?.error('Markdown parse failed. Falling back to raw input.', {
        phase: 'parse',
        error,
      });
      return originalParse(markdown);
    }
  };

  const originalSerialize = storage.manager.serialize.bind(storage.manager);
  storage.manager.serialize = (docOrContent: unknown) => {
    try {
      const markdown = originalSerialize(docOrContent);
      return runMarkdownSerializeTransforms(
        storage.serializeTransforms,
        markdown,
        editor.state?.doc,
      );
    } catch (error) {
      storage.logger?.error(
        'Markdown serialize failed. Falling back to the original serializer output.',
        {
          phase: 'serialize',
          error,
        },
      );
      return originalSerialize(docOrContent);
    }
  };

  storage.installed = true;
}

export function registerMarkdownParserSetup(
  editor: Editor,
  options: {
    key: string;
    priority?: number;
    setup: MarkdownParserSetup;
  },
) {
  const storage = getMarkdownAdapterStorage(editor);

  upsertTransform(storage.parserSetups, {
    key: options.key,
    priority: options.priority ?? 0,
    transform: options.setup,
  });

  if (storage.parser) {
    applyMarkdownParserSetups(storage.parserSetups, storage.parser);
  }
}

export function registerMarkdownParseTransform(
  editor: Editor,
  options: {
    key: string;
    priority?: number;
    transform: MarkdownParseTransform;
  },
) {
  const storage = getMarkdownAdapterStorage(editor);

  upsertTransform(storage.parseTransforms, {
    key: options.key,
    priority: options.priority ?? 0,
    transform: options.transform,
  });
}

export function registerMarkdownSerializeTransform(
  editor: Editor,
  options: {
    key: string;
    priority?: number;
    transform: MarkdownSerializeTransform;
  },
) {
  const storage = getMarkdownAdapterStorage(editor);

  upsertTransform(storage.serializeTransforms, {
    key: options.key,
    priority: options.priority ?? 0,
    transform: options.transform,
  });
}

export function configureMarkdownIt(
  markdownIt: unknown,
  options?: { logger?: EditorLogger },
) {
  if (!markdownIt) {
    return;
  }

  const markdownParser = markdownIt as {
    set: (options: {
      html: boolean;
      breaks: boolean;
      linkify: boolean;
      typographer: boolean;
    }) => void;
    enable?: (plugins: string[]) => void;
  };

  markdownParser.set({
    html: true,
    breaks: false,
    linkify: true,
    typographer: false,
  });

  if (markdownParser.enable) {
    try {
      markdownParser.enable(['table']);
    } catch (error) {
      options?.logger?.warn('Markdown-it table plugin is not available.', {
        phase: 'parse',
        error,
      });
    }
  }
}

export function serializeMarkdownContent(editor: ReactEditor): string {
  return editor.getMarkdown();
}

export function createMarkdownSetContentOptions(
  emitUpdate: boolean,
): SetContentOptions {
  return {
    emitUpdate,
    contentType: 'markdown' as const,
  };
}

export function preprocessMarkdownForDialect(
  markdown: string,
  options?: MarkdownDialectOptions,
): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown || '';
  }

  let processedMarkdown = markdown;

  if (options?.textAlignSyntax !== 'disabled') {
    processedMarkdown = convertMarkdownTextAlignToHtml(processedMarkdown);
  }

  if (options?.normalizeTables !== false) {
    processedMarkdown = preprocessHtmlTables(processedMarkdown);
    processedMarkdown = preprocessTableSpaces(processedMarkdown);
  }

  if (options?.normalizeListIndentation !== false) {
    processedMarkdown = normalizeListIndentation(processedMarkdown);
  }

  if (options?.standaloneImageSpacing !== false) {
    processedMarkdown = normalizeStandaloneImageSpacing(processedMarkdown);
  }

  return processedMarkdown;
}

export function preprocessMarkdown(markdown: string): string {
  return preprocessMarkdownForDialect(markdown);
}

function isFenceDelimiter(
  trimmedLine: string,
  activeFence: { marker: string; length: number } | null,
) {
  const fenceMatch = trimmedLine.match(/^(`{3,}|~{3,})/);

  if (!fenceMatch) {
    return null;
  }

  const token = fenceMatch[1];

  if (!activeFence) {
    return {
      opensFence: true,
      closesFence: false,
      marker: token[0],
      length: token.length,
    };
  }

  return {
    opensFence: false,
    closesFence:
      token[0] === activeFence.marker && token.length >= activeFence.length,
    marker: token[0],
    length: token.length,
  };
}

function isStandaloneMarkdownImageLine(line: string) {
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    return false;
  }

  return MARKDOWN_IMAGE_PATTERN.test(trimmedLine);
}

export function normalizeStandaloneImageSpacing(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown || '';
  }

  const lines = markdown.split('\n');
  const result: string[] = [];
  let activeFence: { marker: string; length: number } | null = null;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmedLine = line.trim();
    const fenceState = isFenceDelimiter(trimmedLine, activeFence);

    if (fenceState?.opensFence) {
      activeFence = {
        marker: fenceState.marker,
        length: fenceState.length,
      };
      result.push(line);
      continue;
    }

    if (fenceState?.closesFence) {
      activeFence = null;
      result.push(line);
      continue;
    }

    if (activeFence || !isStandaloneMarkdownImageLine(line)) {
      result.push(line);
      continue;
    }

    if (result.length > 0 && result[result.length - 1].trim() !== '') {
      result.push('');
    }

    result.push(trimmedLine);

    const nextLine = lines[lineIndex + 1];
    if (typeof nextLine === 'string' && nextLine.trim() !== '') {
      result.push('');
    }
  }

  return result.join('\n');
}

export function preprocessHtmlTables(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown || '';
  }

  const processedMarkdown = markdown.replace(
    /(<table[\s\S]*?<\/table>)/gi,
    (match) => `\n\n${match}\n\n`,
  );

  return processedMarkdown.replace(/\n{3,}/g, '\n\n');
}

export function preprocessTableSpaces(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown || '';
  }

  const lines = markdown.split('\n');
  const result: string[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    const trimmedLine = line.trim();

    if (trimmedLine && trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      const tableLines: string[] = [];

      while (lineIndex < lines.length) {
        const currentLine = lines[lineIndex];
        const currentTrimmed = currentLine.trim();

        if (currentTrimmed === '') {
          let hasMoreTableLines = false;

          for (let nextLineIndex = lineIndex + 1; nextLineIndex < lines.length; nextLineIndex++) {
            const nextTrimmed = lines[nextLineIndex].trim();

            if (nextTrimmed === '') {
              continue;
            }

            if (nextTrimmed.startsWith('|') && nextTrimmed.endsWith('|')) {
              hasMoreTableLines = true;
            }

            break;
          }

          if (hasMoreTableLines) {
            lineIndex++;
            continue;
          }

          break;
        }

        if (currentTrimmed.startsWith('|') && currentTrimmed.endsWith('|')) {
          tableLines.push(currentLine);
          lineIndex++;
          continue;
        }

        break;
      }

      if (tableLines.length > 0) {
        if (result.length > 0 && result[result.length - 1].trim() !== '') {
          result.push('');
        }

        result.push(...tableLines);

        if (lineIndex < lines.length && lines[lineIndex].trim() !== '') {
          result.push('');
        }
      }

      continue;
    }

    result.push(line);
    lineIndex++;
  }

  return result.join('\n');
}

export function normalizeListIndentation(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown || '';
  }

  const lines = markdown.split('\n');
  const result: string[] = [];
  let inListItem = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmedLine = line.trim();

    if (LIST_ITEM_PATTERN.test(trimmedLine)) {
      inListItem = true;
      result.push(line);
      continue;
    }

    if (inListItem) {
      if (trimmedLine === '') {
        if (isListContinuation(lines, lineIndex)) {
          continue;
        }

        result.push(line);
        inListItem = false;
        continue;
      }

      const indentMatch = line.match(INDENT_PATTERN);
      if (indentMatch) {
        const [, indent, content] = indentMatch;

        if (!LIST_ITEM_PATTERN.test(content)) {
          result.push(
            indent.length < STANDARD_INDENT_SPACES
              ? STANDARD_INDENT + content
              : line,
          );
          continue;
        }
      }

      if (trimmedLine) {
        inListItem = false;
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

export function isListContinuation(
  lines: string[],
  currentIndex: number,
): boolean {
  if (currentIndex + 1 >= lines.length) {
    return false;
  }

  const nextLine = lines[currentIndex + 1];
  const nextTrimmed = nextLine.trim();

  return (
    nextLine.match(INDENT_PATTERN) !== null &&
    nextTrimmed.length > 0 &&
    !LIST_ITEM_PATTERN.test(nextTrimmed)
  );
}

export function postProcessMarkdown(
  markdown: string,
  options?: MarkdownDialectOptions,
): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown || '';
  }

  const formattedMarkdown = markdown
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

  if (options?.standaloneImageSpacing === false) {
    return formattedMarkdown;
  }

  return normalizeStandaloneImageSpacing(formattedMarkdown);
}

export function convertMarkdownTextAlignToHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown || '';
  }

  return markdown.replace(ALIGN_SYNTAX_PATTERN, (_, align, content) => {
    const trimmedContent = content.trim();

    if (trimmedContent.startsWith('#')) {
      const headingMatch = trimmedContent.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const [, hashes, text] = headingMatch;
        const level = hashes.length;
        return `<h${level} style="text-align: ${align}">${text}</h${level}>`;
      }
    }

    return `<p style="text-align: ${align}">${trimmedContent}</p>`;
  });
}

export function serializeMarkdownTextAlign(
  doc: TiptapNode | undefined,
  markdown: string,
): string {
  if (!doc?.content || !markdown) {
    return markdown;
  }

  const lines = markdown.split('\n');
  const alignments: Array<{ lineIndex: number; align: string }> = [];
  let currentLineIndex = 0;

  doc.content.forEach((node) => {
    const nodeName = node.type?.name;
    const align = node.attrs?.textAlign as string | undefined;

    if (
      (nodeName === 'paragraph' || nodeName === 'heading') &&
      align &&
      align !== 'left'
    ) {
      alignments.push({ lineIndex: currentLineIndex, align });
    }

    if (nodeName === 'paragraph' || nodeName === 'heading') {
      currentLineIndex++;
      while (
        currentLineIndex < lines.length &&
        lines[currentLineIndex].trim() === ''
      ) {
        currentLineIndex++;
      }
    } else if (nodeName) {
      currentLineIndex++;
    }
  });

  if (alignments.length === 0) {
    return markdown;
  }

  const result = [...lines];
  for (let index = alignments.length - 1; index >= 0; index--) {
    const { lineIndex, align } = alignments[index];

    if (lineIndex < result.length && result[lineIndex].trim() !== '') {
      result.splice(lineIndex, 0, `:::{align=${align}}`);
      result.splice(lineIndex + 2, 0, ':::');
    }
  }

  return result.join('\n');
}

export function fixOrderedListStart(
  markdown: string,
  doc?: TiptapNode,
): string {
  if (!markdown || !doc) {
    return markdown;
  }

  const listStarts: number[] = [];
  doc.content.forEach((node) => {
    if (node.type?.name === 'orderedList') {
      listStarts.push((node.attrs?.start as number | undefined) || 1);
    }
  });

  if (listStarts.length === 0 || !listStarts.some((start) => start > 1)) {
    return markdown;
  }

  const lines = markdown.split('\n');
  const result = [...lines];
  const listSegments: Array<{
    startLine: number;
    endLine: number;
    listIndex: number;
  }> = [];

  let segmentStartLine = -1;
  let currentListIndex = 0;
  let consecutiveNonListLines = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const listItemMatch = lines[lineIndex].match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (listItemMatch) {
      const currentNumber = Number.parseInt(listItemMatch[2], 10);

      if (segmentStartLine === -1) {
        segmentStartLine = lineIndex;
      } else if (currentNumber === 1) {
        listSegments.push({
          startLine: segmentStartLine,
          endLine: lineIndex - 1,
          listIndex: currentListIndex,
        });
        currentListIndex++;
        segmentStartLine = lineIndex;
      }

      consecutiveNonListLines = 0;
      continue;
    }

    if (segmentStartLine === -1) {
      continue;
    }

    consecutiveNonListLines++;

    if (consecutiveNonListLines >= 2 && lines[lineIndex].trim() !== '') {
      listSegments.push({
        startLine: segmentStartLine,
        endLine: lineIndex - consecutiveNonListLines,
        listIndex: currentListIndex,
      });
      currentListIndex++;
      segmentStartLine = -1;
    }
  }

  if (segmentStartLine !== -1) {
    listSegments.push({
      startLine: segmentStartLine,
      endLine: lines.length - 1,
      listIndex: currentListIndex,
    });
  }

  listSegments.forEach(({ startLine, endLine, listIndex }) => {
    const actualStart = listStarts[listIndex] || 1;

    if (actualStart <= 1) {
      return;
    }

    let currentNumber = actualStart;
    for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
      const listItemMatch = result[lineIndex].match(/^(\s*)(\d+)\.\s+(.*)$/);

      if (listItemMatch) {
        const [, indent, , content] = listItemMatch;
        result[lineIndex] = `${indent}${currentNumber}. ${content}`;
        currentNumber++;
      }
    }
  });

  return result.join('\n');
}
