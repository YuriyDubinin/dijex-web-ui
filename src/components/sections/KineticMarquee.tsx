import { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useActiveInViewport, useLoopDebug, useScrollVelocity } from '@/motion/hooks';
import { SPRING_VALUE } from '@/motion/tokens';

/** Зацикливание значения в диапазоне [min, max). */
const wrap = (min: number, max: number, value: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

type Props = {
  items: readonly string[];
  /** 1 — влево, −1 — вправо. */
  direction?: 1 | -1;
  /** Базовая скорость, % ширины ленты в секунду. */
  speed?: number;
  label?: string;
};

function Pills({ items, hidden }: { items: readonly string[]; hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-3 pr-3">
      {items.map((name) => (
        <li
          key={name}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-bg-surface/60 px-5 py-2.5 text-body font-medium text-text-secondary backdrop-blur-sm transition-colors duration-300 hover:border-accent-primary/50 hover:text-text-primary hover:shadow-glow"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
          {name}
        </li>
      ))}
    </ul>
  );
}

/**
 * Бегущая строка, реагирующая на прокрутку: при быстром скролле ускоряется (до 3×) и наклоняется
 * по направлению, затем пружиной возвращается; при наведении замедляется до 0.2×.
 * Работает на motion values (без ререндеров), стоит на паузе вне экрана.
 */
export function KineticMarquee({ items, direction = 1, speed = 1.25, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useActiveInViewport(ref);
  useLoopDebug('kinetic-marquee', active);
  const baseX = useMotionValue(0);
  const hoverFactor = useSpring(1, SPRING_VALUE.soft);
  const velocity = useScrollVelocity();
  const boost = useTransform(velocity, [-2500, 0, 2500], [2, 0, 2], { clamp: true });
  const skewX = useSpring(
    useTransform(velocity, [-2500, 2500], [6, -6], { clamp: true }),
    SPRING_VALUE.soft,
  );
  const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (!active) return;
    const step = direction * speed * (delta / 1000) * hoverFactor.get();
    baseX.set(baseX.get() - step * (1 + boost.get()));
  });

  return (
    <div
      ref={ref}
      className="relative overflow-hidden py-1"
      onPointerEnter={() => hoverFactor.set(0.2)}
      onPointerLeave={() => hoverFactor.set(1)}
    >
      <motion.div className="flex w-max" style={{ x, skewX }}>
        <div aria-label={label} role="group" className="flex">
          <Pills items={items} />
        </div>
        <Pills items={items} hidden />
      </motion.div>
    </div>
  );
}
