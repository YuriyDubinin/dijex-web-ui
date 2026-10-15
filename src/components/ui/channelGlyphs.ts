import {
  siFacebook,
  siInstagram,
  siLine,
  siMessenger,
  siTelegram,
  siViber,
  siVk,
  siWechat,
  siWhatsapp,
} from 'simple-icons';
import type { ChannelBrand } from './channelBrands';

/** Пути значков из simple-icons (CC0). Грузится лениво — не входит в основной бандл. */
export const CHANNEL_GLYPHS: Record<ChannelBrand, { path: string; hex: string }> = {
  Telegram: siTelegram,
  WhatsApp: siWhatsapp,
  Instagram: siInstagram,
  'Facebook Messenger': siMessenger,
  Facebook: siFacebook,
  VK: siVk,
  Viber: siViber,
  WeChat: siWechat,
  LINE: siLine,
};
