import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';

export const ABOUT_PRINCIPLES: readonly {
  key: keyof Resources['home']['about']['principles'];
  icon: IconKey;
}[] = [
  { key: 'goal', icon: 'target' },
  { key: 'progress', icon: 'eye' },
  { key: 'data', icon: 'shieldCheck' },
];

export const ABOUT_METRICS: readonly {
  key: keyof Resources['home']['about']['metrics'];
  value: number;
  suffix: string;
}[] = [
  { key: 'years', value: 4, suffix: '+' },
  { key: 'projects', value: 57, suffix: '+' },
  { key: 'clients', value: 18, suffix: '+' },
  { key: 'technologies', value: 45, suffix: '+' },
];
