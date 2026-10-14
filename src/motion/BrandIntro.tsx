import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIntro } from './intro';
import { DURATION, EASE } from './tokens';

/** Длительность интро до начала ухода слоя, мс. */
const HOLD_MS = 700;

/**
 * Интро бренда (≤ 1 с, один раз за сессию, только уровень full): wordmark проявляется из маски,
 * под ним «заряжается» линия, затем слой уходит круговой маской, открывая уже отрисованный сайт.
 * Любое действие пользователя завершает интро мгновенно.
 */
export function BrandIntro() {
  const { playing, finish } = useIntro();

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(finish, HOLD_MS);
    const interrupt = () => finish();
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    events.forEach((name) =>
      window.addEventListener(name, interrupt, { passive: true, once: true }),
    );
    return () => {
      window.clearTimeout(timer);
      events.forEach((name) => window.removeEventListener(name, interrupt));
    };
  }, [playing, finish]);

  return (
    <AnimatePresence>
      {playing ? (
        <motion.div
          key="brand-intro"
          aria-hidden
          className="fixed inset-0 z-[70] flex items-center justify-center bg-bg-base"
          initial={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ clipPath: 'circle(0% at 50% 50%)' }}
          transition={{ duration: DURATION.base, ease: EASE.inOut }}
        >
          <div className="absolute inset-0 bg-hero-mesh opacity-60" />
          <motion.div
            className="relative flex flex-col items-center gap-4"
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: DURATION.fast }}
          >
            <span className="overflow-hidden pb-1">
              <motion.span
                className="block font-display text-5xl font-bold tracking-tight text-text-primary md:text-6xl"
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: DURATION.base, ease: EASE.outExpo }}
              >
                Dijex
              </motion.span>
            </span>
            <span className="relative block h-px w-40 overflow-hidden">
              <motion.span
                className="absolute inset-0 origin-left bg-gradient-to-r from-accent-primary to-accent-secondary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.15, ease: EASE.outExpo }}
              />
              <motion.span
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent"
                initial={{ x: '-120%' }}
                animate={{ x: '360%' }}
                transition={{ duration: 0.45, delay: 0.4, ease: EASE.inOut }}
              />
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
