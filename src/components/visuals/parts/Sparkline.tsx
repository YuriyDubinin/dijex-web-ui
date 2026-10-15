import { useId } from 'react';
import { motion } from 'framer-motion';
import { DURATION, EASE } from '@/motion/tokens';
import { useVisual } from '../context';
import { TONE_RGB, type Tone } from './tones';

type Props = {
  values: readonly number[];
  width: number;
  height: number;
  tone?: Tone;
  /** Меняется при добавлении точки — график плавно сдвигается на шаг влево. */
  tick?: number;
  /** Нижняя и верхняя границы шкалы (по умолчанию — min/max значений). */
  domain?: readonly [number, number];
};

/** Мини-график: линия, мягкая заливка под ней и точка последнего значения. */
export function Sparkline({ values, width, height, tone = 'secondary', tick = 0, domain }: Props) {
  const { animated } = useVisual();
  const gradientId = useId();
  const min = domain?.[0] ?? Math.min(...values);
  const max = domain?.[1] ?? Math.max(...values);
  const span = max - min || 1;
  const step = width / Math.max(1, values.length - 1);
  const pad = 3;
  const points = values.map(
    (value, index) =>
      [index * step, pad + (1 - (value - min) / span) * (height - pad * 2)] as const,
  );
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `0,${height} ${line} ${width},${height}`;
  const last = points[points.length - 1] ?? [width, height / 2];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TONE_RGB[tone]} stopOpacity="0.35" />
          <stop offset="100%" stopColor={TONE_RGB[tone]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.g
        key={tick}
        initial={animated ? { x: step } : false}
        animate={{ x: 0 }}
        transition={{ duration: animated ? DURATION.slow : 0, ease: EASE.outExpo }}
      >
        <polygon points={area} fill={`url(#${gradientId})`} />
        <polyline
          points={line}
          fill="none"
          stroke={TONE_RGB[tone]}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </motion.g>
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={TONE_RGB[tone]} />
      <circle cx={last[0]} cy={last[1]} r={5} fill={TONE_RGB[tone]} opacity={0.25} />
    </svg>
  );
}
