import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Icon } from './Icon';
import type { IconKey } from './iconMap';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Props = {
  selected?: boolean;
  icon?: IconKey;
  children: ReactNode;
} & Omit<HTMLMotionProps<'button'>, 'children'>;

/** Таблетка выбора с aria-pressed. */
export function Chip({
  selected = false,
  icon,
  children,
  className,
  type = 'button',
  ...rest
}: Props) {
  return (
    <motion.button
      type={type}
      aria-pressed={selected}
      whileTap={{ scale: 0.95 }}
      animate={selected ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={{ duration: DURATION.base, ease: EASE.outExpo }}
      className={cn(
        'inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 py-2 text-small font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        selected
          ? 'border-accent-primary bg-accent-primary/10 text-text-primary shadow-glow'
          : 'border-border bg-bg-surface/60 text-text-secondary hover:border-accent-primary/50 hover:text-text-primary',
        className,
      )}
      {...rest}
    >
      {icon ? (
        <Icon
          name={icon}
          size={16}
          className={selected ? 'text-accent-primary' : 'text-text-muted'}
        />
      ) : null}
      {children}
    </motion.button>
  );
}
