import { Suspense, useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { AmbientLayer } from './AmbientLayer';
import { MotionDebugBadge } from '@/motion/MotionDebugBadge';
import { BrandIntro } from '@/motion/BrandIntro';
import { IntroProvider } from '@/motion/intro';

function useScrollToHash() {
  const { pathname, hash, key } = useLocation();

  // Без hash — наверх до отрисовки (иначе снимок View Transition делается со старой позиции)
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash, key]);

  useEffect(() => {
    if (!hash) return undefined;

    const id = decodeURIComponent(hash.slice(1));
    let attempts = 0;
    let frame = 0;

    // Страница может быть ленивой — ждём появления секции несколько кадров
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempts++ < 30) frame = requestAnimationFrame(tryScroll);
    };

    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);
}

/** Фолбэк ленивых страниц: просто фон, без мигающего спиннера. */
function PageFallback() {
  return <div className="min-h-[100svh] bg-bg-base" aria-hidden />;
}

export function RootLayout() {
  const { t } = useTranslation();
  useScrollToHash();

  return (
    <IntroProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col bg-bg-base text-text-primary">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-bg-elevated focus:px-4 focus:py-2 focus:text-text-primary"
          >
            {t('skipToContent')}
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </main>
          <Footer />
          <AmbientLayer />
          <MotionDebugBadge />
          <BrandIntro />
        </div>
      </ToastProvider>
    </IntroProvider>
  );
}
