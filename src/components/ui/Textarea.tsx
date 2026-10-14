import { forwardRef, useEffect, useRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type TextareaProps = {
  hasError?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

function useAutosize(ref: React.RefObject<HTMLTextAreaElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const adjust = () => {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };
    adjust();
    el.addEventListener('input', adjust);
    return () => el.removeEventListener('input', adjust);
  });
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, hasError, ...rest },
  forwardedRef,
) {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  useAutosize(internalRef);

  return (
    <textarea
      ref={(node) => {
        internalRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      rows={4}
      className={cn(
        'w-full resize-none rounded-lg border bg-bg-surface/60 px-4 py-3',
        'text-body text-text-primary placeholder:text-text-muted',
        'field-beam backdrop-blur-sm',
        'disabled:cursor-not-allowed disabled:opacity-50',
        hasError
          ? 'border-danger focus:border-danger'
          : 'border-border focus:border-accent-primary/60',
        className,
      )}
      aria-invalid={hasError ? true : undefined}
      {...rest}
    />
  );
});
