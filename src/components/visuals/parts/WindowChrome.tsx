import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/cn';

type Props = {
  /** Адрес в строке браузера (данные, не переводятся). */
  url?: string;
  className?: string;
  children?: ReactNode;
};

/** Шапка окна приложения: три точки и адресная строка. */
export function WindowChrome({ url, className, children }: Props) {
  return (
    <div className={cn('flex items-center gap-1.5 border-b border-border px-3 py-2', className)}>
      {['bg-danger/70', 'bg-warning/70', 'bg-success/70'].map((tone) => (
        <span key={tone} className={cn('h-2 w-2 shrink-0 rounded-full', tone)} />
      ))}
      {url ? (
        <span className="ml-3 flex min-w-0 items-center gap-1 rounded-md bg-bg-base/70 px-2 py-0.5 font-mono text-[9.5px] text-text-muted">
          <Lock size={8} className="shrink-0" />
          <span className="truncate">{url}</span>
        </span>
      ) : null}
      {children}
    </div>
  );
}
