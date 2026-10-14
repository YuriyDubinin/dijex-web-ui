import type { ReactElement, ReactNode } from 'react';
import i18next, { type i18n as I18n } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { render } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { DEFAULT_LOCALE, NAMESPACES, SUPPORTED_LOCALES, type Locale } from '@/i18n/config';
import { ToastProvider } from '@/components/ui/Toast';

const localeFiles = import.meta.glob<Record<string, unknown>>('../locales/*/*.json', {
  eager: true,
  import: 'default',
});

/** Все локали синхронно — в тестах смена языка не должна ждать загрузки. */
function allResources() {
  const resources: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const locale of SUPPORTED_LOCALES) {
    for (const namespace of NAMESPACES) {
      const file = localeFiles[`../locales/${locale}/${namespace}.json`];
      if (!file) continue;
      resources[locale] ??= {};
      resources[locale][namespace] = file;
    }
  }
  return resources;
}

export async function createTestI18n(locale: Locale = DEFAULT_LOCALE): Promise<I18n> {
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    resources: allResources(),
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    ns: [...NAMESPACES],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}

type Options = {
  locale?: Locale;
  router?: MemoryRouterProps;
};

/** Рендер с i18n, роутером и тостами — как в приложении. */
export async function renderWithProviders(ui: ReactElement, { locale, router }: Options = {}) {
  const i18n = await createTestI18n(locale);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter {...router}>
        <ToastProvider>{children}</ToastProvider>
      </MemoryRouter>
    </I18nextProvider>
  );
  return { i18n, ...render(ui, { wrapper }) };
}
