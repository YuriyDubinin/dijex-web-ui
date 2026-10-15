import {
  Component,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import type { VisualKey } from '@/content/visualSlots';
import { useActiveInViewport, useLoopDebug, usePointerFine } from '@/motion/hooks';
import { useMotionTier } from '@/motion/tier';
import { SPRING_VALUE } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { VisualContext, VisualControlContext, type VisualState } from './context';
import { VISUALS, getVisualComponent } from './registry';

type Props = {
  visual: VisualKey;
  /** Доступное имя сцены (alt места под картинку). */
  label: string;
  /** Первый экран: чанк грузится сразу, без ожидания приближения к viewport. */
  priority?: boolean;
};

/** Чанк начинает грузиться заранее — за 400px до появления места на экране. */
function useNearViewport(ref: RefObject<Element>, eager: boolean): boolean {
  const [near, setNear] = useState(eager);
  useEffect(() => {
    if (near) return undefined;
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin: '400px 0px 400px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [near, ref]);
  return near;
}

/** Если чанк не загрузился (сеть), остаётся аккуратный скелет — страница не падает. */
class VisualErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Скелет-постер той же композиции, пока чанк визуала грузится. */
function VisualSkeleton() {
  return (
    <div className="absolute inset-[6%] flex flex-col gap-[4%]">
      <div className="h-[9%] w-2/5 rounded-lg bg-text-muted/10" />
      <div className="flex flex-1 gap-[4%]">
        <div className="w-[28%] rounded-xl border border-border/60 bg-bg-elevated/40" />
        <div className="flex flex-1 flex-col gap-[6%]">
          <div className="flex-1 rounded-xl border border-border/60 bg-bg-elevated/40" />
          <div className="h-[30%] rounded-xl border border-border/60 bg-bg-elevated/40" />
        </div>
      </div>
    </div>
  );
}

/**
 * «Живой» визуал на месте картинки — как ядро агента: сцена в фиксированных координатах
 * масштабируется под рамку, поэтому одинаково выглядит на 375 и 1440 px.
 * Циклы идут, только пока сцена в viewport и вкладка активна; на паузе CSS-анимации замирают.
 */
export function LiveVisual({ visual, label, priority = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const control = useContext(VisualControlContext);
  const inView = useActiveInViewport(rootRef);
  const near = useNearViewport(rootRef, priority);
  const [scale, setScale] = useState<number | null>(null);
  const definition = VISUALS[visual];
  const Scene = near ? getVisualComponent(visual) : null;

  const running = inView && !control.paused && tier !== 'off';
  const interactive = tier === 'full' && pointerFine;
  useLoopDebug(`visual-${visual}`, running);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, SPRING_VALUE.soft);
  const pointerY = useSpring(rawY, SPRING_VALUE.soft);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return undefined;
    const measure = (width: number) => setScale(width / definition.width);
    measure(element.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) measure(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [definition.width]);

  const state = useMemo<VisualState>(
    () => ({
      tier,
      running,
      animated: tier !== 'off',
      full: tier === 'full',
      interactive,
      pointerX,
      pointerY,
      startDelay: control.startDelay ?? 0,
    }),
    [tier, running, interactive, pointerX, pointerY, control.startDelay],
  );

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rawX.set((event.clientX - rect.left) / rect.width - 0.5);
    rawY.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={label}
      className="absolute inset-0 overflow-hidden"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        aria-hidden
        className={cn(
          'absolute left-0 top-0 origin-top-left select-none',
          !running && '[&_*]:[animation-play-state:paused]',
        )}
        style={{
          width: definition.width,
          height: definition.height,
          transform: `scale(${scale ?? 0})`,
          visibility: scale === null ? 'hidden' : undefined,
        }}
      >
        <VisualContext.Provider value={state}>
          <VisualErrorBoundary fallback={<VisualSkeleton />}>
            <Suspense fallback={<VisualSkeleton />}>
              {Scene ? <Scene /> : <VisualSkeleton />}
            </Suspense>
          </VisualErrorBoundary>
        </VisualContext.Provider>
      </div>
    </div>
  );
}
