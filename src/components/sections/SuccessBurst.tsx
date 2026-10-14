import { motion } from 'framer-motion';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';

const PARTICLES = 12;

/** Галочка успеха: частицы со всех сторон сходятся в центр, затем рисуется галочка в кольце. */
export function SuccessBurst() {
  const tier = useMotionTier();
  const animated = tier !== 'off';

  return (
    <div aria-hidden className="relative flex h-20 w-20 items-center justify-center">
      {animated
        ? Array.from({ length: PARTICLES }, (_, index) => {
            const angle = (index / PARTICLES) * Math.PI * 2;
            return (
              <motion.span
                key={index}
                className="absolute h-1.5 w-1.5 rounded-full bg-success"
                initial={{ x: Math.cos(angle) * 70, y: Math.sin(angle) * 70, opacity: 0, scale: 1 }}
                animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: 0.4 }}
                transition={{ duration: DURATION.slow, ease: EASE.inOut, delay: index * 0.015 }}
              />
            );
          })
        : null}
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90 text-success">
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-40"
          initial={animated ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: DURATION.slow, ease: EASE.outExpo, delay: 0.45 }}
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="absolute h-10 w-10 text-success"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M5 12.5 10 17.5 19 7"
          initial={animated ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: DURATION.base, ease: EASE.outExpo, delay: 0.7 }}
        />
      </svg>
      <motion.span
        className="absolute inset-0 rounded-full bg-success/20 blur-xl"
        initial={animated ? { opacity: 0, scale: 0.5 } : false}
        animate={{ opacity: 1, scale: 1.2 }}
        transition={{ duration: DURATION.reveal, delay: 0.5 }}
      />
    </div>
  );
}
