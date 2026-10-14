import type { LucideProps } from 'lucide-react';
import { ICONS, type IconKey } from './iconMap';

type Props = { name: IconKey } & Omit<LucideProps, 'ref'>;

/** Иконка lucide по ключу из контента. Декоративная по умолчанию. */
export function Icon({ name, ...rest }: Props) {
  const Component = ICONS[name];
  return <Component aria-hidden {...rest} />;
}
