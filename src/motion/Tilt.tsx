import { useRef, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { usePointerFine } from './hooks';
import { useMotionTier } from './tier';
import { SPRING_VALUE } from './tokens';
import { cn } from '@/lib/cn';

type Props = {
  children: ReactNode;
  /** Максимальный угол наклона, градусы. */
  max?: number;
  /** Глянцевый блик, следующий за курсором. */
  glare?: boolean;
  className?: string;
};

/**
 * 3D-наклон карточки за курсором (±max°) с пружиной и бликом. Только мышь и уровень full —
 * иначе рендерит обычный div без обработчиков.
 */
export function Tilt({ children, max = 6, glare = true, className }: Props) {
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rotateX = useSpring(useMotionValue(0), SPRING_VALUE.tilt);
  const rotateY = useSpring(useMotionValue(0), SPRING_VALUE.tilt);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useSpring(useMotionValue(0), SPRING_VALUE.soft);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.12), transparent 55%)`;

  if (tier !== 'full' || !pointerFine) {
    return <div className={className}>{children}</div>;
  }

  const onEnter = () => {
    rectRef.current = ref.current?.getBoundingClientRect() ?? null;
    glareOpacity.set(1);
  };
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = rectRef.current ?? ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * max * 2);
    rotateX.set(-(py - 0.5) * max * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };
  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
    rectRef.current = null;
  };

  return (
    <div className={cn('[perspective:1000px]', className)}>
      <motion.div
        ref={ref}
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full rounded-[inherit]"
      >
        {children}
        {glare ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
            style={{ background: glareBackground, opacity: glareOpacity }}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
