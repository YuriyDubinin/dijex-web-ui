import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { Reveal, type RevealVariant } from '@/motion/Reveal';
import { DURATION } from '@/motion/tokens';

export type FadeInProps = {
  children: ReactNode;
  /** Задержка перед стартом, в секундах. */
  delay?: number;
  /** Длительность анимации, в секундах. */
  duration?: number;
  /** Если true — анимация запускается на mount, иначе при появлении в viewport. */
  immediate?: boolean;
  variant?: RevealVariant;
  className?: string;
} & Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'whileInView' | 'transition' | 'children' | 'variants'
>;

/** Совместимая обёртка над Reveal (fade-up). */
export function FadeIn({
  children,
  delay = 0,
  duration = DURATION.slow,
  immediate = false,
  variant = 'fade-up',
  className,
  ...rest
}: FadeInProps) {
  return (
    <Reveal
      variant={variant}
      delay={delay}
      duration={duration}
      immediate={immediate}
      className={className}
      {...rest}
    >
      {children}
    </Reveal>
  );
}
