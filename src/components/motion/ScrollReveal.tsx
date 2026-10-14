import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMotionTier } from '@/motion/tier';
import { STAGGER } from '@/motion/tokens';

export type ScrollRevealProps = {
  children: ReactNode;
  /** Пауза между анимациями детей при stagger. */
  staggerChildren?: number;
  /** Начальная задержка для всего контейнера. */
  delayChildren?: number;
  className?: string;
} & Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'variants' | 'viewport' | 'children'>;

/**
 * Контейнер для stagger-появления. Дочерние motion-элементы используют
 * revealItemVariants / waveItemVariants (ключи 'hidden' / 'visible').
 * В режиме off рендерится без анимаций.
 */
export function ScrollReveal({
  children,
  staggerChildren = STAGGER.cards,
  delayChildren = 0,
  className,
  ...rest
}: ScrollRevealProps) {
  const tier = useMotionTier();

  if (tier === 'off') {
    return (
      <div className={className} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  const variants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -10% 0px' }}
      variants={variants}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
