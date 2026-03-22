import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { XEDITOR_I18NEXT_RESOURCES } from '@chenglu1/xeditor-editor/react-i18next';

const STORAGE_KEY = 'xeditor-demo-language';

const resources = {
  'zh-CN': {
    translation: {
      app: {
        nav: {
          richtext: '纯富文本',
          markdown: 'Markdown',
          dualView: '双视图',
          streaming: '流式输出',
          generalizedApi: '通用 API',
          github: 'GitHub',
        },
        footer: {
          tagline: 'Xeditor · 可复用编辑器演示',
          license: 'MIT License',
        },
        language: {
          zh: '中文（简体）',
          en: 'English',
          switcher: '切换语言',
          menuTitle: '选择语言',
        },
      },
    },
    ...XEDITOR_I18NEXT_RESOURCES['zh-CN'],
  },
  en: {
    translation: {
      app: {
        nav: {
          richtext: 'Rich Text',
          markdown: 'Markdown',
          dualView: 'Dual View',
          streaming: 'Streaming',
          generalizedApi: 'Generalized API',
          github: 'GitHub',
        },
        footer: {
          tagline: 'Xeditor · reusable editor playground',
          license: 'MIT License',
        },
        language: {
          zh: 'Chinese (Simplified)',
          en: 'English',
          switcher: 'Switch language',
          menuTitle: 'Select language',
        },
      },
    },
    ...XEDITOR_I18NEXT_RESOURCES.en,
  },
} as const;

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'zh-CN';
  }

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (storedLanguage === 'zh-CN' || storedLanguage === 'en') {
    return storedLanguage;
  }

  return window.navigator.language.toLowerCase().startsWith('zh')
    ? 'zh-CN'
    : 'en';
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (language) => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  });

  document.documentElement.lang = i18n.language;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', labelKey: 'app.language.zh' },
  { code: 'en', labelKey: 'app.language.en' },
] as const;

export default i18n;
