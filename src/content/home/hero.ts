import type { IconKey } from '@/components/ui/iconMap';

export const HERO_PILLARS: readonly {
  key: 'orchestrator' | 'support' | 'processes';
  icon: IconKey;
  href: string;
}[] = [
  { key: 'orchestrator', icon: 'network', href: '#orchestrator' },
  { key: 'support', icon: 'headset', href: '#support' },
  { key: 'processes', icon: 'layoutDashboard', href: '#processes' },
];
