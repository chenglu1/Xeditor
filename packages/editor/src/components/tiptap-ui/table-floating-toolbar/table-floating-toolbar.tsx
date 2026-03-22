'use client';

import type { Editor } from '@tiptap/react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

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
  const [isVisible, setIsVisible] = useState(false);
  const [cellElement, setCellElement] = useState<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const cellRect = useElementRect({ element: cellElement ?? undefined });

  const handleAddRowBefore = useCallback(() => {
    if (!editor) {
      return;
    }

    editor.chain().focus().addRowBefore().run();
  }, [editor]);

  const handleAddRowAfter = useCallback(() => {
    if (!editor) {
      return;
    }

    editor.chain().focus().addRowAfter().run();
  }, [editor]);

  const handleDeleteRow = useCallback(() => {
    if (!editor) {
      return;
    }

    editor.chain().focus().deleteRow().run();
  }, [editor]);

  const handleAddColumnBefore = useCallback(() => {
    if (!editor) {
      return;
    }

    editor.chain().focus().addColumnBefore().run();
  }, [editor]);

  const handleAddColumnAfter = useCallback(() => {
    if (!editor) {
      return;
    }

    editor.chain().focus().addColumnAfter().run();
  }, [editor]);

  const handleDeleteColumn = useCallback(() => {
    if (!editor) {
      return;
    }

    editor.chain().focus().deleteColumn().run();
  }, [editor]);

  const handleDeleteTable = useCallback(() => {
    if (!editor) {
      return;
    }

    editor.chain().focus().deleteTable().run();
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
    >
      <Card className="table-toolbar-card">
        <CardBody>
          <ButtonGroup orientation="horizontal">
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              tooltip="在上方插入行"
              onClick={handleAddRowBefore}
              className="table-action-btn"
            >
              <span className="tiptap-button-text">⬆ 行</span>
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              tooltip="在下方插入行"
              onClick={handleAddRowAfter}
              className="table-action-btn"
            >
              <span className="tiptap-button-text">⬇ 行</span>
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              tooltip="删除当前行"
              onClick={handleDeleteRow}
              className="table-action-btn table-delete-btn"
            >
              <span className="tiptap-button-text">✕ 行</span>
            </Button>

            <Separator
              orientation="vertical"
              className="table-toolbar-separator"
            />

            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              tooltip="在左侧插入列"
              onClick={handleAddColumnBefore}
              className="table-action-btn"
            >
              <span className="tiptap-button-text">⬅ 列</span>
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              tooltip="在右侧插入列"
              onClick={handleAddColumnAfter}
              className="table-action-btn"
            >
              <span className="tiptap-button-text">➡ 列</span>
            </Button>
            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              tooltip="删除当前列"
              onClick={handleDeleteColumn}
              className="table-action-btn table-delete-btn"
            >
              <span className="tiptap-button-text">✕ 列</span>
            </Button>

            <Separator
              orientation="vertical"
              className="table-toolbar-separator"
            />

            <Button
              type="button"
              data-style="ghost"
              data-size="small"
              tooltip="删除整个表格"
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
