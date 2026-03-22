'use client';

import type { Editor } from '@tiptap/react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { useEditorMessages } from '../../../core/editor-messages-context';
import { useElementRect } from '../../../hooks/use-element-rect';
import { useTiptapEditor } from '../../../hooks/use-tiptap-editor';
import { TrashIcon } from '../../tiptap-icons/trash-icon';
import { Button, ButtonGroup } from '../../tiptap-ui-primitive/button';
import { Card, CardBody } from '../../tiptap-ui-primitive/card';
import { Separator } from '../../tiptap-ui-primitive/separator';

export interface TableFloatingToolbarProps {
  editor?: Editor | null;
}

export const TableFloatingToolbar = forwardRef<
  HTMLDivElement,
  TableFloatingToolbarProps
>(({ editor: providedEditor }, ref) => {
  const { editor, editorState } = useTiptapEditor(providedEditor);
  const messages = useEditorMessages();
  const [isVisible, setIsVisible] = useState(false);
  const [cellElement, setCellElement] = useState<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const cellRect = useElementRect({ element: cellElement ?? undefined });

  const handleAddRowBefore = useCallback(() => {
    editor?.chain().focus().addRowBefore().run();
  }, [editor]);

  const handleAddRowAfter = useCallback(() => {
    editor?.chain().focus().addRowAfter().run();
  }, [editor]);

  const handleDeleteRow = useCallback(() => {
    editor?.chain().focus().deleteRow().run();
  }, [editor]);

  const handleAddColumnBefore = useCallback(() => {
    editor?.chain().focus().addColumnBefore().run();
  }, [editor]);

  const handleAddColumnAfter = useCallback(() => {
    editor?.chain().focus().addColumnAfter().run();
  }, [editor]);

  const handleDeleteColumn = useCallback(() => {
    editor?.chain().focus().deleteColumn().run();
  }, [editor]);

  const handleDeleteTable = useCallback(() => {
    editor?.chain().focus().deleteTable().run();
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      setIsVisible(false);
      setCellElement(null);
      return;
    }

    const inTable =
      editor.isActive('table') ||
      editor.isActive('tableCell') ||
      editor.isActive('tableRow');

    setIsVisible(inTable);

    if (!inTable) {
      setCellElement(null);
      return;
    }

    const currentPos = editor.view.state.selection.$anchor.pos;
    const domAtPos = editor.view.domAtPos(currentPos);
    const cell = (domAtPos.node as HTMLElement | null)?.closest(
      'td, th',
    ) as HTMLElement | null;

    setCellElement(cell);
  }, [editor, editorState]);

  if (!editor || !isVisible || !cellRect || !editor.isEditable) {
    return null;
  }

  const viewportWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1200;
  const toolbarWidth = 400;
  let left = cellRect.left + cellRect.width / 2 - toolbarWidth / 2;

  if (left < 8) {
    left = 8;
  } else if (left + toolbarWidth > viewportWidth - 8) {
    left = viewportWidth - toolbarWidth - 8;
  }

  const toolbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: cellRect.top - 48,
    left,
    zIndex: 'var(--xeditor-floating-z-index)',
  };

  return (
    <div
      ref={ref || toolbarRef}
      className="table-floating-toolbar"
      style={toolbarStyle}
      aria-label={messages.tableToolbarLabel}
    >
      <Card className="table-toolbar-card">
        <CardBody>
          <ButtonGroup orientation="horizontal">
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              aria-label={messages.tableAddRowBefore}
              tooltip={messages.tableAddRowBefore}
              onClick={handleAddRowBefore}
              className="table-action-btn"
            >
              <span className="tiptap-button-text">{messages.tableAddRowBefore}</span>
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              aria-label={messages.tableAddRowAfter}
              tooltip={messages.tableAddRowAfter}
              onClick={handleAddRowAfter}
              className="table-action-btn"
            >
              <span className="tiptap-button-text">{messages.tableAddRowAfter}</span>
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              aria-label={messages.tableDeleteRow}
              tooltip={messages.tableDeleteRow}
              onClick={handleDeleteRow}
              className="table-action-btn table-delete-btn"
            >
              <span className="tiptap-button-text">{messages.tableDeleteRow}</span>
            </Button>

            <Separator
              orientation="vertical"
              className="table-toolbar-separator"
            />

            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              aria-label={messages.tableAddColumnBefore}
              tooltip={messages.tableAddColumnBefore}
              onClick={handleAddColumnBefore}
              className="table-action-btn"
            >
              <span className="tiptap-button-text">
                {messages.tableAddColumnBefore}
              </span>
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              aria-label={messages.tableAddColumnAfter}
              tooltip={messages.tableAddColumnAfter}
              onClick={handleAddColumnAfter}
              className="table-action-btn"
            >
              <span className="tiptap-button-text">
                {messages.tableAddColumnAfter}
              </span>
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              aria-label={messages.tableDeleteColumn}
              tooltip={messages.tableDeleteColumn}
              onClick={handleDeleteColumn}
              className="table-action-btn table-delete-btn"
            >
              <span className="tiptap-button-text">{messages.tableDeleteColumn}</span>
            </Button>

            <Separator
              orientation="vertical"
              className="table-toolbar-separator"
            />

            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              aria-label={messages.tableDeleteTable}
              tooltip={messages.tableDeleteTable}
              onClick={handleDeleteTable}
              className="table-action-btn table-delete-table-btn"
            >
              <TrashIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardBody>
      </Card>
    </div>
  );
});

TableFloatingToolbar.displayName = 'TableFloatingToolbar';
