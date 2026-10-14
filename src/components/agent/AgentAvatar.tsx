import { Sparkles } from 'lucide-react';
import { useMotionTier } from '@/motion/tier';
import { cn } from '@/lib/cn';

type Props = {
  size?: number;
  /** Агент «думает» (печатает) — вокруг вращается кольцо. */
  active?: boolean;
  className?: string;
};

/** Аватар AI-агента Dijex: градиентная сфера с искрой, мягкое «дыхание» свечения. */
export function AgentAvatar({ size = 40, active = false, className }: Props) {
  const tier = useMotionTier();
  const animate = tier !== 'off';

  return (
    <span
      aria-hidden
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <span
        className={cn(
          'absolute -inset-1 rounded-full bg-accent-primary/40 blur-md',
          animate && 'animate-glow-breathe',
        )}
      />
      {active && animate ? (
        <span className="absolute -inset-[3px] animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgb(var(--accent-secondary))_90deg,transparent_180deg)] [animation-duration:1.4s]" />
      ) : null}
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-brand-gradient text-white shadow-[inset_0_1px_8px_rgb(255_255_255/0.35)]">
        <Sparkles size={Math.round(size * 0.45)} />
      </span>
    </span>
  );
}
