import i18next, { type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  NAMESPACES,
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
} from './config';
import {
  detectLocale,
  readDetectionInput,
  stripLangQuery,
  type DetectionResult,
} from './detectLocale';
import { enResources } from './resources';
import { loadLocaleFonts } from './fonts';

/** Ленивые загрузчики всех локалей, кроме английской (она в основном бандле). Каждый JSON — отдельный чанк. */
const lazyLocaleFiles = import.meta.glob<{ default: Record<string, unknown> }>([
  '../locales/*/*.json',
  '!../locales/en/*.json',
]);

function loadNamespace(locale: string, namespace: string) {
  const loader = lazyLocaleFiles[`../locales/${locale}/${namespace}.json`];
  if (!loader) return Promise.reject(new Error(`Missing locale file: ${locale}/${namespace}`));
  return loader().then((module) => module.default);
}

/** Как был выбран стартовый язык — нужно для подсказки «мы выбрали язык по региону». */
let initialDetection: DetectionResult = { locale: DEFAULT_LOCALE, source: 'default' };

export function getInitialDetection(): DetectionResult {
  return initialDetection;
}

/** Синхронизирует документ с языком: <html lang>, data-locale, шрифты. */
export function applyDocumentLocale(locale: Locale): void {
  const root = document.documentElement;
  root.lang = LOCALE_META[locale].htmlLang;
  root.dataset.locale = locale;
  void loadLocaleFonts(locale);
}

export function resolveLocale(instance: I18n): Locale {
  const current = instance.resolvedLanguage ?? instance.language;
  return isLocale(current) ? current : DEFAULT_LOCALE;
}

export function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // localStorage недоступен — выбор будет действовать до перезагрузки
  }
}

/**
 * Создаёт и инициализирует i18next. Резолвится, когда ресурсы стартового языка загружены,
 * поэтому первый рендер сразу на нужном языке, без мигания английским.
 */
export async function initI18n(): Promise<I18n> {
  initialDetection = detectLocale(readDetectionInput());
  stripLangQuery();

  const instance = i18next.createInstance();
  instance.on('languageChanged', (lng) => {
    if (isLocale(lng)) applyDocumentLocale(lng);
  });

  await instance
    .use(resourcesToBackend(loadNamespace))
    .use(initReactI18next)
    .init({
      resources: { en: enResources },
      partialBundledLanguages: true,
      lng: initialDetection.locale,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: [...SUPPORTED_LOCALES],
      nonExplicitSupportedLngs: false,
      load: 'languageOnly',
      ns: [...NAMESPACES],
      defaultNS: 'common',
      returnNull: false,
      returnEmptyString: false,
      interpolation: { escapeValue: false },
      react: { useSuspense: true },
    });

  applyDocumentLocale(resolveLocale(instance));
  return instance;
}
