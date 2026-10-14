import { motion } from 'framer-motion';
import { useMotionTier } from './tier';
import { DURATION, EASE } from './tokens';
import { cn } from '@/lib/cn';

type Props = {
  size?: number;
  delay?: number;
  className?: string;
};

/** Галочка, которая «прорисовывается» при появлении в viewport. */
export function DrawCheck({ size = 16, delay = 0, className }: Props) {
  const tier = useMotionTier();
  const animated = tier !== 'off';

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
    >
      <motion.path
        d="M3 8.5 6.4 11.8 13 4.6"
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: DURATION.slow, ease: EASE.outExpo, delay }}
      />
    </svg>
  );
}
