import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Box = { x: number; y: number; w: number; h?: number };

type Props = {
  /** Положение в координатах сцены. Без него панель — обычный блок в потоке. */
  box?: Box;
  /** Подсветка рамки (элемент сейчас «работает»). */
  active?: boolean;
  tone?: 'primary' | 'secondary' | 'success';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const ACTIVE: Record<NonNullable<Props['tone']>, string> = {
  primary: 'border-accent-primary/70 shadow-[0_0_32px_-8px_rgb(var(--accent-primary)/0.75)]',
  secondary: 'border-accent-secondary/70 shadow-[0_0_32px_-8px_rgb(var(--accent-secondary)/0.7)]',
  success: 'border-success/70 shadow-[0_0_32px_-8px_rgb(var(--success)/0.7)]',
};

/** Стеклянная панель «интерфейса внутри интерфейса» — базовый блок всех сцен. */
export function Panel({
  box,
  active = false,
  tone = 'primary',
  className,
  style,
  children,
}: Props) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-bg-elevated/90 shadow-[0_16px_40px_-24px_rgb(0_0_0/0.9)] transition-[border-color,box-shadow] duration-500',
        box && 'absolute',
        active ? ACTIVE[tone] : 'border-border',
        className,
      )}
      style={box ? { left: box.x, top: box.y, width: box.w, height: box.h, ...style } : style}
    >
      {children}
    </div>
  );
}
