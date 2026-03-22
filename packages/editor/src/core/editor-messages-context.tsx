import React, { createContext, useContext } from 'react';

import {
  DEFAULT_EDITOR_MESSAGES,
  type EditorMessages,
  type ToolbarButton,
} from '../types';

const EditorMessagesContext = createContext<EditorMessages>(
  DEFAULT_EDITOR_MESSAGES,
);

export function EditorMessagesProvider(props: {
  children: React.ReactNode;
  messages: EditorMessages;
}) {
  return (
    <EditorMessagesContext.Provider value={props.messages}>
      {props.children}
    </EditorMessagesContext.Provider>
  );
}

export function useEditorMessages() {
  return useContext(EditorMessagesContext);
}

export function getToolbarButtonLabel(
  messages: EditorMessages,
  button: ToolbarButton,
) {
  switch (button) {
    case 'undo':
      return messages.toolbarUndo;
    case 'redo':
      return messages.toolbarRedo;
    case 'heading':
      return messages.toolbarHeading;
    case 'list':
      return messages.toolbarList;
    case 'blockquote':
      return messages.toolbarBlockquote;
    case 'codeBlock':
      return messages.toolbarCodeBlock;
    case 'table':
      return messages.toolbarInsertTable;
    case 'bold':
      return messages.toolbarBold;
    case 'italic':
      return messages.toolbarItalic;
    case 'strike':
      return messages.toolbarStrike;
    case 'code':
      return messages.toolbarCode;
    case 'underline':
      return messages.toolbarUnderline;
    case 'highlight':
      return messages.toolbarHighlight;
    case 'link':
      return messages.toolbarLink;
    case 'superscript':
      return messages.toolbarSuperscript;
    case 'subscript':
      return messages.toolbarSubscript;
    case 'alignLeft':
      return messages.toolbarAlignLeft;
    case 'alignCenter':
      return messages.toolbarAlignCenter;
    case 'alignRight':
      return messages.toolbarAlignRight;
    case 'alignJustify':
      return messages.toolbarAlignJustify;
    case 'image':
      return messages.toolbarAddImage;
    default:
      return button;
  }
}

export function getListTypeLabel(
  messages: EditorMessages,
  type: 'bulletList' | 'orderedList' | 'taskList',
) {
  switch (type) {
    case 'bulletList':
      return messages.toolbarBulletList;
    case 'orderedList':
      return messages.toolbarOrderedList;
    case 'taskList':
      return messages.toolbarTaskList;
    default:
      return type;
  }
}

export function getHeadingLevelLabel(
  messages: EditorMessages,
  level: number,
) {
  return messages.toolbarHeadingLevel({ level });
}

