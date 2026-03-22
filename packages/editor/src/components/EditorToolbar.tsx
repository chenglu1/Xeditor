import React from 'react';

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
  additionalContent?: React.ReactNode;
}

function renderBuiltInToolbarItem(item: ToolbarItem) {
  if (typeof item !== 'string') {
    return null;
  }

  switch (item) {
    case 'undo':
      return <UndoRedoButton action="undo" />;
    case 'redo':
      return <UndoRedoButton action="redo" />;
    case 'heading':
      return <HeadingDropdownMenu levels={[1, 2, 3, 4]} />;
    case 'list':
      return (
        <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} />
      );
    case 'blockquote':
      return <BlockquoteButton />;
    case 'codeBlock':
      return <CodeBlockButton />;
    case 'table':
      return <TableDropdownMenu />;
    case 'bold':
      return <MarkButton type="bold" />;
    case 'italic':
      return <MarkButton type="italic" />;
    case 'strike':
      return <MarkButton type="strike" />;
    case 'code':
      return <MarkButton type="code" />;
    case 'underline':
      return <MarkButton type="underline" />;
    case 'highlight':
      return <ColorHighlightPopover />;
    case 'link':
      return <LinkPopover />;
    case 'superscript':
      return <MarkButton type="superscript" />;
    case 'subscript':
      return <MarkButton type="subscript" />;
    case 'alignLeft':
      return <TextAlignButton align="left" />;
    case 'alignCenter':
      return <TextAlignButton align="center" />;
    case 'alignRight':
      return <TextAlignButton align="right" />;
    case 'alignJustify':
      return <TextAlignButton align="justify" />;
    case 'image':
      return <ImageUploadButton text="Add" />;
    default:
      return null;
  }
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  config,
  isMobile,
  additionalContent,
}) => {
  const { toolbarSchema, renderToolbarItem, supportedToolbarButtons } = config;

  return (
    <Toolbar>
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

              const builtInElement = renderBuiltInToolbarItem(item);
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
