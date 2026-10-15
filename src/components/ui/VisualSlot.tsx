import { useTranslation } from 'react-i18next';
import { VISUAL_SLOTS, type SlotKey } from '@/content/visualSlots';
import { LiveVisual } from '@/components/visuals/LiveVisual';
import { VISUALS } from '@/components/visuals/registry';
import { useMotionTier } from '@/motion/tier';
import { cn } from '@/lib/cn';

export type SlotGlow = 'indigo' | 'cyan' | 'violet' | 'none';

/** Свечение за рамкой — цвет направления. */
const GLOW: Record<Exclude<SlotGlow, 'none'>, string> = {
  indigo: 'bg-glow-indigo opacity-30',
  cyan: 'bg-glow-cyan opacity-20',
  violet:
    'bg-[radial-gradient(ellipse_at_center,rgb(var(--accent-glow)/0.35)_0%,transparent_70%)] opacity-30',
};

type Props = {
  slot: SlotKey;
  /** Первый экран: чанк сцены грузится сразу, без ожидания приближения к viewport. */
  priority?: boolean;
  glow?: SlotGlow;
  className?: string;
};

/**
 * Визуальное место: стеклянная рамка с сеткой и свечением, внутри — «живая» сцена на коде.
 * Пропорции рамки = пропорции сцены, поэтому вёрстка не сдвигается, пока чанк грузится (CLS = 0).
 */
export function VisualSlot({ slot, priority = false, glow = 'indigo', className }: Props) {
  const { t } = useTranslation();
  const tier = useMotionTier();
  const visual = VISUAL_SLOTS[slot];
  const stage = VISUALS[visual];

  return (
    <div className={cn('relative', className)}>
      {glow !== 'none' ? (
        <div
          aria-hidden
          className={cn(
            'absolute -inset-4 rounded-3xl blur-2xl',
            GLOW[glow],
            tier === 'full' && 'animate-glow-breathe',
          )}
        />
      ) : null}
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-bg-surface/60 backdrop-blur-sm"
        style={{ aspectRatio: `${stage.width} / ${stage.height}` }}
      >
        <div aria-hidden className="absolute inset-0 bg-grid-pattern" />
        <LiveVisual visual={visual} label={t(`visuals.${slot}`)} priority={priority} />
      </div>
    </div>
  );
}
