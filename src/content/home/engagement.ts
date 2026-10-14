import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';
import type { SubjectKey } from '../contact';

export const ENGAGEMENT_MODELS: readonly {
  key: keyof Resources['home']['engagement']['items'];
  icon: IconKey;
  subjectKey: SubjectKey;
  featured?: boolean;
}[] = [
  { key: 'pilot', icon: 'zap', subjectKey: 'pilot' },
  // TODO: уточнить — какой формат действительно выбирают чаще всего
  { key: 'turnkey', icon: 'layers', subjectKey: 'turnkey', featured: true },
  { key: 'support', icon: 'repeat', subjectKey: 'ongoingSupport' },
];
