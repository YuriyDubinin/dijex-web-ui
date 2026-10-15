import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { renderHook, screen } from '@testing-library/react';
import { motionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { VisualSlot } from '@/components/ui/VisualSlot';
import { SLOT_KEYS, VISUAL_SLOTS } from '@/content/visualSlots';
import { renderWithProviders } from '@/test/i18n';
import { VisualContext, type VisualState } from './context';
import { VISUALS } from './registry';
import { useVisualLoop } from './useVisualLoop';

const STEPS = [100, 200, 300] as const;

function stateFor(tier: VisualState['tier']): VisualState {
  return {
    tier,
    running: false,
    animated: tier !== 'off',
    full: tier === 'full',
    interactive: false,
    pointerX: motionValue(0),
    pointerY: motionValue(0),
    startDelay: 0,
  };
}

function withTier(tier: VisualState['tier']) {
  return function TierWrapper({ children }: { children: ReactNode }) {
    return <VisualContext.Provider value={stateFor(tier)}>{children}</VisualContext.Provider>;
  };
}

/** Исходники сайта (без тестов) — для проверки, что статичных картинок нет. */
const SOURCES = import.meta.glob<string>(['/src/**/*.{ts,tsx,css}', '!/src/**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    // Системные файлы macOS не входят в сборку сайта
    if (name === '.DS_Store') return [];
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

describe('live visuals', () => {
  it('every slot has a registered scene', () => {
    for (const slot of SLOT_KEYS) expect(VISUALS[VISUAL_SLOTS[slot]]).toBeDefined();
  });

  it('a slot renders its scene with an accessible name', async () => {
    await renderWithProviders(<VisualSlot slot="pillarOrchestrator" />);
    const scene = screen.getByRole('img');
    expect(scene).toHaveAccessibleName(/orchestrator/i);
    expect(scene.tagName).not.toBe('IMG');
  });

  it('shows the poster step right away when motion is off', () => {
    const { result } = renderHook(() => useVisualLoop(STEPS), { wrapper: withTier('off') });
    expect(result.current).toEqual({ step: STEPS.length - 1, cycle: 0 });
  });

  it('respects a custom poster step', () => {
    const { result } = renderHook(() => useVisualLoop(STEPS, { poster: 1 }), {
      wrapper: withTier('off'),
    });
    expect(result.current.step).toBe(1);
  });

  it('starts from the first step and waits while the scene is not running', () => {
    const { result } = renderHook(() => useVisualLoop(STEPS), { wrapper: withTier('full') });
    expect(result.current).toEqual({ step: 0, cycle: 0 });
  });
});

describe('no static images', () => {
  it('source code has no <img> and no raster imports', () => {
    const offenders = Object.entries(SOURCES)
      .filter(([, code]) => /<img[\s>]|\.(png|jpe?g|webp|gif|avif)['")]/i.test(code))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it('public/ holds no images except the favicon and generated link previews', () => {
    const publicDir = join(process.cwd(), 'public');
    const files = listFiles(publicDir).map((path) =>
      relative(publicDir, path).split('\\').join('/'),
    );
    const unexpected = files.filter(
      (file) =>
        /\.(png|jpe?g|webp|gif|avif|svg|ico)$/i.test(file) &&
        file !== 'favicon.svg' &&
        !/^og\/og-[a-z]{2}\.jpg$/.test(file),
    );
    expect(unexpected).toEqual([]);
  });
});
