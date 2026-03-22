import type { JSONContent } from '@tiptap/core';
import { generateHTML, generateJSON } from '@tiptap/core';
import { MarkdownManager } from '@tiptap/markdown';
import React, { useEffect, useMemo, useRef } from 'react';

import { createEditorLogger } from '../core/createEditorLogger';
import { createEditorMessages } from '../core/createEditorMessages';
import { resolveEditorValueType } from '../core/editor-content';
import { createEditorExtensions } from '../extensions/createEditorExtensions';
import {
  convertMarkdownTextAlignToHtml,
  normalizeListIndentation,
  preprocessHtmlTables,
  preprocessTableSpaces,
} from '../adapters/markdownAdapter';
import type {
  ConfigurableTiptapEditorProps,
  EditorErrorEvent,
  EditorValue,
  EditorValueType,
} from '../types';
import { EditorFrame } from './EditorFrame';
import { EditorPane } from './EditorPane';

function preprocessMarkdownForStaticViewer(
  markdown: string,
  options?: ConfigurableTiptapEditorProps['markdownDialect'],
) {
  let nextMarkdown = markdown;

  if (options?.textAlignSyntax !== 'disabled') {
    nextMarkdown = convertMarkdownTextAlignToHtml(nextMarkdown);
  }

  if (options?.normalizeTables !== false) {
    nextMarkdown = preprocessHtmlTables(nextMarkdown);
    nextMarkdown = preprocessTableSpaces(nextMarkdown);
  }

  if (options?.normalizeListIndentation !== false) {
    nextMarkdown = normalizeListIndentation(nextMarkdown);
  }

  return nextMarkdown;
}

function serializeValueToStaticHtml(options: {
  value: EditorValue;
  valueType: EditorValueType;
  editorProps: ConfigurableTiptapEditorProps;
}) {
  const { value, valueType, editorProps } = options;
  const extensions = createEditorExtensions({
    placeholder: editorProps.placeholder,
    maxFileSize: editorProps.maxFileSize,
    maxLength: editorProps.maxLength,
    imageUploadHandler: null,
    messages: createEditorMessages(editorProps.messages),
    logger: editorProps.logger
      ? createEditorLogger(editorProps.logger)
      : undefined,
    presets: editorProps.presets,
    extensions: editorProps.extensions,
    extensionComposition: editorProps.extensionComposition,
    disableBuiltIns: editorProps.disableBuiltIns,
    markdownDialect: editorProps.markdownDialect,
  });

  if (valueType === 'json') {
    return generateHTML(value as JSONContent, extensions);
  }

  if (valueType === 'html') {
    const doc = generateJSON(String(value || ''), extensions);
    return generateHTML(doc, extensions);
  }

  const markdownManager = new MarkdownManager({
    extensions,
  });
  const markdown = preprocessMarkdownForStaticViewer(
    String(value || ''),
    editorProps.markdownDialect,
  );
  const doc = markdownManager.parse(markdown) as JSONContent;
  return generateHTML(doc, extensions);
}

interface StaticContentViewerProps extends ConfigurableTiptapEditorProps {
  value?: EditorValue;
  className?: string;
  compact?: boolean;
  minHeight?: string;
  onError?: (event: EditorErrorEvent) => void;
}

export const StaticContentViewer: React.FC<StaticContentViewerProps> = ({
  value,
  defaultValue,
  valueType,
  contentType,
  className = '',
  compact = false,
  minHeight = '300px',
  onError,
  sanitizeHtml,
  logger,
  ...editorProps
}) => {
  const resolvedValueType = resolveEditorValueType(valueType, contentType);
  const resolvedValue = value ?? defaultValue;
  const resolvedLogger = useMemo(() => createEditorLogger(logger), [logger]);
  const hasWarnedAboutUnsafeHtmlRef = useRef(false);

  useEffect(() => {
    if (
      resolvedValueType === 'html' &&
      !sanitizeHtml &&
      !hasWarnedAboutUnsafeHtmlRef.current
    ) {
      hasWarnedAboutUnsafeHtmlRef.current = true;
      resolvedLogger.warn(
        'StaticContentViewer received valueType="html" without sanitizeHtml. The host must provide trusted or pre-sanitized HTML.',
        {
          phase: 'viewer',
          valueType: resolvedValueType,
        },
      );
    }
  }, [resolvedLogger, resolvedValueType, sanitizeHtml]);

  const { html, fallbackText } = useMemo(() => {
    try {
      const nextValue = resolvedValue ?? (resolvedValueType === 'json'
        ? ({ type: 'doc', content: [] } as JSONContent)
        : '');

      const nextHtml = serializeValueToStaticHtml({
        value: nextValue,
        valueType: resolvedValueType,
        editorProps: {
          ...editorProps,
          value: nextValue,
          valueType: resolvedValueType,
          logger,
        },
      });

      return {
        html: sanitizeHtml
          ? sanitizeHtml(nextHtml, {
              source: 'static-viewer',
              valueType: resolvedValueType,
              value: nextValue,
            })
          : nextHtml,
        fallbackText: '',
      };
    } catch (error) {
      onError?.({
        phase: 'viewer',
        error:
          error instanceof Error
            ? error
            : new Error('Failed to render static viewer content'),
        recoverable: true,
      });

      if (resolvedValueType === 'json') {
        return {
          html: '',
          fallbackText: JSON.stringify(resolvedValue ?? {}, null, 2),
        };
      }

      return {
        html: '',
        fallbackText: String(resolvedValue ?? ''),
      };
    }
  }, [
    contentType,
    defaultValue,
    editorProps,
    logger,
    onError,
    resolvedValue,
    resolvedValueType,
    sanitizeHtml,
    value,
    valueType,
  ]);

  return (
    <EditorFrame className={className} compact={compact}>
      <EditorPane
        compact={compact}
        minHeight={minHeight}
        paneClassName="editor-wrapper"
        bodyStyle={{
          padding: compact ? '0' : '12px',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {html ? (
          <div
            className={`tiptap ${compact ? 'compact-mode' : ''}`.trim()}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre
            className={`tiptap ${compact ? 'compact-mode' : ''}`.trim()}
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {fallbackText}
          </pre>
        )}
      </EditorPane>
    </EditorFrame>
  );
};
