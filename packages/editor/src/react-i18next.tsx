import { useMemo } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import BaseConfigurableTiptapEditor from './ConfigurableTiptapEditor';
import type {
  ConfigurableTiptapEditorProps,
  EditorMessages,
} from './types';

export const XEDITOR_I18NEXT_NAMESPACE = 'xeditor';

export const XEDITOR_I18NEXT_RESOURCES = {
  'zh-CN': {
    [XEDITOR_I18NEXT_NAMESPACE]: {
      loading: '正在加载编辑器...',
      placeholder: '开始输入...',
      toolbarRegionLabel: '编辑器工具栏',
      richTextEditorLabel: '富文本编辑器',
      markdownInputLabel: 'Markdown 源码',
      modeRichText: '富文本模式',
      modeMarkdown: 'Markdown 模式',
      toolbarUndo: '撤销',
      toolbarRedo: '重做',
      toolbarHeading: '标题',
      toolbarHeadingLevel_one: '{{count}} 级标题',
      toolbarHeadingLevel_other: '{{count}} 级标题',
      toolbarFormatHeading: '将文本设置为标题',
      toolbarList: '列表',
      toolbarListOptions: '列表选项',
      toolbarBulletList: '无序列表',
      toolbarOrderedList: '有序列表',
      toolbarTaskList: '任务列表',
      toolbarBlockquote: '引用',
      toolbarCodeBlock: '代码块',
      toolbarBold: '加粗',
      toolbarItalic: '斜体',
      toolbarStrike: '删除线',
      toolbarCode: '行内代码',
      toolbarUnderline: '下划线',
      toolbarHighlight: '高亮',
      toolbarRemoveHighlight: '取消高亮',
      toolbarHighlightColors: '高亮颜色',
      toolbarHighlightColor: '{{label}} 高亮颜色',
      toolbarLink: '链接',
      toolbarLinkPlaceholder: '粘贴链接...',
      toolbarApplyLink: '应用链接',
      toolbarOpenLink: '在新窗口打开',
      toolbarRemoveLink: '移除链接',
      toolbarSuperscript: '上标',
      toolbarSubscript: '下标',
      toolbarAlignLeft: '左对齐',
      toolbarAlignCenter: '居中对齐',
      toolbarAlignRight: '右对齐',
      toolbarAlignJustify: '两端对齐',
      toolbarInsertTable: '插入表格',
      toolbarAddImage: '添加图片',
      toolbarAddImageText: '添加',
      tableToolbarLabel: '表格操作',
      tableAddRowBefore: '上方插入行',
      tableAddRowAfter: '下方插入行',
      tableDeleteRow: '删除行',
      tableAddColumnBefore: '左侧插入列',
      tableAddColumnAfter: '右侧插入列',
      tableDeleteColumn: '删除列',
      tableDeleteTable: '删除表格',
      uploadClickOrDrop: '点击上传或拖拽文件到这里',
      uploadDropzoneLabel: '上传文件',
      uploadLimit_one: '最多 {{count}} 个文件，每个 {{maxSizeMB}}MB。',
      uploadLimit_other: '最多 {{count}} 个文件，每个 {{maxSizeMB}}MB。',
      uploadInProgress_one: '正在上传 {{count}} 个文件',
      uploadInProgress_other: '正在上传 {{count}} 个文件',
      clearAllUploads: '清空队列',
      uploadRemoveFile: '移除文件',
    },
  },
  en: {
    [XEDITOR_I18NEXT_NAMESPACE]: {
      loading: 'Loading editor...',
      placeholder: 'Start typing...',
      toolbarRegionLabel: 'Editor toolbar',
      richTextEditorLabel: 'Rich text editor',
      markdownInputLabel: 'Markdown source',
      modeRichText: 'Rich text mode',
      modeMarkdown: 'Markdown mode',
      toolbarUndo: 'Undo',
      toolbarRedo: 'Redo',
      toolbarHeading: 'Heading',
      toolbarHeadingLevel_one: 'Heading {{count}}',
      toolbarHeadingLevel_other: 'Heading {{count}}',
      toolbarFormatHeading: 'Format text as heading',
      toolbarList: 'List',
      toolbarListOptions: 'List options',
      toolbarBulletList: 'Bullet list',
      toolbarOrderedList: 'Ordered list',
      toolbarTaskList: 'Task list',
      toolbarBlockquote: 'Blockquote',
      toolbarCodeBlock: 'Code block',
      toolbarBold: 'Bold',
      toolbarItalic: 'Italic',
      toolbarStrike: 'Strike',
      toolbarCode: 'Code',
      toolbarUnderline: 'Underline',
      toolbarHighlight: 'Highlight',
      toolbarRemoveHighlight: 'Remove highlight',
      toolbarHighlightColors: 'Highlight colors',
      toolbarHighlightColor: '{{label}} highlight color',
      toolbarLink: 'Link',
      toolbarLinkPlaceholder: 'Paste a link...',
      toolbarApplyLink: 'Apply link',
      toolbarOpenLink: 'Open in new window',
      toolbarRemoveLink: 'Remove link',
      toolbarSuperscript: 'Superscript',
      toolbarSubscript: 'Subscript',
      toolbarAlignLeft: 'Align left',
      toolbarAlignCenter: 'Align center',
      toolbarAlignRight: 'Align right',
      toolbarAlignJustify: 'Align justify',
      toolbarInsertTable: 'Insert table',
      toolbarAddImage: 'Add image',
      toolbarAddImageText: 'Add',
      tableToolbarLabel: 'Table actions',
      tableAddRowBefore: 'Add row above',
      tableAddRowAfter: 'Add row below',
      tableDeleteRow: 'Delete row',
      tableAddColumnBefore: 'Add column before',
      tableAddColumnAfter: 'Add column after',
      tableDeleteColumn: 'Delete column',
      tableDeleteTable: 'Delete table',
      uploadClickOrDrop: 'Click to upload or drag and drop',
      uploadDropzoneLabel: 'Upload files',
      uploadLimit_one: 'Up to {{count}} file, {{maxSizeMB}}MB each.',
      uploadLimit_other: 'Up to {{count}} files, {{maxSizeMB}}MB each.',
      uploadInProgress_one: 'Uploading {{count}} file',
      uploadInProgress_other: 'Uploading {{count}} files',
      clearAllUploads: 'Clear queue',
      uploadRemoveFile: 'Remove file',
    },
  },
} as const;

export interface I18nextEditorOptions {
  namespace?: string;
  keyPrefix?: string;
}

export interface I18nextConfigurableTiptapEditorProps
  extends ConfigurableTiptapEditorProps {
  i18nNamespace?: string;
  i18nKeyPrefix?: string;
}

function resolveKey(key: string, keyPrefix?: string) {
  return keyPrefix ? `${keyPrefix}.${key}` : key;
}

export function createI18nextEditorMessages(
  t: TFunction,
  options: I18nextEditorOptions = {},
): EditorMessages {
  const { keyPrefix } = options;

  return {
    loading: t(resolveKey('loading', keyPrefix)),
    placeholder: t(resolveKey('placeholder', keyPrefix)),
    toolbarRegionLabel: t(resolveKey('toolbarRegionLabel', keyPrefix)),
    richTextEditorLabel: t(resolveKey('richTextEditorLabel', keyPrefix)),
    markdownInputLabel: t(resolveKey('markdownInputLabel', keyPrefix)),
    modeRichText: t(resolveKey('modeRichText', keyPrefix)),
    modeMarkdown: t(resolveKey('modeMarkdown', keyPrefix)),
    toolbarUndo: t(resolveKey('toolbarUndo', keyPrefix)),
    toolbarRedo: t(resolveKey('toolbarRedo', keyPrefix)),
    toolbarHeading: t(resolveKey('toolbarHeading', keyPrefix)),
    toolbarHeadingLevel: ({ level }) =>
      t(resolveKey('toolbarHeadingLevel', keyPrefix), { count: level }),
    toolbarFormatHeading: t(resolveKey('toolbarFormatHeading', keyPrefix)),
    toolbarList: t(resolveKey('toolbarList', keyPrefix)),
    toolbarListOptions: t(resolveKey('toolbarListOptions', keyPrefix)),
    toolbarBulletList: t(resolveKey('toolbarBulletList', keyPrefix)),
    toolbarOrderedList: t(resolveKey('toolbarOrderedList', keyPrefix)),
    toolbarTaskList: t(resolveKey('toolbarTaskList', keyPrefix)),
    toolbarBlockquote: t(resolveKey('toolbarBlockquote', keyPrefix)),
    toolbarCodeBlock: t(resolveKey('toolbarCodeBlock', keyPrefix)),
    toolbarBold: t(resolveKey('toolbarBold', keyPrefix)),
    toolbarItalic: t(resolveKey('toolbarItalic', keyPrefix)),
    toolbarStrike: t(resolveKey('toolbarStrike', keyPrefix)),
    toolbarCode: t(resolveKey('toolbarCode', keyPrefix)),
    toolbarUnderline: t(resolveKey('toolbarUnderline', keyPrefix)),
    toolbarHighlight: t(resolveKey('toolbarHighlight', keyPrefix)),
    toolbarRemoveHighlight: t(
      resolveKey('toolbarRemoveHighlight', keyPrefix),
    ),
    toolbarHighlightColors: t(
      resolveKey('toolbarHighlightColors', keyPrefix),
    ),
    toolbarHighlightColor: ({ label }) =>
      t(resolveKey('toolbarHighlightColor', keyPrefix), { label }),
    toolbarLink: t(resolveKey('toolbarLink', keyPrefix)),
    toolbarLinkPlaceholder: t(
      resolveKey('toolbarLinkPlaceholder', keyPrefix),
    ),
    toolbarApplyLink: t(resolveKey('toolbarApplyLink', keyPrefix)),
    toolbarOpenLink: t(resolveKey('toolbarOpenLink', keyPrefix)),
    toolbarRemoveLink: t(resolveKey('toolbarRemoveLink', keyPrefix)),
    toolbarSuperscript: t(resolveKey('toolbarSuperscript', keyPrefix)),
    toolbarSubscript: t(resolveKey('toolbarSubscript', keyPrefix)),
    toolbarAlignLeft: t(resolveKey('toolbarAlignLeft', keyPrefix)),
    toolbarAlignCenter: t(resolveKey('toolbarAlignCenter', keyPrefix)),
    toolbarAlignRight: t(resolveKey('toolbarAlignRight', keyPrefix)),
    toolbarAlignJustify: t(resolveKey('toolbarAlignJustify', keyPrefix)),
    toolbarInsertTable: t(resolveKey('toolbarInsertTable', keyPrefix)),
    toolbarAddImage: t(resolveKey('toolbarAddImage', keyPrefix)),
    toolbarAddImageText: t(resolveKey('toolbarAddImageText', keyPrefix)),
    tableToolbarLabel: t(resolveKey('tableToolbarLabel', keyPrefix)),
    tableAddRowBefore: t(resolveKey('tableAddRowBefore', keyPrefix)),
    tableAddRowAfter: t(resolveKey('tableAddRowAfter', keyPrefix)),
    tableDeleteRow: t(resolveKey('tableDeleteRow', keyPrefix)),
    tableAddColumnBefore: t(resolveKey('tableAddColumnBefore', keyPrefix)),
    tableAddColumnAfter: t(resolveKey('tableAddColumnAfter', keyPrefix)),
    tableDeleteColumn: t(resolveKey('tableDeleteColumn', keyPrefix)),
    tableDeleteTable: t(resolveKey('tableDeleteTable', keyPrefix)),
    uploadClickOrDrop: t(resolveKey('uploadClickOrDrop', keyPrefix)),
    uploadDropzoneLabel: t(resolveKey('uploadDropzoneLabel', keyPrefix)),
    uploadLimit: ({ limit, maxSizeMB }) =>
      t(resolveKey('uploadLimit', keyPrefix), {
        count: limit,
        maxSizeMB,
      }),
    uploadInProgress: ({ count }) =>
      t(resolveKey('uploadInProgress', keyPrefix), { count }),
    clearAllUploads: t(resolveKey('clearAllUploads', keyPrefix)),
    uploadRemoveFile: t(resolveKey('uploadRemoveFile', keyPrefix)),
  };
}

export function useI18nextEditorMessages(
  options: I18nextEditorOptions = {},
): EditorMessages {
  const namespace = options.namespace ?? XEDITOR_I18NEXT_NAMESPACE;
  const { keyPrefix } = options;
  const { t } = useTranslation(namespace);

  return useMemo(
    () => createI18nextEditorMessages(t, { keyPrefix }),
    [keyPrefix, t],
  );
}

export function ConfigurableTiptapEditor(
  props: I18nextConfigurableTiptapEditorProps,
) {
  const {
    i18nNamespace = XEDITOR_I18NEXT_NAMESPACE,
    i18nKeyPrefix,
    messages,
    ...restProps
  } = props;
  const localizedMessages = useI18nextEditorMessages({
    namespace: i18nNamespace,
    keyPrefix: i18nKeyPrefix,
  });

  return (
    <BaseConfigurableTiptapEditor
      {...restProps}
      messages={{
        ...localizedMessages,
        ...messages,
      }}
    />
  );
}
