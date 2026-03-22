import type { EditorMessages } from '../types';
import { DEFAULT_EDITOR_MESSAGES } from '../types';

export function createEditorMessages(
  messages?: Partial<EditorMessages>,
): EditorMessages {
  return {
    ...DEFAULT_EDITOR_MESSAGES,
    ...messages,
  };
}
