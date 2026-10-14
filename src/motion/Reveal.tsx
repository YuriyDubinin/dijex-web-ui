import type { ElementType, ReactNode } from 'react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { useMotionTier } from './tier';
import { DISTANCE, DURATION, EASE } from './tokens';

export type RevealVariant = 'fade-up' | 'fade' | 'blur-up' | 'clip-up' | 'scale-in';

const VARIANTS: Record<RevealVariant, Variants> = {
  'fade-up': { hidden: { opacity: 0, y: DISTANCE.reveal }, visible: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  'blur-up': {
    hidden: { opacity: 0, y: DISTANCE.small, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  'clip-up': {
    hidden: { clipPath: 'inset(100% 0% 0% 0% round 16px)', y: DISTANCE.reveal },
    visible: { clipPath: 'inset(0% 0% 0% 0% round 16px)', y: 0 },
  },
  'scale-in': { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } },
};

/** В lite размытие заменяем обычным появлением — blur дорогой на слабых GPU. */
const LITE_FALLBACK: Partial<Record<RevealVariant, RevealVariant>> = { 'blur-up': 'fade-up' };

type Tag = 'div' | 'section' | 'article' | 'li' | 'ul' | 'p' | 'span' | 'figure';

export type RevealProps = {
  children?: ReactNode;
  as?: Tag;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  /** Анимация при монтировании, а не при появлении в viewport. */
  immediate?: boolean;
  amount?: number;
  className?: string;
} & Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'whileInView' | 'variants' | 'children'>;

/** Появление блока при входе в viewport. Единый паттерн для всего сайта. */
export function Reveal({
  children,
  as = 'div',
  variant = 'fade-up',
  delay = 0,
  duration = DURATION.slow,
  immediate = false,
  amount = 0.25,
  className,
  transition,
  ...rest
}: RevealProps) {
  const tier = useMotionTier();

  if (tier === 'off') {
    const Plain = as as ElementType;
    return (
      <Plain className={className} {...(rest as Record<string, unknown>)}>
        {children}
      </Plain>
    );
  }

  const resolved = tier === 'lite' ? (LITE_FALLBACK[variant] ?? variant) : variant;
  const Component = motion[as] as typeof motion.div;
  const timing = { duration, delay, ease: EASE.outExpo, ...transition };

  return (
    <Component
      className={className}
      variants={VARIANTS[resolved]}
      initial="hidden"
      {...(immediate
        ? { animate: 'visible' }
        : {
            whileInView: 'visible',
            viewport: { once: true, amount, margin: '0px 0px -10% 0px' },
          })}
      transition={timing}
      {...rest}
    >
      {children}
    </Component>
  );
}
