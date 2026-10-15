export type Tone = 'primary' | 'secondary' | 'glow' | 'success';

/** Цвета токенов для SVG (stroke/fill). */
export const TONE_RGB: Record<Tone, string> = {
  primary: 'rgb(var(--accent-primary))',
  secondary: 'rgb(var(--accent-secondary))',
  glow: 'rgb(var(--accent-glow))',
  success: 'rgb(var(--success))',
};
