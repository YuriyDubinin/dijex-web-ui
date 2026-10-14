import type { Resources } from '@/i18n/resources';

type NavLabelKey = keyof Resources['common']['nav'];

export type AnchorNavItem = {
  /** id секции главной для ScrollSpy. */
  id: string;
  labelKey: NavLabelKey;
  href: string;
};

/** Якорные пункты хедера (после выпадающего «Решения»). */
export const HEADER_ANCHORS: readonly AnchorNavItem[] = [
  { id: 'industries', labelKey: 'industries', href: '/#industries' },
  { id: 'cases', labelKey: 'cases', href: '/#cases' },
  { id: 'process', labelKey: 'process', href: '/#process' },
  { id: 'faq', labelKey: 'faq', href: '/#faq' },
  { id: 'contact', labelKey: 'contact', href: '/#contact' },
];

/** id секций, которые подсвечивают пункт «Решения». */
export const SOLUTION_SECTION_IDS = ['solutions', 'orchestrator', 'support', 'processes'] as const;

/** Колонка «Компания» в футере. */
export const FOOTER_COMPANY_LINKS: readonly AnchorNavItem[] = [
  { id: 'about', labelKey: 'about', href: '/#about' },
  { id: 'cases', labelKey: 'cases', href: '/#cases' },
  { id: 'process', labelKey: 'process', href: '/#process' },
  { id: 'faq', labelKey: 'faq', href: '/#faq' },
];

// TODO: уточнить — контакты выглядят как заглушки
export const CONTACTS = [
  { label: 'hello@dijex.tech', href: 'mailto:hello@dijex.tech' },
  { label: '+7 (999) 123-45-67', href: 'tel:+79991234567' },
] as const;

export const SOCIALS = [
  { label: 'Telegram', href: 'https://t.me/dijex' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/dijex' },
  { label: 'GitHub', href: 'https://github.com/dijex' },
] as const;
