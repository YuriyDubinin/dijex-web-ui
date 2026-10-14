import type { Variants } from 'framer-motion';
import { DISTANCE, DURATION, EASE } from '@/motion/tokens';

/**
 * Стандартный набор variants для дочерних элементов внутри <ScrollReveal>.
 * Используется для stagger-появления карточек, списков и т. п.
 */
export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: DISTANCE.reveal },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.brand },
  },
};

/**
 * Появление с собственной задержкой (custom = секунды) — для «волны» по сетке
 * (gridWaveDelay / gridRadialDelay из @/motion/tokens).
 */
export const waveItemVariants: Variants = {
  hidden: { opacity: 0, y: DISTANCE.reveal, scale: 0.98 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE.outExpo, delay },
  }),
};
