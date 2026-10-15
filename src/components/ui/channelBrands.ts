/** Каналы с фирменными значками. Сами пути значков — в ленивом чанке channelGlyphs.ts. */
export const CHANNEL_BRANDS = [
  'Telegram',
  'WhatsApp',
  'Instagram',
  'Facebook Messenger',
  'Facebook',
  'VK',
  'Viber',
  'WeChat',
  'LINE',
] as const;

export type ChannelBrand = (typeof CHANNEL_BRANDS)[number];

export function isChannelBrand(name: string): name is ChannelBrand {
  return (CHANNEL_BRANDS as readonly string[]).includes(name);
}
