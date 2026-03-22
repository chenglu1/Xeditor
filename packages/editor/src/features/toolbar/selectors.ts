import type { ToolbarStateSnapshot } from '../../core/useToolbarState';

export function selectToolbarEditor(
  toolbarState: ToolbarStateSnapshot | null | undefined,
) {
  return toolbarState?.editor ?? null;
}

export function selectToolbarEditorState(
  toolbarState: ToolbarStateSnapshot | null | undefined,
) {
  return toolbarState?.editorState;
}

export function selectToolbarCanCommand(
  toolbarState: ToolbarStateSnapshot | null | undefined,
) {
  return toolbarState?.canCommand;
}

export function selectToolbarEditable(
  toolbarState: ToolbarStateSnapshot | null | undefined,
) {
  return toolbarState?.isEditable ?? false;
}
