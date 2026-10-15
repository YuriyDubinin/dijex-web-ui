import { useEffect, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import type { ChannelBrand } from './channelBrands';

type Glyphs = Record<ChannelBrand, { path: string; hex: string }>;

/** Значки грузятся одним маленьким чанком при первом показе и дальше берутся из кэша модуля. */
let cache: Glyphs | null = null;
let pending: Promise<Glyphs> | null = null;

function loadGlyphs(): Promise<Glyphs> {
  pending ??= import('./channelGlyphs').then((module) => {
    cache = module.CHANNEL_GLYPHS;
    return cache;
  });
  return pending;
}

function useGlyphs(): Glyphs | null {
  const [glyphs, setGlyphs] = useState(cache);
  useEffect(() => {
    if (glyphs) return undefined;
    let alive = true;
    void loadGlyphs().then((loaded) => {
      if (alive) setGlyphs(loaded);
    });
    return () => {
      alive = false;
    };
  }, [glyphs]);
  return glyphs;
}

type Props = {
  channel: ChannelBrand;
  size?: number;
  /**
   * Фирменный цвет: 'hover' — при наведении на ближайший .group (по умолчанию),
   * 'always' — всегда, 'never' — только currentColor.
   */
  tint?: 'hover' | 'always' | 'never';
  className?: string;
};

/**
 * Монохромный значок канала (currentColor); фирменный оттенок — при наведении или всегда.
 * Пока чанк значков грузится, место уже занято (размер svg фиксирован) — вёрстка не прыгает.
 */
export function ChannelGlyph({ channel, size = 16, tint = 'hover', className }: Props) {
  const glyphs = useGlyphs();
  const icon = glyphs?.[channel];
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={cn(
        'shrink-0 transition-colors duration-300',
        tint === 'hover' && 'group-hover:text-[rgb(var(--brand))]',
        tint === 'always' && 'text-[rgb(var(--brand))]',
        className,
      )}
      style={icon ? ({ '--brand': hexToChannels(icon.hex) } as CSSProperties) : undefined}
    >
      {icon ? <path d={icon.path} /> : null}
    </svg>
  );
}

/** «26A5E4» → «38 165 228» — в формате токенов проекта (rgb(var(--x))). */
function hexToChannels(hex: string): string {
  const value = Number.parseInt(hex, 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}
