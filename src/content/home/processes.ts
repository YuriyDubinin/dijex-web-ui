import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';
import type { ImageKey } from '../images';

export type ProcessTabKey = keyof Resources['home']['processes']['tabs'];

export const PROCESS_TABS: readonly {
  key: ProcessTabKey;
  icon: IconKey;
  image: ImageKey;
  /** Технологии направления — не переводятся. */
  tech: readonly string[];
}[] = [
  {
    key: 'internal',
    icon: 'layoutDashboard',
    image: 'processesInternalSystems',
    tech: ['Go', 'React', 'PostgreSQL', '1C', 'REST API'],
  },
  {
    key: 'messaging',
    icon: 'messageCircle',
    image: 'processesMessagingPlatform',
    tech: ['WebSocket', 'NATS', 'Go', 'React', 'E2E encryption'],
  },
  {
    key: 'portals',
    icon: 'circleUser',
    image: 'processesClientPortal',
    tech: ['React', 'Next.js', 'PostgreSQL', 'SSO', 'REST API'],
  },
  {
    key: 'apps',
    icon: 'smartphone',
    image: 'processesWebApps',
    tech: ['React', 'TypeScript', 'React Native', 'Swift', 'Kotlin'],
  },
];
