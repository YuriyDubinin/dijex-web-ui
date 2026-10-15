import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type PillTone = 'success' | 'primary' | 'secondary' | 'warning' | 'muted' | 'danger';

const TONES: Record<PillTone, string> = {
  success: 'border-success/40 bg-success/10 text-success',
  primary: 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary',
  secondary: 'border-accent-secondary/40 bg-accent-secondary/10 text-accent-secondary',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  danger: 'border-danger/40 bg-danger/10 text-danger',
  muted: 'border-border bg-bg-surface text-text-secondary',
};

type Props = {
  tone?: PillTone;
  /** Точка-индикатор слева. */
  dot?: boolean;
  className?: string;
  children: ReactNode;
};

/** Пилюля статуса: «В работе», «Согласовано», «AI»… Текст не переносится, лишнее обрезается. */
export function StatusPill({ tone = 'muted', dot = true, className, children }: Props) {
  return (
    <span
      className={cn(
        'inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border px-2 py-[3px] text-[10px] font-medium leading-none',
        TONES[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
