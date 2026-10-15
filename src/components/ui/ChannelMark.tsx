import type { LucideIcon } from 'lucide-react';
import { ChannelGlyph } from './ChannelGlyph';
import { isChannelBrand } from './channelBrands';

type Props = {
  /** Название канала: бренд (Telegram, WhatsApp…) или общий канал (Email, Web…). */
  name: string;
  /** Иконка для общих каналов, у которых нет фирменного значка. */
  fallback: LucideIcon;
  size?: number;
  tint?: 'hover' | 'always' | 'never';
  className?: string;
};

/** Значок канала: фирменный глиф для мессенджеров и соцсетей, иконка — для почты, веба, API. */
export function ChannelMark({
  name,
  fallback: Fallback,
  size = 14,
  tint = 'never',
  className,
}: Props) {
  return isChannelBrand(name) ? (
    <ChannelGlyph channel={name} size={size} tint={tint} className={className} />
  ) : (
    <Fallback aria-hidden size={size} className={className} />
  );
}
