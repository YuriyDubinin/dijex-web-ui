import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Container } from './Container';
import { SectionDivider } from './SectionDivider';
import { usePointerFine } from '@/motion/hooks';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Props = {
  id: string;
  children: ReactNode;
  /** Тонкая линия-разделитель сверху (со световым лучом при появлении). */
  divider?: boolean;
  /** Лёгкая подложка на всю ширину — для смены ритма между секциями. */
  tinted?: boolean;
  labelledBy?: string;
  className?: string;
  containerClassName?: string;
};

/**
 * Секция: якорь с отступом под sticky-хедер, разделитель-луч, подложка, раскрывающаяся от центра,
 * и сетка, подсвеченная «фонариком» вокруг курсора (только full + мышь).
 */
export function Section({
  id,
  children,
  divider,
  tinted,
  labelledBy,
  className,
  containerClassName,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const flashlight = tinted && tier === 'full' && pointerFine;

  useEffect(() => {
    const section = ref.current;
    if (!section || !flashlight) return undefined;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = section.getBoundingClientRect();
        section.style.setProperty('--gx', `${event.clientX - rect.left}px`);
        section.style.setProperty('--gy', `${event.clientY - rect.top}px`);
      });
    };
    section.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener('pointermove', onMove);
    };
  }, [flashlight]);

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={cn('group/section relative scroll-mt-20 py-24 md:py-32', className)}
    >
      {tinted ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-bg-surface/30"
          initial={tier === 'off' ? false : { clipPath: 'circle(0% at 50% 50%)' }}
          whileInView={{ clipPath: 'circle(75% at 50% 50%)' }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: DURATION.cinematic, ease: EASE.outExpo }}
        />
      ) : null}
      {flashlight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-0 transition-opacity duration-500 group-hover/section:opacity-100 [mask-image:radial-gradient(260px_circle_at_var(--gx,50%)_var(--gy,50%),#000,transparent_70%)]"
        />
      ) : null}
      {divider ? <SectionDivider /> : null}
      <Container className={cn('relative', containerClassName)}>{children}</Container>
    </section>
  );
}
