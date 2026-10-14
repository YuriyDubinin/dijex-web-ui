import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';
import type { SolutionKey } from '../solutions';

export const ECOSYSTEM_STEPS: readonly {
  key: keyof Resources['home']['ecosystem']['steps'];
  icon: IconKey;
  /** Время сценария (часы, минуты) — форматируется через Intl под язык. */
  time: readonly [number, number];
  solution: SolutionKey;
}[] = [
  { key: 'message', icon: 'messageCircle', time: [2, 14], solution: 'supportAgent' },
  { key: 'reply', icon: 'languages', time: [2, 14], solution: 'supportAgent' },
  { key: 'systems', icon: 'network', time: [2, 15], solution: 'aiOrchestrator' },
  { key: 'ticket', icon: 'fileText', time: [2, 15], solution: 'digitalProcesses' },
  { key: 'summary', icon: 'users', time: [9, 0], solution: 'digitalProcesses' },
];
