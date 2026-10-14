import { motion } from 'framer-motion';
import { Odometer } from '@/motion/Odometer';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Props = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  /** Крупный вариант — для блоков результатов. */
  size?: 'md' | 'lg';
  /** Доля 0..1 для тонкой линии-прогресса под числом (визуальный ритм). */
  progress?: number;
  className?: string;
};

/** Метрика: число прокручивается одометром при появлении, под ним заполняется линия. */
export function MetricCard({
  value,
  label,
  prefix = '',
  suffix = '',
  size = 'md',
  progress,
  className,
}: Props) {
  const tier = useMotionTier();

  return (
    <div
      data-spotlight
      className={cn(
        'spotlight flex h-full flex-col gap-1 rounded-2xl border border-border bg-bg-surface/60 backdrop-blur-sm',
        size === 'lg' ? 'p-6 md:p-7' : 'p-6',
        className,
      )}
    >
      <p
        className={cn(
          'font-display font-bold tabular-nums leading-none text-text-primary',
          size === 'lg' ? 'text-display' : 'text-h1',
        )}
      >
        <Odometer value={value} prefix={prefix} suffix={suffix} />
      </p>
      {progress !== undefined ? (
        <span aria-hidden className="mt-3 block h-px w-full overflow-hidden bg-border/60">
          <motion.span
            className="block h-full origin-left bg-gradient-to-r from-accent-primary to-accent-secondary"
            initial={tier === 'off' ? false : { scaleX: 0 }}
            whileInView={{ scaleX: Math.max(0.04, Math.min(1, progress)) }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.cinematic, ease: EASE.outExpo, delay: 0.3 }}
            style={tier === 'off' ? { scaleX: progress } : undefined}
          />
        </span>
      ) : null}
      <p className="mt-1 text-small text-text-secondary">{label}</p>
    </div>
  );
}
