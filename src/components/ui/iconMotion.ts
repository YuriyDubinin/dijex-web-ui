import type { IconKey } from './iconMap';

/**
 * Микро-анимация иконки при наведении на родителя (.group). Только CSS — дёшево и без JS.
 * В prefers-reduced-motion отключается глобально (globals.css → .animate-micro-*).
 */
const MOTION: Partial<Record<IconKey, string>> = {
  bell: 'group-hover:animate-micro-wiggle',
  headset: 'group-hover:animate-micro-wiggle',
  wrench: 'group-hover:animate-micro-wiggle',
  keyRound: 'group-hover:animate-micro-wiggle',
  truck: 'group-hover:animate-micro-nudge',
  send: 'group-hover:animate-micro-takeoff',
  plane: 'group-hover:animate-micro-takeoff',
  stethoscope: 'group-hover:animate-micro-pulse',
  zap: 'group-hover:animate-micro-pulse',
  shieldCheck: 'group-hover:animate-micro-pop',
  userCheck: 'group-hover:animate-micro-pop',
  lock: 'group-hover:animate-micro-pop',
  eye: 'group-hover:animate-micro-pop',
  clock: 'group-hover:animate-micro-spin',
  repeat: 'group-hover:animate-micro-spin',
  route: 'group-hover:animate-micro-nudge',
  network: 'group-hover:animate-micro-spin',
  languages: 'group-hover:animate-micro-pop',
  layoutDashboard: 'group-hover:animate-micro-pop',
};

export function iconMotionClass(icon: IconKey): string {
  return MOTION[icon] ?? 'group-hover:animate-micro-lift';
}
