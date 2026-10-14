import type { Resources } from '@/i18n/resources';

export const RESULT_ROWS: readonly (keyof Resources['home']['results']['rows'])[] = [
  'firstReply',
  'availability',
  'languages',
  'requests',
  'customerData',
];

// TODO: уточнить — подтвердить цифры (60% — из кейса AI-ассистента)
export const RESULT_METRICS: readonly {
  key: keyof Resources['home']['results']['metrics'];
  value: number;
}[] = [
  { key: 'automated', value: 60 },
  { key: 'always', value: 24 },
  { key: 'reply', value: 5 },
];
