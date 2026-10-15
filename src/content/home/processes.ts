import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';
import type { SlotKey } from '../visualSlots';

export type ProcessTabKey = keyof Resources['home']['processes']['tabs'];

export const PROCESS_TABS: readonly {
  key: ProcessTabKey;
  icon: IconKey;
  /** Визуальное место (сцена). */
  visual: SlotKey;
  /** Технологии направления — не переводятся. */
  tech: readonly string[];
}[] = [
  {
    key: 'internal',
    icon: 'layoutDashboard',
    visual: 'processesInternalSystems',
    tech: ['Go', 'React', 'PostgreSQL', '1C', 'REST API'],
  },
  {
    key: 'messaging',
    icon: 'messageCircle',
    visual: 'processesMessagingPlatform',
    tech: ['WebSocket', 'NATS', 'Go', 'React', 'E2E encryption'],
  },
  {
    key: 'portals',
    icon: 'circleUser',
    visual: 'processesClientPortal',
    tech: ['React', 'Next.js', 'PostgreSQL', 'SSO', 'REST API'],
  },
  {
    key: 'apps',
    icon: 'smartphone',
    visual: 'processesWebApps',
    tech: ['React', 'TypeScript', 'React Native', 'Swift', 'Kotlin'],
  },
];
