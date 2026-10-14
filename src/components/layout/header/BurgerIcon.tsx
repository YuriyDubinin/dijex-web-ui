import { motion } from 'framer-motion';
import { DURATION, EASE } from '@/motion/tokens';

const LINE = 'absolute left-0 h-[1.8px] w-full rounded-full bg-current';

/** Бургер, который морфит в крестик: крайние линии сходятся и поворачиваются, средняя схлопывается. */
export function BurgerIcon({ open }: { open: boolean }) {
  const transition = { duration: DURATION.base, ease: EASE.outExpo };
  return (
    <span aria-hidden className="relative block h-3.5 w-[18px]">
      <motion.span
        className={`${LINE} top-0`}
        animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={transition}
      />
      <motion.span
        className={`${LINE} top-1/2 -translate-y-1/2`}
        animate={open ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
        transition={transition}
      />
      <motion.span
        className={`${LINE} bottom-0`}
        animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={transition}
      />
    </span>
  );
}
