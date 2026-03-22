import type { EditorLogger } from '../types';

const noop = () => {};

const NOOP_LOGGER: EditorLogger = {
  warn: noop,
  error: noop,
};

export function createEditorLogger(
  logger?: Partial<EditorLogger>,
): EditorLogger {
  if (!logger) {
    return NOOP_LOGGER;
  }

  return {
    warn: logger.warn ?? noop,
    error: logger.error ?? noop,
  };
}
