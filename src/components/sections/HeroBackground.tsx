import { motion } from 'framer-motion';
import { useMotionTier } from '@/motion/tier';

type Orb = {
  id: string;
  color: string;
  size: number;
  initial: { x: string; y: string };
  keyframes: { x: string[]; y: string[] };
  duration: number;
  blur: number;
  opacity: number;
};

const ORBS: Orb[] = [
  {
    id: 'orb-1',
    color: 'rgb(var(--accent-primary))',
    size: 600,
    initial: { x: '-10%', y: '-20%' },
    keyframes: { x: ['-10%', '15%', '-5%', '-10%'], y: ['-20%', '5%', '25%', '-20%'] },
    duration: 22,
    blur: 120,
    opacity: 0.18,
  },
  {
    id: 'orb-2',
    color: 'rgb(var(--accent-secondary))',
    size: 500,
    initial: { x: '60%', y: '10%' },
    keyframes: { x: ['60%', '40%', '70%', '60%'], y: ['10%', '40%', '-5%', '10%'] },
    duration: 18,
    blur: 100,
    opacity: 0.15,
  },
  {
    id: 'orb-3',
    color: 'rgb(var(--accent-glow))',
    size: 400,
    initial: { x: '20%', y: '60%' },
    keyframes: { x: ['20%', '50%', '10%', '20%'], y: ['60%', '30%', '70%', '60%'] },
    duration: 26,
    blur: 90,
    opacity: 0.12,
  },
  {
    id: 'orb-4',
    color: 'rgb(var(--accent-primary))',
    size: 300,
    initial: { x: '80%', y: '70%' },
    keyframes: { x: ['80%', '65%', '85%', '80%'], y: ['70%', '50%', '80%', '70%'] },
    duration: 20,
    blur: 80,
    opacity: 0.1,
  },
];

type Props = {
  /** Облегчённый вариант для внутренних страниц: два орба вместо четырёх. */
  compact?: boolean;
};

export function HeroBackground({ compact = false }: Props) {
  const prefersReducedMotion = useMotionTier() === 'off';
  const orbs = compact ? ORBS.slice(0, 2) : ORBS;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Radial mesh gradient base */}
      <div className="absolute inset-0 bg-hero-mesh" />

      {/* Floating orbs */}
      {orbs.map((orb) =>
        prefersReducedMotion ? (
          <div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.initial.x,
              top: orb.initial.y,
              background: orb.color,
              filter: `blur(${orb.blur}px)`,
              opacity: orb.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ) : (
          <motion.div
            key={orb.id}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: 0,
              top: 0,
              background: orb.color,
              filter: `blur(${orb.blur}px)`,
              opacity: orb.opacity,
              x: orb.initial.x,
              y: orb.initial.y,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{ x: orb.keyframes.x, y: orb.keyframes.y }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ),
      )}

      {/* SVG dot grid */}
      <div className="absolute inset-0 bg-dot-grid" />

      {/* Subtle top-edge glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-edge-glow" />
    </div>
  );
}
