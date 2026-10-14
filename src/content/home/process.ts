import type { Resources } from '@/i18n/resources';

export const PROCESS_STEPS: readonly (keyof Resources['home']['process']['steps'])[] = [
  'audit',
  'pilot',
  'integration',
  'scaling',
  'support',
];
