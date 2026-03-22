import type {
  ToolbarButton,
  ToolbarConfig,
  ToolbarItem,
  ToolbarRenderItem,
  ToolbarSchema,
} from '../types';

const DEFAULT_SUPPORTED_TOOLBAR_BUTTONS: ToolbarButton[] = [
  'undo',
  'redo',
  'heading',
  'list',
  'blockquote',
  'codeBlock',
  'table',
  'bold',
  'italic',
  'strike',
  'code',
  'highlight',
  'link',
  'superscript',
  'subscript',
  'alignLeft',
  'alignCenter',
  'alignRight',
  'alignJustify',
];

const DEFAULT_TOOLBAR_SCHEMA: ToolbarSchema = [
  ['undo', 'redo'],
  ['heading', 'list', 'blockquote', 'codeBlock', 'table'],
  ['bold', 'italic', 'strike', 'code', 'underline', 'highlight', 'link'],
  ['superscript', 'subscript'],
  ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'],
  ['image'],
];

function isToolbarButton(item: ToolbarItem): item is ToolbarButton {
  return typeof item === 'string';
}

function filterToolbarSchema(
  toolbarSchema: ToolbarSchema,
  shouldShowButton: (button: ToolbarButton) => boolean,
): ToolbarSchema {
  return toolbarSchema
    .map((group) =>
      group.filter((item) => {
        if (!isToolbarButton(item)) {
          return true;
        }

        return shouldShowButton(item);
      }),
    )
    .filter((group) => group.length > 0);
}

export function createToolbarConfig(options: {
  toolbarButtons?: ToolbarButton[];
  supportedToolbarButtons?: ToolbarButton[];
  toolbarSchema?: ToolbarSchema;
  renderToolbarItem?: ToolbarRenderItem;
  includeImageButton?: boolean;
}): ToolbarConfig {
  const {
    toolbarButtons,
    toolbarSchema = DEFAULT_TOOLBAR_SCHEMA,
    renderToolbarItem,
    supportedToolbarButtons = DEFAULT_SUPPORTED_TOOLBAR_BUTTONS,
    includeImageButton = false,
  } = options;

  const supportedButtons = includeImageButton
    ? ([...supportedToolbarButtons, 'image'] as ToolbarButton[])
    : supportedToolbarButtons;
  const supportedButtonSet = new Set(supportedButtons);

  const shouldShowButton = (button: ToolbarButton) => {
    const allowedByToolbarButtons = toolbarButtons
      ? toolbarButtons.includes(button)
      : true;

    return allowedByToolbarButtons && supportedButtonSet.has(button);
  };

  const filteredToolbarSchema = filterToolbarSchema(toolbarSchema, shouldShowButton);

  return {
    showUndoRedo: shouldShowButton('undo') || shouldShowButton('redo'),
    showStructure:
      shouldShowButton('heading') ||
      shouldShowButton('list') ||
      shouldShowButton('blockquote') ||
      shouldShowButton('codeBlock') ||
      shouldShowButton('table'),
    showFormatting:
      shouldShowButton('bold') ||
      shouldShowButton('italic') ||
      shouldShowButton('strike') ||
      shouldShowButton('code') ||
      shouldShowButton('underline') ||
      shouldShowButton('highlight') ||
      shouldShowButton('link'),
    showScript:
      shouldShowButton('superscript') || shouldShowButton('subscript'),
    showAlign:
      shouldShowButton('alignLeft') ||
      shouldShowButton('alignCenter') ||
      shouldShowButton('alignRight') ||
      shouldShowButton('alignJustify'),
    showImage: shouldShowButton('image'),
    supportedToolbarButtons: supportedButtons,
    toolbarSchema: filteredToolbarSchema,
    renderToolbarItem,
    shouldShowButton,
  };
}
