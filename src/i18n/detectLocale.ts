import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isLocale, type Locale } from './config';

export type DetectionSource = 'stored' | 'query' | 'browser' | 'timezone' | 'default';

export type DetectionInput = {
  /** Явный выбор пользователя из localStorage. */
  stored?: string | null;
  /** Значение параметра ?lang= из URL. */
  query?: string | null;
  /** navigator.languages (в порядке предпочтения). */
  languages?: readonly string[];
  /** IANA-часовой пояс, например 'Asia/Bangkok'. */
  timeZone?: string | null;
};

export type DetectionResult = {
  locale: Locale;
  source: DetectionSource;
};

/** Часовые пояса регионов, где говорят на поддерживаемых языках. Используются, только если ни один язык браузера не поддержан. */
const TIMEZONE_LOCALES: Record<string, Locale> = {
  'Europe/Moscow': 'ru',
  'Europe/Minsk': 'ru',
  'Europe/Kaliningrad': 'ru',
  'Europe/Samara': 'ru',
  'Europe/Volgograd': 'ru',
  'Asia/Yekaterinburg': 'ru',
  'Asia/Omsk': 'ru',
  'Asia/Novosibirsk': 'ru',
  'Asia/Krasnoyarsk': 'ru',
  'Asia/Irkutsk': 'ru',
  'Asia/Yakutsk': 'ru',
  'Asia/Vladivostok': 'ru',
  'Asia/Magadan': 'ru',
  'Asia/Kamchatka': 'ru',
  'Asia/Almaty': 'ru',
  'Asia/Bishkek': 'ru',
  'Asia/Bangkok': 'th',
  'Asia/Shanghai': 'zh',
  'Asia/Chongqing': 'zh',
  'Asia/Harbin': 'zh',
  'Asia/Urumqi': 'zh',
  'Asia/Hong_Kong': 'zh',
  'Asia/Macau': 'zh',
  'Asia/Taipei': 'zh',
  'Asia/Tokyo': 'ja',
  'Europe/Paris': 'fr',
  'Europe/Monaco': 'fr',
  'Europe/Berlin': 'de',
  'Europe/Busingen': 'de',
  'Europe/Vienna': 'de',
  'Europe/Zurich': 'de',
  'Europe/Vaduz': 'de',
};

/** 'zh-TW' → 'zh', 'th_TH' → 'th', 'DE' → 'de'. */
export function toSupportedLocale(tag: string | null | undefined): Locale | null {
  if (!tag) return null;
  const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
  return isLocale(primary) ? primary : null;
}

/**
 * Выбирает язык сайта. Приоритет: явный выбор → ?lang → языки браузера → регион по часовому поясу → английский.
 * Чистая функция: все внешние данные приходят во входе (см. readDetectionInput).
 */
export function detectLocale(input: DetectionInput): DetectionResult {
  if (isLocale(input.stored)) return { locale: input.stored, source: 'stored' };

  const fromQuery = toSupportedLocale(input.query);
  if (fromQuery) return { locale: fromQuery, source: 'query' };

  for (const tag of input.languages ?? []) {
    const locale = toSupportedLocale(tag);
    if (locale) return { locale, source: 'browser' };
  }

  const fromTimeZone = input.timeZone ? TIMEZONE_LOCALES[input.timeZone] : undefined;
  if (fromTimeZone) return { locale: fromTimeZone, source: 'timezone' };

  return { locale: DEFAULT_LOCALE, source: 'default' };
}

/** Собирает вход для detectLocale из окружения браузера. Любой недоступный источник просто пропускается. */
export function readDetectionInput(): DetectionInput {
  const input: DetectionInput = {};

  try {
    input.stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    // localStorage недоступен (приватный режим, запрет cookies) — пропускаем
  }

  try {
    input.query = new URLSearchParams(window.location.search).get('lang');
  } catch {
    // нет location — пропускаем
  }

  if (typeof navigator !== 'undefined') {
    input.languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  }

  try {
    input.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Intl без часового пояса — пропускаем
  }

  return input;
}

/** Убирает ?lang= из адресной строки, не перезагружая страницу. */
export function stripLangQuery(): void {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('lang')) return;
    url.searchParams.delete('lang');
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch {
    // history недоступна — оставляем URL как есть
  }
}
