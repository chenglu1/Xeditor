import type { JSONContent } from '@tiptap/core';
import { generateHTML, generateJSON } from '@tiptap/core';
import { MarkdownManager } from '@tiptap/markdown';
import React, { useEffect, useMemo, useRef } from 'react';

import { createEditorLogger } from '../core/createEditorLogger';
import { createEditorMessages } from '../core/createEditorMessages';
import { resolveEditorValueType } from '../core/editor-content';
import {
  createEditorExtensions,
  type CreateEditorExtensionsOptions,
} from '../extensions/createEditorExtensions';
import {
  preprocessMarkdownForDialect,
} from '../adapters/markdownAdapter';
import type {
  ConfigurableTiptapEditorProps,
  EditorErrorEvent,
  EditorValue,
  EditorValueType,
} from '../types';
import { EditorFrame } from './EditorFrame';
import { EditorPane } from './EditorPane';

function createStaticHtmlSerializer(
  extensionOptions: CreateEditorExtensionsOptions,
) {
  const extensions = createEditorExtensions({
    ...extensionOptions,
    imageUploadHandler: null,
  });
  let markdownManager: MarkdownManager | null = null;

  const getMarkdownManager = () => {
    if (!markdownManager) {
      markdownManager = new MarkdownManager({
        extensions,
      });
    }

    return markdownManager;
  };

  return (value: EditorValue, valueType: EditorValueType) => {
    if (valueType === 'json') {
      return generateHTML(value as JSONContent, extensions);
    }

    if (valueType === 'html') {
      const doc = generateJSON(String(value || ''), extensions);
      return generateHTML(doc, extensions);
    }

    const markdown = preprocessMarkdownForDialect(
      String(value || ''),
      extensionOptions.markdownDialect,
    );
    const doc = getMarkdownManager().parse(markdown) as JSONContent;
    return generateHTML(doc, extensions);
  };
}

export interface StaticContentViewerProps
  extends ConfigurableTiptapEditorProps {
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
  placeholder,
  maxFileSize,
  maxLength,
  messages,
  presets,
  extensions,
  extensionComposition,
  disableBuiltIns,
  markdownDialect,
  mathOptions,
}) => {
  const resolvedValueType = resolveEditorValueType(valueType, contentType);
  const resolvedValue = value ?? defaultValue;
  const resolvedLogger = useMemo(() => createEditorLogger(logger), [logger]);
  const resolvedMessages = useMemo(
    () => createEditorMessages(messages),
    [messages],
  );
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

  const staticHtmlSerializer = useMemo(
    () =>
      createStaticHtmlSerializer({
        placeholder,
        maxFileSize,
        maxLength,
        messages: resolvedMessages,
        presets,
        extensions,
        extensionComposition,
        disableBuiltIns,
        markdownDialect,
        mathOptions,
        logger: resolvedLogger,
      }),
    [
      disableBuiltIns,
      extensionComposition,
      extensions,
      mathOptions,
      markdownDialect,
      maxFileSize,
      maxLength,
      placeholder,
      presets,
      resolvedLogger,
      resolvedMessages,
    ],
  );

  const { html, fallbackText } = useMemo(() => {
    try {
      const nextValue = resolvedValue ?? (resolvedValueType === 'json'
        ? ({ type: 'doc', content: [] } as JSONContent)
        : '');

      const nextHtml = staticHtmlSerializer(nextValue, resolvedValueType);

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
    onError,
    resolvedValue,
    resolvedValueType,
    sanitizeHtml,
    staticHtmlSerializer,
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
