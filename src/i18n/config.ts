export const SUPPORTED_LOCALES = ['en', 'ru', 'th', 'zh', 'ja', 'fr', 'de'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Ключ localStorage для явного выбора языка пользователем. */
export const LOCALE_STORAGE_KEY = 'dijex.locale';

/** Ключ localStorage: подсказка об автоматически выбранном языке уже показывалась. */
export const LOCALE_HINT_STORAGE_KEY = 'dijex.locale-hint-shown';

export const NAMESPACES = [
  'common',
  'home',
  'solutions',
  'form',
  'meta',
  'legal',
  'visuals',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

/** Флаг для английского. Поменять на 'US', если нужен американский. */
export const EN_FLAG_COUNTRY = 'GB';

export type FlagCountry = 'GB' | 'US' | 'RU' | 'TH' | 'CN' | 'JP' | 'FR' | 'DE';

export type LocaleMeta = {
  code: Locale;
  /** Название языка на нём самом — не переводится. */
  nativeName: string;
  englishName: string;
  flag: FlagCountry;
  /** Значение для <html lang> и атрибутов lang. */
  htmlLang: string;
  /** Значение для og:locale. */
  ogLocale: string;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    flag: EN_FLAG_COUNTRY,
    htmlLang: 'en',
    ogLocale: 'en_GB',
  },
  ru: {
    code: 'ru',
    nativeName: 'Русский',
    englishName: 'Russian',
    flag: 'RU',
    htmlLang: 'ru',
    ogLocale: 'ru_RU',
  },
  th: {
    code: 'th',
    nativeName: 'ไทย',
    englishName: 'Thai',
    flag: 'TH',
    htmlLang: 'th',
    ogLocale: 'th_TH',
  },
  zh: {
    code: 'zh',
    nativeName: '简体中文',
    englishName: 'Chinese (Simplified)',
    flag: 'CN',
    htmlLang: 'zh-Hans',
    ogLocale: 'zh_CN',
  },
  ja: {
    code: 'ja',
    nativeName: '日本語',
    englishName: 'Japanese',
    flag: 'JP',
    htmlLang: 'ja',
    ogLocale: 'ja_JP',
  },
  fr: {
    code: 'fr',
    nativeName: 'Français',
    englishName: 'French',
    flag: 'FR',
    htmlLang: 'fr',
    ogLocale: 'fr_FR',
  },
  de: {
    code: 'de',
    nativeName: 'Deutsch',
    englishName: 'German',
    flag: 'DE',
    htmlLang: 'de',
    ogLocale: 'de_DE',
  },
};

/** Порядок языков в переключателе. */
export const SWITCHER_ORDER: readonly Locale[] = ['en', 'ru', 'fr', 'de', 'ja', 'zh', 'th'];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
