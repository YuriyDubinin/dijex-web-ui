import { CN, DE, FR, GB, JP, RU, TH, US } from 'country-flag-icons/react/3x2';
import type { FlagCountry } from '@/i18n/config';
import { cn } from '@/lib/cn';

const FLAGS = { CN, DE, FR, GB, JP, RU, TH, US } satisfies Record<FlagCountry, unknown>;

type Props = {
  country: FlagCountry;
  /** Ширина в px; высота — по пропорции 3:2. */
  size?: number;
  className?: string;
};

/** SVG-флаг (не emoji — на Windows флаги-emoji не отображаются). Декоративный. */
export function Flag({ country, size = 20, className }: Props) {
  const Component = FLAGS[country];
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 overflow-hidden rounded-[3px] ring-1 ring-inset ring-white/15',
        className,
      )}
      style={{ width: size, height: Math.round((size * 2) / 3) }}
    >
      <Component className="h-full w-full object-cover" />
    </span>
  );
}
