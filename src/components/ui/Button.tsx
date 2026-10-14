import {
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import { useMagnetic } from '@/motion/useMagnetic';
import { cn } from '@/lib/cn';

const variantClasses = {
  primary: [
    'btn-primary bg-accent-primary text-white border border-transparent',
    'hover:shadow-glow',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),
  ghost: [
    'btn-ghost bg-transparent text-text-primary border border-border',
    'hover:bg-bg-surface',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  link: [
    'bg-transparent text-accent-primary border border-transparent',
    'hover:text-accent-primary/80 underline-offset-4 hover:underline',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
} as const;

type Variant = keyof typeof variantClasses;

const sizeClasses = {
  sm: 'h-9 px-3 text-small gap-1.5',
  md: 'h-11 px-5 text-body gap-2',
  lg: 'h-14 px-7 text-body gap-2.5',
} as const;

type Size = keyof typeof sizeClasses;

type ButtonOwnProps = {
  variant?: Variant;
  size?: Size;
  /** Тянется к курсору (по умолчанию — для size="lg"). */
  magnetic?: boolean;
  children: ReactNode;
  className?: string;
};

export type ButtonProps<E extends ElementType = 'button'> = ButtonOwnProps & {
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps | 'as'>;

/**
 * Кнопка с микровзаимодействиями: нажатие, «шайн» по поверхности (primary), вращающаяся аура на hover/фокусе,
 * прорисовка обводки (ghost), магнитность. Hover-эффекты дублируются на :focus-visible.
 */
export function Button<E extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  magnetic,
  className,
  children,
  ...rest
}: ButtonProps<E>) {
  const Tag = (as ?? 'button') as ElementType;
  const ref = useRef<HTMLElement>(null);
  const isLink = variant === 'link';
  const magneticActive = useMagnetic(ref, { enabled: !isLink && (magnetic ?? size === 'lg') });

  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      className={cn(
        'group/btn relative isolate inline-flex items-center justify-center rounded-xl font-semibold',
        'transition-[background-color,border-color,box-shadow,color] duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        'select-none',
        !isLink && 'btn-press',
        magneticActive && 'magnetic',
        variantClasses[variant],
        isLink ? '' : sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {variant === 'primary' ? (
        <>
          <span aria-hidden className="btn-aura" />
          <span aria-hidden className="btn-shine-track">
            <span className="btn-shine" />
          </span>
        </>
      ) : null}
      {variant === 'ghost' ? (
        <svg aria-hidden className="btn-draw" preserveAspectRatio="none">
          <rect x="0" y="0" width="100%" height="100%" rx="12" pathLength={1} />
        </svg>
      ) : null}
      <span
        className={cn(
          'relative z-10 inline-flex items-center justify-center',
          sizeClasses[size].split(' ').find((item) => item.startsWith('gap-')),
          magneticActive && 'magnetic-label',
        )}
      >
        {children}
      </span>
    </Tag>
  );
}
