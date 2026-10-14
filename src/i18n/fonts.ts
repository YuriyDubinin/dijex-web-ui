import type { Locale } from './config';

/**
 * Шрифты для письменностей, которых нет в Inter/Sora. Подключаются отдельными CSS-чанками только при выборе языка;
 * внутри fontsource сам режет шрифт на unicode-range-сабсеты, поэтому скачиваются лишь нужные глифы.
 */
const FONT_LOADERS: Partial<Record<Locale, () => Promise<unknown>>> = {
  th: () =>
    Promise.all([
      import('@fontsource/noto-sans-thai/400.css'),
      import('@fontsource/noto-sans-thai/500.css'),
      import('@fontsource/noto-sans-thai/700.css'),
    ]),
  zh: () =>
    Promise.all([
      import('@fontsource/noto-sans-sc/400.css'),
      import('@fontsource/noto-sans-sc/500.css'),
      import('@fontsource/noto-sans-sc/700.css'),
    ]),
  ja: () =>
    Promise.all([
      import('@fontsource/noto-sans-jp/400.css'),
      import('@fontsource/noto-sans-jp/500.css'),
      import('@fontsource/noto-sans-jp/700.css'),
    ]),
};

const loaded = new Set<Locale>();

export async function loadLocaleFonts(locale: Locale): Promise<void> {
  const loader = FONT_LOADERS[locale];
  if (!loader || loaded.has(locale)) return;
  loaded.add(locale);
  try {
    await loader();
  } catch {
    // Шрифт не загрузился — остаются системные гарнитуры из fallback-цепочки
    loaded.delete(locale);
  }
}
