import React from 'react';

import type { ToolbarConfig } from '../types';
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

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  config,
  isMobile,
  additionalContent,
}) => {
  const {
    showUndoRedo,
    showStructure,
    showFormatting,
    showScript,
    showAlign,
    showImage,
    shouldShowButton,
  } = config;

  return (
    <Toolbar>
      {/* 撤销重做 */}
      {showUndoRedo && (
        <>
          <ToolbarGroup>
            {shouldShowButton('undo') && <UndoRedoButton action="undo" />}
            {shouldShowButton('redo') && <UndoRedoButton action="redo" />}
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {/* 结构化元素 */}
      {showStructure && (
        <>
          <ToolbarGroup>
            {shouldShowButton('heading') && (
              <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
            )}
            {shouldShowButton('list') && (
              <ListDropdownMenu
                types={['bulletList', 'orderedList', 'taskList']}
              />
            )}
            {shouldShowButton('blockquote') && <BlockquoteButton />}
            {shouldShowButton('codeBlock') && <CodeBlockButton />}
            {shouldShowButton('table') && <TableDropdownMenu />}
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {/* 文本格式化 */}
      {showFormatting && (
        <>
          <ToolbarGroup>
            {shouldShowButton('bold') && <MarkButton type="bold" />}
            {shouldShowButton('italic') && <MarkButton type="italic" />}
            {shouldShowButton('strike') && <MarkButton type="strike" />}
            {shouldShowButton('code') && <MarkButton type="code" />}
            {shouldShowButton('underline') && <MarkButton type="underline" />}
            {shouldShowButton('highlight') && <ColorHighlightPopover />}
            {shouldShowButton('link') && <LinkPopover />}
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {/* 上标下标 */}
      {showScript && (
        <>
          <ToolbarGroup>
            {shouldShowButton('superscript') && (
              <MarkButton type="superscript" />
            )}
            {shouldShowButton('subscript') && <MarkButton type="subscript" />}
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {/* 对齐 */}
      {showAlign && (
        <>
          <ToolbarGroup>
            {shouldShowButton('alignLeft') && <TextAlignButton align="left" />}
            {shouldShowButton('alignCenter') && (
              <TextAlignButton align="center" />
            )}
            {shouldShowButton('alignRight') && (
              <TextAlignButton align="right" />
            )}
            {shouldShowButton('alignJustify') && (
              <TextAlignButton align="justify" />
            )}
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      {/* 图片 */}
      {showImage && (
        <>
          <ToolbarGroup>
            <ImageUploadButton text="Add" />
          </ToolbarGroup>
        </>
      )}

      {/* 额外内容（如模式切换按钮） */}
      {additionalContent}
    </Toolbar>
  );
};
