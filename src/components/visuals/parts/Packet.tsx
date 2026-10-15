import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import type { Tone } from './tones';

type Props = {
  /** Путь в координатах сцены — тот же, что у провода. */
  d: string;
  /** Секунды на один проход. */
  duration?: number;
  delay?: number;
  /** Бесконечно (поток) или один раз (событие; повтор — сменой key). */
  loop?: boolean;
  tone?: Tone;
  size?: number;
};

const TONE_CLASS: Record<Tone, string> = {
  primary: 'bg-accent-primary shadow-[0_0_10px_2px_rgb(var(--accent-primary)/0.8)]',
  secondary: 'bg-accent-secondary shadow-[0_0_10px_2px_rgb(var(--accent-secondary)/0.8)]',
  glow: 'bg-accent-glow shadow-[0_0_10px_2px_rgb(var(--accent-glow)/0.8)]',
  success: 'bg-success shadow-[0_0_10px_2px_rgb(var(--success)/0.8)]',
};

/** Пакет данных: светящаяся точка едет по проводу (CSS offset-path — без JS на кадр). */
export function Packet({
  d,
  duration = 0.8,
  delay = 0,
  loop = false,
  tone = 'secondary',
  size = 6,
}: Props) {
  const { animated } = useVisual();
  if (!animated) return null;
  return (
    <span
      className={cn(
        'pointer-events-none absolute left-0 top-0 rounded-full',
        loop ? 'animate-travel-loop' : 'animate-travel',
        TONE_CLASS[tone],
      )}
      style={
        {
          width: size,
          height: size,
          offsetPath: `path('${d}')`,
          offsetRotate: '0deg',
          '--travel-duration': `${duration}s`,
          '--travel-delay': `${delay}s`,
        } as CSSProperties
      }
    />
  );
}
