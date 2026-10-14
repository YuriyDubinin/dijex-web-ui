import common from '@/locales/en/common.json';
import home from '@/locales/en/home.json';
import solutions from '@/locales/en/solutions.json';
import form from '@/locales/en/form.json';
import meta from '@/locales/en/meta.json';
import legal from '@/locales/en/legal.json';

/** Английские ресурсы — fallback и эталон структуры. Входят в основной бандл. */
export const enResources = { common, home, solutions, form, meta, legal } as const;

export type Resources = typeof enResources;
