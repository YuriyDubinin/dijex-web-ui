import common from '@/locales/en/common.json';
import home from '@/locales/en/home.json';
import solutions from '@/locales/en/solutions.json';
import form from '@/locales/en/form.json';
import meta from '@/locales/en/meta.json';
import legal from '@/locales/en/legal.json';
import type visuals from '@/locales/en/visuals.json';

/** Английские ресурсы — fallback и эталон структуры. Входят в основной бандл. */
export const enResources = { common, home, solutions, form, meta, legal } as const;

/**
 * Тексты сцен (visuals) грузятся лениво на всех языках, включая английский, — вместе со сценами,
 * поэтому в основной бандл не входят. Тип берётся из английского файла (только тип, без кода).
 */
export type Resources = typeof enResources & { visuals: typeof visuals };
