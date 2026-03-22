import { describe, expect, it } from 'vitest';

import {
  canExecuteUndoRedoAction,
  shouldShowButton,
} from './use-undo-redo';

function createHistoryEditor(isEditable: boolean) {
  return {
    isEditable,
    isActive: () => false,
    can: () => ({
      undo: () => true,
      redo: () => true,
    }),
  } as any;
}

describe('useUndoRedo visibility', () => {
  it('keeps the history buttons visible while making them unavailable for disabled editors', () => {
    const editor = createHistoryEditor(false);

    expect(canExecuteUndoRedoAction(editor, 'undo')).toBe(false);
    expect(
      shouldShowButton({
        editor,
        hideWhenUnavailable: false,
        action: 'undo',
      }),
    ).toBe(true);
  });
});
