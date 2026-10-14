import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { usePointerFine } from './hooks';
import { useMotionTier } from './tier';
import { cn } from '@/lib/cn';

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

/**
 * «Общий свет» для группы карточек: курсор подсвечивает поверхность карточки под ним и рамки соседних
 * со стороны курсора. Карточки помечаются data-spotlight и классом .spotlight (globals.css).
 * Один обработчик на группу, позиции карточек кэшируются (пересчёт на enter/scroll/resize).
 */
export function SpotlightGroup({ children, as: Tag = 'div', className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const enabled = tier === 'full' && pointerFine;

  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return undefined;

    let cards: { element: HTMLElement; rect: DOMRect }[] = [];
    let stale = true;
    let frame = 0;

    const measure = () => {
      cards = Array.from(root.querySelectorAll<HTMLElement>('[data-spotlight]')).map((element) => ({
        element,
        rect: element.getBoundingClientRect(),
      }));
      stale = false;
    };
    const invalidate = () => {
      stale = true;
    };

    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (stale) measure();
        for (const { element, rect } of cards) {
          element.style.setProperty('--mx', `${event.clientX - rect.left}px`);
          element.style.setProperty('--my', `${event.clientY - rect.top}px`);
          element.style.setProperty('--spot', '1');
        }
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      for (const { element } of cards) element.style.setProperty('--spot', '0');
    };

    root.addEventListener('pointerenter', invalidate);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener('pointerenter', invalidate);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
    };
  }, [enabled]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
