import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALE_META, type Locale, type LocaleMeta } from './config';
import { applyDocumentLocale, persistLocale, resolveLocale } from './i18n';
import { loadLocaleFonts } from './fonts';
import { useMotionTier } from '@/motion/tier';

export type UseLocaleResult = {
  locale: Locale;
  meta: LocaleMeta;
  /** Язык, который сейчас загружается (до переключения). */
  pendingLocale: Locale | null;
  setLocale: (next: Locale) => Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => { finished: Promise<void> };
};

/** Ждём, пока React закоммитит перерисовку после события i18next (оно приходит вне React). */
const waitForCommit = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 34);
  });

/**
 * Якорь прокрутки: первая секция, видимая под шапкой. После смены языка длины текстов меняются —
 * восстанавливаем её смещение, чтобы страница не «прыгала».
 */
function captureScrollAnchor() {
  const headerOffset = 80;
  const section = Array.from(document.querySelectorAll<HTMLElement>('main section')).find(
    (element) => element.getBoundingClientRect().bottom > headerOffset,
  );
  if (!section) return () => undefined;
  const offset = section.getBoundingClientRect().top;
  return () => {
    const delta = section.getBoundingClientRect().top - offset;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'auto' });
  };
}

/**
 * Текущий язык и его смена. Новый язык применяется только после загрузки его ресурсов и шрифтов,
 * поэтому интерфейс не мигает ключами или fallback-гарнитурами. Сама смена — визуальное событие:
 * View Transition с мягким размытием (full), кроссфейд контента (lite/без поддержки), мгновенно (off).
 */
export function useLocale(): UseLocaleResult {
  const { i18n } = useTranslation();
  const tier = useMotionTier();
  const locale = resolveLocale(i18n);
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);

  const setLocale = useCallback(
    async (next: Locale) => {
      persistLocale(next);
      if (next === resolveLocale(i18n)) return;
      setPendingLocale(next);
      try {
        await Promise.all([i18n.loadLanguages(next), loadLocaleFonts(next)]);

        const restoreScroll = captureScrollAnchor();
        const apply = async () => {
          await i18n.changeLanguage(next);
          applyDocumentLocale(next);
          await waitForCommit();
          restoreScroll();
        };

        const doc = document as ViewTransitionDocument;
        const root = document.documentElement;
        if (tier === 'full' && typeof doc.startViewTransition === 'function') {
          root.classList.add('vt-locale');
          try {
            await doc.startViewTransition(apply).finished;
          } finally {
            root.classList.remove('vt-locale');
          }
        } else if (tier !== 'off') {
          root.classList.add('locale-fade');
          try {
            await apply();
          } finally {
            window.requestAnimationFrame(() => root.classList.remove('locale-fade'));
          }
        } else {
          await apply();
        }
      } finally {
        setPendingLocale(null);
      }
    },
    [i18n, tier],
  );

  return { locale, meta: LOCALE_META[locale], pendingLocale, setLocale };
}
