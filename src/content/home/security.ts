import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';

export const SECURITY_ITEMS: readonly {
  key: keyof Resources['home']['security']['items'];
  icon: IconKey;
}[] = [
  { key: 'encryption', icon: 'lock' },
  { key: 'masking', icon: 'eye' },
  { key: 'perimeter', icon: 'server' },
  // TODO: уточнить — формулировка о соответствии законам (GDPR/152-ФЗ/PDPA/PIPL/APPI) в каждой локали
  { key: 'compliance', icon: 'fileCheck' },
  { key: 'access', icon: 'keyRound' },
  { key: 'guardrails', icon: 'shieldCheck' },
];

export const DEPLOYMENT_OPTIONS: readonly {
  key: keyof Resources['home']['security']['deployment']['options'];
  icon: IconKey;
}[] = [
  { key: 'cloud', icon: 'cloud' },
  { key: 'private', icon: 'lock' },
  { key: 'onPrem', icon: 'server' },
];
