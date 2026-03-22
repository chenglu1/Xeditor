import { createInstance } from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  useI18nextEditorMessages,
  XEDITOR_I18NEXT_NAMESPACE,
  XEDITOR_I18NEXT_RESOURCES,
} from './react-i18next';

function MessageProbe() {
  const messages = useI18nextEditorMessages();

  return (
    <div>
      {messages.toolbarHeading} | {messages.toolbarHeadingLevel({ level: 2 })}
    </div>
  );
}

function MessageProbeWithPrefix() {
  const messages = useI18nextEditorMessages({
    namespace: 'custom',
    keyPrefix: 'editor',
  });

  return (
    <div>
      {messages.toolbarUndo} | {messages.uploadInProgress({ count: 3 })}
    </div>
  );
}

async function createTestI18n() {
  const i18n = createInstance();

  await i18n.use(initReactI18next).init({
    lng: 'zh-CN',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      ...XEDITOR_I18NEXT_RESOURCES,
      'zh-CN': {
        ...XEDITOR_I18NEXT_RESOURCES['zh-CN'],
        custom: {
          editor: {
            toolbarUndo: '回退',
            uploadInProgress_one: '上传中 {{count}} 项',
            uploadInProgress_other: '上传中 {{count}} 项',
          },
        },
      },
    },
  });

  return i18n;
}

describe('react-i18next adapter', () => {
  it('maps the default xeditor namespace into editor messages', async () => {
    const i18n = await createTestI18n();

    render(
      <I18nextProvider i18n={i18n}>
        <MessageProbe />
      </I18nextProvider>,
    );

    expect(screen.getByText(`标题 | 2 级标题`)).toBeTruthy();
  });

  it('supports custom namespace and keyPrefix overrides', async () => {
    const i18n = await createTestI18n();

    render(
      <I18nextProvider i18n={i18n}>
        <MessageProbeWithPrefix />
      </I18nextProvider>,
    );

    expect(screen.getByText('回退 | 上传中 3 项')).toBeTruthy();
  });
});
