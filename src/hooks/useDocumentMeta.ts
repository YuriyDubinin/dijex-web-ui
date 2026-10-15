import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALE_META } from '@/i18n/config';
import { resolveLocale } from '@/i18n/i18n';
import type { Resources } from '@/i18n/resources';

export type MetaKey = keyof Resources['meta'];

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/** Title, description, Open Graph и превью ссылки на текущем языке. Пересчитывается при смене языка. */
export function useDocumentMeta(key: MetaKey): void {
  const { t, i18n } = useTranslation('meta');
  const title = t(`${key}.title`);
  const description = t(`${key}.description`);
  const locale = resolveLocale(i18n);

  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:locale', LOCALE_META[locale].ogLocale);
    // Превью ссылки на языке страницы — генерируется из кода (npm run og:generate)
    const image = `${window.location.origin}/og/og-${locale}.jpg`;
    setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:image', image);
  }, [title, description, locale]);
}
