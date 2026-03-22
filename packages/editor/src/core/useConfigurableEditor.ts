import { useEditor } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { createEditorExtensions } from '../extensions/createEditorExtensions';
import { useIsMobile } from '../hooks/use-mobile';
import { MAX_FILE_SIZE } from '../lib/tiptap-utils';
import type {
  ConfigurableTiptapEditorProps,
  EditorErrorEvent,
  EditorMessages,
  EditorUpdateEvent,
  EditorValue,
  EditorValueType,
  ToolbarConfig,
} from '../types';
import { createEditorLogger } from './createEditorLogger';
import { createEditorMessages } from './createEditorMessages';
import { createImageUploadHandler } from './createImageUploadHandler';
import { createToolbarConfig } from './createToolbarConfig';
import {
  areEditorValuesEqual,
  createEmptyEditorValue,
  createSetContentOptions,
  getEditorCharacterCount,
  getEditorWordCount,
  getSerializedEditorContent,
  resolveEditorValueType,
  syncExternalValue,
} from './editor-content';

interface UseConfigurableEditorResult {
  activeMode: 'richtext' | 'markdown';
  editor: ReturnType<typeof useEditor>;
  isDualViewEnabled: boolean;
  isMobile: boolean;
  messages: EditorMessages;
  markdownValue: string;
  toolbarConfig: ToolbarConfig;
  valueType: EditorValueType;
  onMarkdownChange: (nextValue: string) => void;
  onSwitchToMarkdown: () => void;
  onSwitchToRichtext: () => void;
}

function toLegacyContentType(valueType: EditorValueType): 'markdown' | 'html' {
  return valueType === 'html' ? 'html' : 'markdown';
}

export function useConfigurableEditor({
  value,
  defaultValue,
  valueType,
  contentType,
  placeholder,
  readOnly = false,
  disabled = false,
  toolbarButtons,
  supportedToolbarButtons,
  toolbarSchema,
  renderToolbarItem,
  dualView = false,
  uploadHandler,
  uploadUrl,
  maxFileSize = MAX_FILE_SIZE,
  maxLength,
  mediaUpload,
  messages,
  logger,
  presets,
  extensions,
  extensionComposition,
  disableBuiltIns,
  markdownDialect,
  editorRef,
  onUpdate,
  onError,
  onChange,
}: ConfigurableTiptapEditorProps): UseConfigurableEditorResult {
  const isMobile = useIsMobile();
  const resolvedValueType = resolveEditorValueType(valueType, contentType);
  const resolvedMessages = createEditorMessages(messages);
  const resolvedPlaceholder = placeholder ?? resolvedMessages.placeholder;
  const resolvedLogger = useMemo(() => createEditorLogger(logger), [logger]);
  const isControlled = value !== undefined;
  const hasWarnedInvalidDualViewRef = useRef(false);
  const isComposingRef = useRef(false);
  const initialValueRef = useRef<EditorValue>(
    value ?? defaultValue ?? createEmptyEditorValue(resolvedValueType),
  );
  const lastSyncedExternalValueRef = useRef<EditorValue>(initialValueRef.current);
  const [activeMode, setActiveMode] = useState<'richtext' | 'markdown'>(
    'richtext',
  );
  const [markdownValue, setMarkdownValue] = useState(
    resolvedValueType === 'markdown' && typeof initialValueRef.current === 'string'
      ? initialValueRef.current
      : '',
  );

  const reportError = (event: EditorErrorEvent) => {
    onError?.(event);
    resolvedLogger.error(`Editor ${event.phase} error.`, {
      phase: event.phase,
      error: event.error,
      recoverable: event.recoverable,
    });
  };

  const emitUpdateEvent = (
    editorInstance: NonNullable<ReturnType<typeof useEditor>>,
    source: EditorUpdateEvent['source'],
    explicitValueType: EditorValueType = resolvedValueType,
  ) => {
    try {
      const nextValue = getSerializedEditorContent(
        editorInstance,
        explicitValueType,
      );
      const characterCount = getEditorCharacterCount(editorInstance);
      const wordCount = getEditorWordCount(editorInstance);

      onUpdate?.({
        value: nextValue,
        valueType: explicitValueType,
        characterCount,
        wordCount,
        source,
      });

      if (onChange && typeof nextValue === 'string') {
        onChange(
          nextValue,
          toLegacyContentType(explicitValueType),
          characterCount,
        );
      }

      return nextValue;
    } catch (error) {
      reportError({
        phase: 'serialize',
        error:
          error instanceof Error
            ? error
            : new Error('Failed to serialize content'),
        recoverable: true,
      });
      return null;
    }
  };

  const isDualViewEnabled = dualView && resolvedValueType === 'markdown';
  const imageUploadHandler = createImageUploadHandler({
    uploadHandler,
    uploadUrl,
    maxFileSize,
    mediaUpload,
  });

  const toolbarConfig = createToolbarConfig({
    toolbarButtons,
    supportedToolbarButtons,
    toolbarSchema,
    renderToolbarItem,
    includeImageButton: !!imageUploadHandler,
  });

  const editor = useEditor({
    extensions: createEditorExtensions({
      placeholder: resolvedPlaceholder,
      maxFileSize,
      maxLength,
      imageUploadHandler,
      messages: resolvedMessages,
      logger: resolvedLogger,
      onUploadError: (error) =>
        reportError({
          phase: 'upload',
          error,
          recoverable: true,
        }),
      presets,
      extensions,
      extensionComposition,
      disableBuiltIns,
      markdownDialect,
    }),
    content: initialValueRef.current as any,
    contentType: resolvedValueType === 'markdown' ? 'markdown' : undefined,
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
      handleTextInput: (view, from, to, text) => {
        if (isComposingRef.current) {
          return false;
        }

        if (!maxLength) {
          return false;
        }

        const currentCount = view.state.doc.textContent.length;
        const selectedLength = to - from;
        const newLength = currentCount - selectedLength + text.length;

        return newLength > maxLength;
      },
      handleDOMEvents: {
        compositionstart: () => {
          isComposingRef.current = true;
          return false;
        },
        compositionend: () => {
          isComposingRef.current = false;
          return false;
        },
      },
      handlePaste: (view, event) => {
        if (!maxLength) {
          return false;
        }

        const text = event.clipboardData?.getData('text/plain') || '';
        const { selection } = view.state;
        const currentCount = view.state.doc.textContent.length;
        const selectedLength = selection.$to.pos - selection.$from.pos;
        const remaining = maxLength - (currentCount - selectedLength);

        if (remaining <= 0) {
          return true;
        }

        if (text.length > remaining) {
          const truncatedText = text.slice(0, remaining);
          const { tr } = view.state;
          view.dispatch(
            tr.insertText(truncatedText, selection.from, selection.to),
          );
          return true;
        }

        return false;
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    editable: !(readOnly || disabled),
    onCreate: ({ editor: currentEditor }) => {
      if (resolvedValueType === 'markdown') {
        const nextMarkdownValue = currentEditor.getMarkdown();
        setMarkdownValue((currentValue) =>
          currentValue === nextMarkdownValue ? currentValue : nextMarkdownValue,
        );
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (isDualViewEnabled) {
        const nextMarkdownValue = currentEditor.getMarkdown();
        setMarkdownValue((currentValue) =>
          currentValue === nextMarkdownValue ? currentValue : nextMarkdownValue,
        );
      }

      const nextValue = emitUpdateEvent(currentEditor, 'user');
      if (nextValue !== null) {
        lastSyncedExternalValueRef.current = nextValue;
      }
    },
  });

  useEffect(() => {
    if (typeof editorRef === 'function') {
      editorRef(editor);
      return () => editorRef(null);
    }

    if (editorRef && 'current' in editorRef) {
      const mutableEditorRef = editorRef as {
        current: ReturnType<typeof useEditor> | null;
      };
      mutableEditorRef.current = editor;
      return () => {
        mutableEditorRef.current = null;
      };
    }

    return undefined;
  }, [editor, editorRef]);

  useEffect(() => {
    if (!editor || !isControlled) {
      return;
    }

    const didSync = syncExternalValue(editor, value, resolvedValueType);

    if (didSync) {
      lastSyncedExternalValueRef.current =
        value ?? createEmptyEditorValue(resolvedValueType);

      if (resolvedValueType === 'markdown') {
        const nextMarkdownValue =
          typeof value === 'string' ? value : editor.getMarkdown();

        setMarkdownValue((currentValue) =>
          currentValue === nextMarkdownValue ? currentValue : nextMarkdownValue,
        );
      }

      emitUpdateEvent(editor, 'external-sync');
      return;
    }

    if (
      resolvedValueType === 'markdown' &&
      typeof value === 'string' &&
      !areEditorValuesEqual(value, lastSyncedExternalValueRef.current)
    ) {
      setMarkdownValue((currentValue) =>
        currentValue === value ? currentValue : value,
      );
      lastSyncedExternalValueRef.current = value;
    }
  }, [editor, isControlled, resolvedValueType, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!(readOnly || disabled));
  }, [disabled, editor, readOnly]);

  useEffect(() => {
    if (
      dualView &&
      resolvedValueType !== 'markdown' &&
      !hasWarnedInvalidDualViewRef.current
    ) {
      hasWarnedInvalidDualViewRef.current = true;
      resolvedLogger.warn(
        'ConfigurableTiptapEditor: dualView only supports markdown content. Falling back to single-view mode.',
        {
          phase: 'mode-switch',
          dualView,
          valueType: resolvedValueType,
        },
      );
    }
  }, [dualView, resolvedLogger, resolvedValueType]);

  useEffect(() => {
    if (!isDualViewEnabled && activeMode !== 'richtext') {
      setActiveMode('richtext');
    }
  }, [activeMode, isDualViewEnabled]);

  const onSwitchToMarkdown = () => {
    if (editor) {
      const nextMarkdownValue = editor.getMarkdown();
      setMarkdownValue((currentValue) =>
        currentValue === nextMarkdownValue ? currentValue : nextMarkdownValue,
      );
    }

    setActiveMode('markdown');

    if (editor) {
      emitUpdateEvent(editor, 'mode-switch', 'markdown');
    }
  };

  const onSwitchToRichtext = () => {
    if (editor) {
      try {
        editor.commands.setContent(
          markdownValue,
          createSetContentOptions('markdown', false) as any,
        );
      } catch (error) {
        reportError({
          phase: 'mode-switch',
          error:
            error instanceof Error
              ? error
              : new Error('Failed to switch back to rich text mode'),
          recoverable: true,
        });
      }
    }

    setActiveMode('richtext');

    if (editor) {
      emitUpdateEvent(editor, 'mode-switch', 'markdown');
    }
  };

  const onMarkdownChange = (nextValue: string) => {
    setMarkdownValue(nextValue);

    try {
      editor?.commands.setContent(
        nextValue,
        createSetContentOptions('markdown', true) as any,
      );
    } catch (error) {
      reportError({
        phase: 'parse',
        error:
          error instanceof Error ? error : new Error('Failed to parse markdown'),
        recoverable: true,
      });
    }
  };

  return {
    activeMode,
    editor,
    isDualViewEnabled,
    isMobile,
    messages: resolvedMessages,
    markdownValue,
    toolbarConfig,
    valueType: resolvedValueType,
    onMarkdownChange,
    onSwitchToMarkdown,
    onSwitchToRichtext,
  };
}
