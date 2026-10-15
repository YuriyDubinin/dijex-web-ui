import { motion } from 'framer-motion';
import { DURATION, EASE } from '@/motion/tokens';
import { useVisual } from '../context';
import { TONE_RGB, type Tone } from './tones';

type Props = {
  d: string;
  /** Провод «под током»: поверх базовой линии прорисовывается светящаяся. */
  active?: boolean;
  tone?: Tone;
  dashed?: boolean;
  /** Насколько заметна базовая линия. */
  baseOpacity?: number;
};

/**
 * Провод между узлами сцены (внутри общего <svg> сцены).
 * Подсветка — pathLength, без анимации SVG-атрибутов.
 */
export function Wire({
  d,
  active = false,
  tone = 'secondary',
  dashed = false,
  baseOpacity = 1,
}: Props) {
  const { animated, full } = useVisual();
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="rgb(var(--border))"
        strokeWidth={1.25}
        strokeDasharray={dashed ? '3 5' : undefined}
        opacity={baseOpacity}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={TONE_RGB[tone]}
        strokeWidth={1.75}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={
          animated
            ? {
                pathLength: { duration: DURATION.slow, ease: EASE.outExpo },
                opacity: { duration: DURATION.base },
              }
            : { duration: 0 }
        }
        style={full ? { filter: `drop-shadow(0 0 4px ${TONE_RGB[tone]})` } : undefined}
      />
    </g>
  );
}
