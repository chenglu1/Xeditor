import React from 'react';

import { ArrowLeftIcon } from '../tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '../tiptap-icons/highlighter-icon';
import { LinkIcon } from '../tiptap-icons/link-icon';
import { BlockquoteButton } from '../tiptap-ui/blockquote-button';
import { CodeBlockButton } from '../tiptap-ui/code-block-button';
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from '../tiptap-ui/color-highlight-popover';
import { HeadingDropdownMenu } from '../tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '../tiptap-ui/image-upload-button';
import {
  LinkPopover,
  LinkButton,
  LinkContent,
} from '../tiptap-ui/link-popover';
import { ListDropdownMenu } from '../tiptap-ui/list-dropdown-menu';
import { MarkButton } from '../tiptap-ui/mark-button';
import { TableDropdownMenu } from '../tiptap-ui/table-dropdown-menu';
import { TextAlignButton } from '../tiptap-ui/text-align-button';
import { UndoRedoButton } from '../tiptap-ui/undo-redo-button';
import { Button } from '../tiptap-ui-primitive/button';
import { Spacer } from '../tiptap-ui-primitive/spacer';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '../tiptap-ui-primitive/toolbar';

export interface MainToolbarContentProps {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}

export const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: MainToolbarContentProps) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={['bulletList', 'orderedList', 'taskList']} />
        <BlockquoteButton />
        <CodeBlockButton />
        <TableDropdownMenu />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />
    </>
  );
};

export interface MobileToolbarContentProps {
  type: 'highlighter' | 'link';
  onBack: () => void;
}

export const MobileToolbarContent = ({
  type,
  onBack,
}: MobileToolbarContentProps) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);
