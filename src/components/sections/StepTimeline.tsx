import { useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { revealItemVariants } from '@/components/motion/variants';
import { useMotionTier } from '@/motion/tier';
import { SPRING_VALUE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Step = { id: string; content: ReactNode };

type Props = {
  steps: readonly Step[];
  /** Ширина, с которой шаги выстраиваются в горизонтальную линию. */
  horizontalFrom?: 'md' | 'lg' | 'xl';
  className?: string;
};

/** Линия-связь, заполняемая по прогрессу (0..1), со светящимся «пакетом» на конце. */
export function ProgressConnector({
  direction,
  progress,
}: {
  direction: 'horizontal' | 'vertical';
  progress: MotionValue<number>;
}) {
  const horizontal = direction === 'horizontal';
  const tip = useTransform(progress, (value) => `${value * 100}%`);

  return (
    <div aria-hidden className="relative h-full w-full">
      <div className="absolute inset-0 bg-border/50" />
      <motion.div
        className={cn(
          'absolute inset-0 from-accent-primary via-accent-glow to-accent-secondary',
          horizontal ? 'origin-left bg-gradient-to-r' : 'origin-top bg-gradient-to-b',
        )}
        style={horizontal ? { scaleX: progress } : { scaleY: progress }}
      />
      <motion.span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-secondary shadow-[0_0_14px_3px_rgb(var(--accent-secondary)/0.6)]"
        style={horizontal ? { left: tip, top: '50%' } : { top: tip, left: '50%' }}
      />
    </div>
  );
}

const STEP_CARD =
  'group/step relative flex h-full flex-col gap-3 rounded-2xl border bg-bg-surface/80 p-6 backdrop-blur-sm transition-[border-color,box-shadow,opacity] duration-500';

/**
 * Шаги процесса: линия заполняется по мере прокрутки, и шаг «активируется», когда линия до него доходит.
 * На широких экранах — горизонтально за карточками, на узких — вертикально слева с точками.
 */
export function StepTimeline({ steps, horizontalFrom = 'lg', className }: Props) {
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });
  const progress = useSpring(scrollYProgress, SPRING_VALUE.soft);
  const [activeCount, setActiveCount] = useState(animated ? 0 : steps.length);

  useMotionValueEvent(progress, 'change', (value) => {
    if (!animated) return;
    const next = Math.min(steps.length, Math.floor(value * steps.length + 0.35));
    setActiveCount((current) => (current === next ? current : next));
  });

  const showHorizontal = { md: 'md:block', lg: 'lg:block', xl: 'xl:block' }[horizontalFrom];
  const hideVertical = { md: 'md:hidden', lg: 'lg:hidden', xl: 'xl:hidden' }[horizontalFrom];
  const lineProgress = animated ? progress : scrollYProgress;

  const cardClass = (index: number) => {
    const active = index < activeCount;
    return cn(
      STEP_CARD,
      active
        ? 'border-accent-primary/35 shadow-[0_0_50px_-20px_rgb(var(--accent-primary)/0.7)]'
        : 'border-border opacity-70',
    );
  };

  return (
    <div ref={ref} className={className}>
      {/* Горизонтально */}
      <div className={cn('relative hidden', showHorizontal)}>
        <div className="absolute left-0 right-0 top-12 h-px">
          {animated ? (
            <ProgressConnector direction="horizontal" progress={lineProgress} />
          ) : (
            <div className="h-full bg-gradient-to-r from-transparent via-accent-primary/60 to-transparent" />
          )}
        </div>
        <ScrollReveal
          className="relative grid auto-cols-[minmax(0,1fr)] grid-flow-col gap-4"
          staggerChildren={0.12}
          delayChildren={0.1}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={revealItemVariants}
              className={cardClass(index)}
              data-active={index < activeCount}
            >
              {step.content}
            </motion.div>
          ))}
        </ScrollReveal>
      </div>

      {/* Вертикально */}
      <div className={cn('relative', hideVertical)}>
        <div className="absolute bottom-0 left-6 top-0 w-px">
          {animated ? (
            <ProgressConnector direction="vertical" progress={lineProgress} />
          ) : (
            <div className="h-full bg-gradient-to-b from-transparent via-accent-primary/60 to-transparent" />
          )}
        </div>
        <ScrollReveal className="relative flex flex-col gap-5 pl-14" staggerChildren={0.1}>
          {steps.map((step, index) => (
            <motion.div key={step.id} variants={revealItemVariants} className="relative">
              <span
                aria-hidden
                className={cn(
                  'absolute -left-8 top-7 h-3 w-3 -translate-x-1/2 rounded-full border bg-bg-base transition-[border-color,box-shadow] duration-500',
                  index < activeCount
                    ? 'border-accent-secondary shadow-[0_0_12px_2px_rgb(var(--accent-secondary)/0.6)]'
                    : 'border-accent-primary/40',
                )}
              />
              <div className={cardClass(index)} data-active={index < activeCount}>
                {step.content}
              </div>
            </motion.div>
          ))}
        </ScrollReveal>
      </div>
    </div>
  );
}
