import { cn } from '@/lib/cn';

type Props = {
  direction: 'horizontal' | 'vertical';
  className?: string;
};

const DELAYS = ['0s', '0.8s', '1.6s'];

/**
 * Линия-связь с «бегущими» по ней импульсами — визуализирует поток данных между блоками.
 * При prefers-reduced-motion импульсы статичны (см. globals.css).
 */
export function FlowConnector({ direction, className }: Props) {
  const horizontal = direction === 'horizontal';

  return (
    <div
      aria-hidden
      className={cn(
        'relative overflow-hidden',
        horizontal ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-0',
          horizontal
            ? 'bg-gradient-to-r from-accent-primary/20 via-accent-primary/40 to-accent-secondary/20'
            : 'bg-gradient-to-b from-accent-primary/20 via-accent-primary/40 to-accent-secondary/20',
        )}
      />
      {DELAYS.map((delay) => (
        <span
          key={delay}
          className={cn(
            'absolute',
            horizontal
              ? 'inset-y-0 left-0 w-full animate-flow-x bg-gradient-to-r from-transparent via-accent-secondary to-transparent'
              : 'inset-x-0 top-0 h-full animate-flow-y bg-gradient-to-b from-transparent via-accent-secondary to-transparent',
          )}
          style={{ animationDelay: delay }}
        />
      ))}
    </div>
  );
}
