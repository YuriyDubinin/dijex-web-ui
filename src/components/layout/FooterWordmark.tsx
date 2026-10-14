import { useRef, type PointerEvent } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { usePointerFine } from '@/motion/hooks';
import { useMotionTier } from '@/motion/tier';
import { SPRING_VALUE } from '@/motion/tokens';

const WORD = 'DIJEX';
const TYPE =
  'select-none font-display text-[clamp(4.5rem,19vw,17rem)] font-bold leading-[0.8] tracking-tighter';

/**
 * Огромный wordmark под футером: контурный текст заливается градиентом снизу вверх
 * по мере прокрутки к концу страницы; «фонарик» за курсором подсвечивает контур.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const fill = useSpring(scrollYProgress, SPRING_VALUE.soft);
  const clipPath = useTransform(fill, (value) => `inset(${(1 - value) * 100}% 0% 0% 0%)`);
  const animated = tier !== 'off';
  const flashlight = tier === 'full' && pointerFine;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!flashlight) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--wx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--wy', `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      aria-hidden
      onPointerMove={onPointerMove}
      className="group/wordmark relative mt-16 overflow-hidden text-center"
    >
      {/* Контур */}
      <div className={`${TYPE} text-transparent [-webkit-text-stroke:1px_rgb(var(--border))]`}>
        {WORD}
      </div>
      {/* Заливка по прокрутке */}
      <motion.div
        className={`${TYPE} text-gradient absolute inset-0`}
        style={animated ? { clipPath } : undefined}
      >
        {WORD}
      </motion.div>
      {/* «Фонарик» по контуру */}
      {flashlight ? (
        <div
          className={`${TYPE} pointer-events-none absolute inset-0 text-transparent opacity-0 transition-opacity duration-500 [-webkit-text-stroke:1.5px_rgb(var(--accent-secondary))] [mask-image:radial-gradient(220px_circle_at_var(--wx,50%)_var(--wy,50%),#000,transparent_70%)] group-hover/wordmark:opacity-100`}
        >
          {WORD}
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg-base to-transparent" />
    </div>
  );
}
