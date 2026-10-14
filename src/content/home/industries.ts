import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';

export const INDUSTRIES: readonly {
  key: keyof Resources['home']['industries']['items'];
  icon: IconKey;
}[] = [
  { key: 'ecommerce', icon: 'shoppingBag' },
  { key: 'finance', icon: 'landmark' },
  { key: 'logistics', icon: 'truck' },
  { key: 'healthcare', icon: 'stethoscope' },
  { key: 'realEstate', icon: 'building2' },
  { key: 'hospitality', icon: 'plane' },
  { key: 'education', icon: 'graduationCap' },
  { key: 'manufacturing', icon: 'factory' },
];
