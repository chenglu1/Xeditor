import type { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';
import { isMarkInSchema, sanitizeUrl } from '../../../lib/tiptap-utils';
import { LinkIcon } from '../../tiptap-icons/link-icon';

export interface UseLinkPopoverConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onSetLink?: () => void;
}

export interface LinkHandlerProps {
  editor: Editor | null;
  editorState?: Editor['state'];
  onSetLink?: () => void;
}

export function canSetLink(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) {
    return false;
  }

  return editor.can().setMark('link');
}

export function isLinkActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) {
    return false;
  }

  return editor.isActive('link');
}

export function shouldShowLinkButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;
  const linkInSchema = isMarkInSchema('link', editor);

  if (!linkInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable) {
    return editor.isEditable && !editor.isActive('code') && canSetLink(editor);
  }

  return true;
}

export function useLinkHandler(props: LinkHandlerProps) {
  const { editor, editorState, onSetLink } = props;
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const { href } = editor.getAttributes('link');
    const nextUrl = isLinkActive(editor) ? href || '' : '';

    setUrl((currentUrl) => (currentUrl === nextUrl ? currentUrl : nextUrl));
  }, [editor, editorState]);

  const setLink = useCallback(() => {
    if (!url || !editor) {
      return;
    }

    const { selection } = editor.state;
    const isEmpty = selection.empty;
    let chain = editor.chain().focus();

    chain = chain.extendMarkRange('link').setLink({ href: url });

    if (isEmpty) {
      chain = chain.insertContent({ type: 'text', text: url });
    }

    chain.run();

    setUrl(null);
    onSetLink?.();
  }, [editor, onSetLink, url]);

  const removeLink = useCallback(() => {
    if (!editor) {
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .setMeta('preventAutolink', true)
      .run();
    setUrl('');
  }, [editor]);

  const openLink = useCallback(
    (target: string = '_blank', features: string = 'noopener,noreferrer') => {
      if (!url) {
        return;
      }

      const safeUrl = sanitizeUrl(url, window.location.href);
      if (safeUrl !== '#') {
        window.open(safeUrl, target, features);
      }
    },
    [url],
  );

  return {
    url: url || '',
    setUrl,
    setLink,
    removeLink,
    openLink,
  };
}

export function useLinkState(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}) {
  const { editor, hideWhenUnavailable = false } = props;
  const canSet = canSetLink(editor);
  const isActive = isLinkActive(editor);
  const isVisible = shouldShowLinkButton({
    editor,
    hideWhenUnavailable,
  });

  return {
    isVisible,
    canSet,
    isActive,
  };
}

export function useLinkPopover(config?: UseLinkPopoverConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onSetLink,
  } = config || {};
  const { editor, editorState } = useTiptapEditor(providedEditor);

  const { isVisible, canSet, isActive } = useLinkState({
    editor,
    hideWhenUnavailable,
  });
  const linkHandler = useLinkHandler({
    editor,
    editorState,
    onSetLink,
  });

  return {
    isVisible,
    canSet,
    isActive,
    label: 'Link',
    Icon: LinkIcon,
    ...linkHandler,
  };
}
