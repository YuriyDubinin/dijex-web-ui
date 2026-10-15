import { renderHook, screen } from '@testing-library/react';
import { motionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { IMAGES, liveVisualFor } from '@/content/images';
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

describe('live visuals', () => {
  it('every manifest visual has a registered scene', () => {
    for (const asset of Object.values(IMAGES)) {
      if (asset.visual) expect(VISUALS[asset.visual]).toBeDefined();
    }
  });

  it('a slot with a visual renders the scene instead of requesting the file', async () => {
    await renderWithProviders(<ImageSlot image="pillarOrchestrator" />);
    const scene = screen.getByRole('img');
    expect(scene).toHaveAccessibleName(/orchestrator/i);
    expect(scene.tagName).not.toBe('IMG');
    expect(document.querySelector('img')).toBeNull();
  });

  it('a slot without a visual still waits for the image file', async () => {
    await renderWithProviders(<ImageSlot image="aboutGlobe" />);
    expect(liveVisualFor('aboutGlobe')).toBeNull();
    expect(document.querySelector('img')).not.toBeNull();
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
