import type { IconKey } from '@/components/ui/iconMap';
import type { SlotKey } from '../visualSlots';
import type { ProcessTabKey } from '../home/processes';
import type { SolutionKey } from '../solutions';

export type KeyedIcon = { key: string; icon: IconKey };

export type SolutionSpecial =
  | {
      kind: 'deployment';
      /** Модели — названия брендов, не переводятся. */
      models: readonly string[];
      consoleVisual: SlotKey;
    }
  | { kind: 'channels'; inboxVisual: SlotKey; timeline: readonly string[] }
  | {
      kind: 'directions';
      directions: readonly ProcessTabKey[];
      aiBoost: readonly KeyedIcon[];
    };

/**
 * Структура страницы решения. Ключи элементов совпадают с ключами в locales/<lang>/solutions.json → <key>.
 */
export type SolutionPageDef = {
  key: SolutionKey;
  pains: readonly KeyedIcon[];
  steps: readonly KeyedIcon[];
  capabilities: readonly KeyedIcon[];
  useCases: readonly KeyedIcon[];
  /** Пустой массив — блок метрик скрыт. */
  metrics: readonly { key: string; value: number }[];
  faq: readonly string[];
  special: SolutionSpecial;
};

/** Общая форма текстов страницы решения (тест паритета гарантирует одинаковую структуру во всех языках). */
export type SolutionPageText = {
  hero: { eyebrow: string; title: string; lead: string; primaryCta: string; secondaryCta: string };
  pains: Record<string, string>;
  howItWorks: {
    title: string;
    lead: string;
    steps: Record<string, { title: string; text: string }>;
  };
  capabilities: {
    title: string;
    lead: string;
    items: Record<string, { title: string; description: string }>;
  };
  useCases: {
    title: string;
    items: Record<string, { title: string; situation: string; action: string; result: string }>;
  };
  metrics?: Record<string, { prefix: string; suffix: string; label: string }>;
  faq: Record<string, { q: string; a: string }>;
  cta: { title: string; lead: string };
};
