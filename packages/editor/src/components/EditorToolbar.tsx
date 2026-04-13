import React from 'react';
import type { Editor } from '@tiptap/react';

import { useEditorMessages } from '../core/editor-messages-context';
import type { ToolbarConfig, ToolbarItem } from '../types';
import { BlockquoteButton } from './tiptap-ui/blockquote-button';
import { CodeBlockButton } from './tiptap-ui/code-block-button';
import { ColorHighlightPopover } from './tiptap-ui/color-highlight-popover';
import { HeadingDropdownMenu } from './tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from './tiptap-ui/image-upload-button';
import { LinkPopover } from './tiptap-ui/link-popover';
import { ListDropdownMenu } from './tiptap-ui/list-dropdown-menu';
import { MarkButton } from './tiptap-ui/mark-button';
import { TableDropdownMenu } from './tiptap-ui/table-dropdown-menu';
import { TextAlignButton } from './tiptap-ui/text-align-button';
import { UndoRedoButton } from './tiptap-ui/undo-redo-button';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from './tiptap-ui-primitive/toolbar';

interface EditorToolbarProps {
  editor?: Editor | null;
  config: ToolbarConfig;
  isMobile: boolean;
  disabled?: boolean;
  additionalContent?: React.ReactNode;
}

function renderBuiltInToolbarItem(
  item: ToolbarItem,
  disabled: boolean,
  editor: Editor | null,
) {
  if (typeof item !== 'string') {
    return null;
  }

  switch (item) {
    case 'undo':
      return <UndoRedoButton editor={editor ?? undefined} action="undo" disabled={disabled} />;
    case 'redo':
      return <UndoRedoButton editor={editor ?? undefined} action="redo" disabled={disabled} />;
    case 'heading':
      return (
        <HeadingDropdownMenu
          editor={editor ?? undefined}
          levels={[1, 2, 3, 4, 5, 6]}
          disabled={disabled}
        />
      );
    case 'list':
      return (
        <ListDropdownMenu
          editor={editor ?? undefined}
          types={['bulletList', 'orderedList', 'taskList']}
          disabled={disabled}
        />
      );
    case 'blockquote':
      return <BlockquoteButton editor={editor ?? undefined} disabled={disabled} />;
    case 'codeBlock':
      return <CodeBlockButton editor={editor ?? undefined} disabled={disabled} />;
    case 'table':
      return <TableDropdownMenu editor={editor ?? undefined} disabled={disabled} />;
    case 'bold':
      return <MarkButton editor={editor ?? undefined} type="bold" disabled={disabled} />;
    case 'italic':
      return <MarkButton editor={editor ?? undefined} type="italic" disabled={disabled} />;
    case 'strike':
      return <MarkButton editor={editor ?? undefined} type="strike" disabled={disabled} />;
    case 'code':
      return <MarkButton editor={editor ?? undefined} type="code" disabled={disabled} />;
    case 'underline':
      return <MarkButton editor={editor ?? undefined} type="underline" disabled={disabled} />;
    case 'highlight':
      return <ColorHighlightPopover editor={editor ?? undefined} disabled={disabled} />;
    case 'link':
      return <LinkPopover editor={editor ?? undefined} disabled={disabled} />;
    case 'superscript':
      return <MarkButton editor={editor ?? undefined} type="superscript" disabled={disabled} />;
    case 'subscript':
      return <MarkButton editor={editor ?? undefined} type="subscript" disabled={disabled} />;
    case 'alignLeft':
      return <TextAlignButton editor={editor ?? undefined} align="left" disabled={disabled} />;
    case 'alignCenter':
      return <TextAlignButton editor={editor ?? undefined} align="center" disabled={disabled} />;
    case 'alignRight':
      return <TextAlignButton editor={editor ?? undefined} align="right" disabled={disabled} />;
    case 'alignJustify':
      return <TextAlignButton editor={editor ?? undefined} align="justify" disabled={disabled} />;
    case 'image':
      return <ImageUploadButton editor={editor ?? undefined} disabled={disabled} />;
    default:
      return null;
  }
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor = null,
  config,
  isMobile,
  disabled = false,
  additionalContent,
}) => {
  const { toolbarSchema, renderToolbarItem, supportedToolbarButtons } = config;
  const messages = useEditorMessages();

  return (
    <Toolbar aria-label={messages.toolbarRegionLabel}>
      {toolbarSchema.map((group, groupIndex) => (
        <React.Fragment key={`toolbar-group-${groupIndex}`}>
          <ToolbarGroup>
            {group.map((item) => {
              const customRendered = renderToolbarItem?.({
                item,
                isMobile,
                supportedToolbarButtons,
              });

              if (customRendered !== undefined && customRendered !== null) {
                return (
                  <React.Fragment
                    key={typeof item === 'string' ? item : item.id}
                  >
                    {customRendered}
                  </React.Fragment>
                );
              }

              const builtInElement = renderBuiltInToolbarItem(
                item,
                disabled,
                editor,
              );
              if (!builtInElement) {
                return null;
              }

              return (
                <React.Fragment
                  key={typeof item === 'string' ? item : item.id}
                >
                  {builtInElement}
                </React.Fragment>
              );
            })}
          </ToolbarGroup>
          {groupIndex < toolbarSchema.length - 1 && <ToolbarSeparator />}
        </React.Fragment>
      ))}
      {additionalContent}
    </Toolbar>
  );
};
