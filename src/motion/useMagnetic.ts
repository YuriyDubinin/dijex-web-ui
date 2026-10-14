import { useEffect, type RefObject } from 'react';
import { animate, useMotionValue } from 'framer-motion';
import { usePointerFine } from './hooks';
import { useMotionTier } from './tier';
import { SPRING_VALUE } from './tokens';

type Options = {
  /** Доля расстояния до курсора, на которую смещается элемент. */
  strength?: number;
  /** Радиус притяжения вокруг элемента, px. */
  radius?: number;
  enabled?: boolean;
};

/**
 * «Магнитный» элемент: тянется к курсору, когда тот рядом, и пружиной возвращается.
 * Пишет CSS-переменные --mag-x / --mag-y — их использует класс .magnetic (globals.css),
 * поэтому работает с любым элементом без motion-обёртки. Только мышь и уровень full.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement>,
  { strength = 0.3, radius = 90, enabled = true }: Options = {},
) {
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const active = enabled && tier === 'full' && pointerFine;

  useEffect(() => {
    const element = ref.current;
    if (!element || !active) return undefined;

    let frame = 0;
    let attracted = false;
    const unsubscribeX = x.on('change', (value) =>
      element.style.setProperty('--mag-x', `${value}px`),
    );
    const unsubscribeY = y.on('change', (value) =>
      element.style.setProperty('--mag-y', `${value}px`),
    );

    const release = () => {
      if (!attracted) return;
      attracted = false;
      animate(x, 0, SPRING_VALUE.magnetic);
      animate(y, 0, SPRING_VALUE.magnetic);
    };

    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const reachX = rect.width / 2 + radius;
        const reachY = rect.height / 2 + radius;
        if (Math.abs(dx) > reachX || Math.abs(dy) > reachY) {
          release();
          return;
        }
        attracted = true;
        animate(x, dx * strength, SPRING_VALUE.magnetic);
        animate(y, dy * strength, SPRING_VALUE.magnetic);
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', release);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', release);
      unsubscribeX();
      unsubscribeY();
      element.style.removeProperty('--mag-x');
      element.style.removeProperty('--mag-y');
    };
  }, [ref, active, strength, radius, x, y]);

  return active;
}
