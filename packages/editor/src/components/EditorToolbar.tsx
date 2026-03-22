import React from 'react';

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
  config: ToolbarConfig;
  isMobile: boolean;
  disabled?: boolean;
  additionalContent?: React.ReactNode;
}

function renderBuiltInToolbarItem(
  item: ToolbarItem,
  disabled: boolean,
) {
  if (typeof item !== 'string') {
    return null;
  }

  switch (item) {
    case 'undo':
      return <UndoRedoButton action="undo" disabled={disabled} />;
    case 'redo':
      return <UndoRedoButton action="redo" disabled={disabled} />;
    case 'heading':
      return (
        <HeadingDropdownMenu levels={[1, 2, 3, 4, 5, 6]} disabled={disabled} />
      );
    case 'list':
      return (
        <ListDropdownMenu
          types={['bulletList', 'orderedList', 'taskList']}
          disabled={disabled}
        />
      );
    case 'blockquote':
      return <BlockquoteButton disabled={disabled} />;
    case 'codeBlock':
      return <CodeBlockButton disabled={disabled} />;
    case 'table':
      return <TableDropdownMenu disabled={disabled} />;
    case 'bold':
      return <MarkButton type="bold" disabled={disabled} />;
    case 'italic':
      return <MarkButton type="italic" disabled={disabled} />;
    case 'strike':
      return <MarkButton type="strike" disabled={disabled} />;
    case 'code':
      return <MarkButton type="code" disabled={disabled} />;
    case 'underline':
      return <MarkButton type="underline" disabled={disabled} />;
    case 'highlight':
      return <ColorHighlightPopover disabled={disabled} />;
    case 'link':
      return <LinkPopover disabled={disabled} />;
    case 'superscript':
      return <MarkButton type="superscript" disabled={disabled} />;
    case 'subscript':
      return <MarkButton type="subscript" disabled={disabled} />;
    case 'alignLeft':
      return <TextAlignButton align="left" disabled={disabled} />;
    case 'alignCenter':
      return <TextAlignButton align="center" disabled={disabled} />;
    case 'alignRight':
      return <TextAlignButton align="right" disabled={disabled} />;
    case 'alignJustify':
      return <TextAlignButton align="justify" disabled={disabled} />;
    case 'image':
      return <ImageUploadButton disabled={disabled} />;
    default:
      return null;
  }
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
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
