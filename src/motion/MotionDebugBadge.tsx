import { useMotionTier } from './tier';

/** Только в dev: текущий уровень движения в углу экрана (переключение — ?motion=full|lite|off). */
export function MotionDebugBadge() {
  const tier = useMotionTier();
  if (!import.meta.env.DEV) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-3 left-3 z-[60] rounded-md border border-border bg-bg-elevated/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted"
    >
      motion: {tier}
    </div>
  );
}
