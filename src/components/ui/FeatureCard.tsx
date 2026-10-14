import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import type { IconKey } from './iconMap';
import { revealItemVariants, waveItemVariants } from '@/components/motion/variants';
import { iconMotionClass } from './iconMotion';
import { cn } from '@/lib/cn';

type Tone = 'primary' | 'secondary' | 'glow';

type Props = {
  icon: IconKey;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  tone?: Tone;
  /** Компактный вариант: меньше отступы и иконка. */
  compact?: boolean;
  /** Собственная задержка появления (секунды) — для «волны» по сетке (gridWaveDelay). */
  waveDelay?: number;
  /** view-transition-name иконки — для «перелёта» между страницами. */
  iconTransitionName?: string;
  className?: string;
};

const TONE_CLASSES: Record<Tone, string> = {
  primary: 'border-accent-primary/20 bg-accent-primary/10 text-accent-primary',
  secondary: 'border-accent-secondary/20 bg-accent-secondary/10 text-accent-secondary',
  glow: 'border-accent-glow/20 bg-accent-glow/10 text-accent-glow',
};

/** Карточка возможности: иконка, заголовок, описание, необязательная ссылка. Для stagger внутри ScrollReveal. */
export function FeatureCard({
  icon,
  title,
  description,
  href,
  linkLabel,
  tone = 'primary',
  compact = false,
  waveDelay,
  iconTransitionName,
  className,
}: Props) {
  return (
    <motion.article
      variants={waveDelay === undefined ? revealItemVariants : waveItemVariants}
      custom={waveDelay}
      data-spotlight
      className={cn(
        'spotlight group relative flex h-full flex-col rounded-2xl border border-border bg-bg-surface/60 backdrop-blur-sm',
        'transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-accent-primary/40 hover:shadow-glow',
        compact ? 'gap-3 p-5' : 'gap-4 p-6',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-glow-corner opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
      />
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl border',
          compact ? 'h-10 w-10' : 'h-12 w-12',
          TONE_CLASSES[tone],
        )}
        style={iconTransitionName ? { viewTransitionName: iconTransitionName } : undefined}
      >
        <Icon name={icon} size={compact ? 18 : 22} className={iconMotionClass(icon)} />
      </div>
      <div className="flex flex-col gap-2">
        <h3
          className={cn(
            'font-display font-semibold text-text-primary',
            compact ? 'text-lg leading-snug' : 'text-h3',
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'leading-relaxed text-text-secondary',
            compact ? 'text-small' : 'text-body',
          )}
        >
          {description}
        </p>
      </div>
      {href && linkLabel ? (
        <Link
          viewTransition
          to={href}
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-small font-medium text-accent-primary transition-colors hover:text-accent-secondary"
        >
          {linkLabel}
          <ArrowUpRight
            size={16}
            aria-hidden
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </motion.article>
  );
}
