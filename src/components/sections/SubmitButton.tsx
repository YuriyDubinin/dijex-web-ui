import { AnimatePresence, motion } from 'framer-motion';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';

export type SubmitPhase = 'idle' | 'submitting' | 'success';

type Props = {
  phase: SubmitPhase;
  disabled: boolean;
  label: string;
  submittingLabel: string;
};

/**
 * Кнопка отправки, которая «морфит»: во время отправки сжимается в круг с вращающимся
 * градиентным кольцом, при успехе круг становится галочкой.
 */
export function SubmitButton({ phase, disabled, label, submittingLabel }: Props) {
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const compact = phase !== 'idle' && animated;

  return (
    <motion.button
      type="submit"
      layout={animated}
      disabled={disabled}
      aria-disabled={disabled}
      aria-live="polite"
      transition={SPRING.soft}
      style={{ borderRadius: compact ? 999 : 12 }}
      className={cn(
        'group/btn relative isolate inline-flex h-14 items-center justify-center overflow-hidden bg-accent-primary font-semibold text-white transition-[box-shadow,opacity] duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        'disabled:cursor-not-allowed disabled:opacity-50',
        compact ? 'w-14 px-0' : 'w-full px-7 hover:shadow-glow sm:w-auto',
        phase === 'success' && 'bg-success',
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'idle' || !animated ? (
          <motion.span
            key="label"
            className="relative z-10 whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast }}
          >
            {phase === 'submitting' ? submittingLabel : label}
          </motion.span>
        ) : phase === 'submitting' ? (
          <motion.span
            key="spinner"
            className="relative z-10 flex h-7 w-7 items-center justify-center"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: DURATION.fast }}
          >
            <span className="sr-only">{submittingLabel}</span>
            <span
              aria-hidden
              className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent,rgb(255_255_255/0.95))] [animation-duration:0.9s] [mask:radial-gradient(farthest-side,transparent_calc(100%-3px),#000_calc(100%-2px))]"
            />
          </motion.span>
        ) : (
          <motion.svg
            key="check"
            aria-hidden
            viewBox="0 0 24 24"
            className="relative z-10 h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 12.5 10 17.5 19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: DURATION.base, ease: EASE.outExpo }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
