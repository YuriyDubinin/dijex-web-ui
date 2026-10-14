import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimate } from 'framer-motion';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

export type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
};

/** Поле формы: подпись, подсказка, ошибка. Появление ошибки — короткий «сдвиг» поля и текст из-под маски. */
export function Field({ label, htmlFor, error, required, hint, className, children }: FieldProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!error || !animated || !scope.current) return;
    void animate(scope.current, { x: [0, -4, 4, -2, 0] }, { duration: 0.3, ease: 'easeOut' });
  }, [error, animated, animate, scope]);

  return (
    <div ref={scope} className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-small font-medium text-text-secondary">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-danger">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-small text-text-muted">
          {hint}
        </p>
      )}

      {children}

      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-small text-danger"
            initial={animated ? { clipPath: 'inset(0 0 100% 0)', y: -4 } : false}
            animate={{ clipPath: 'inset(0 0 0% 0)', y: 0 }}
            exit={animated ? { opacity: 0 } : undefined}
            transition={{ duration: DURATION.base, ease: EASE.outExpo }}
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
