import { beforeEach, describe, expect, it } from 'vitest';
import { __resetMotionTierCache, downgradeMotionTier, resolveTier } from './tier';

const setNavigator = (props: Record<string, unknown>) => {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(window.navigator, key, { value, configurable: true });
  }
};

beforeEach(() => {
  __resetMotionTierCache();
  window.sessionStorage.clear();
  window.history.replaceState(null, '', '/');
  setNavigator({ hardwareConcurrency: 8, deviceMemory: 8, connection: undefined });
});

describe('resolveTier', () => {
  it('is off when the user prefers reduced motion', () => {
    expect(resolveTier(true)).toBe('off');
  });

  it('is full on a capable device', () => {
    expect(resolveTier(false)).toBe('full');
  });

  it('is lite on a low-end CPU', () => {
    setNavigator({ hardwareConcurrency: 4 });
    expect(resolveTier(false)).toBe('lite');
  });

  it('is lite when the user saves data', () => {
    setNavigator({ connection: { saveData: true } });
    expect(resolveTier(false)).toBe('lite');
  });

  it('respects ?motion= override and remembers it for the session', () => {
    window.history.replaceState(null, '', '/?motion=lite');
    expect(resolveTier(false)).toBe('lite');
    expect(window.sessionStorage.getItem('dijex.motion')).toBe('lite');
  });

  it('never overrides reduced motion with ?motion=full', () => {
    window.history.replaceState(null, '', '/?motion=full');
    expect(resolveTier(true)).toBe('off');
  });

  it('downgrades to lite at runtime', () => {
    downgradeMotionTier();
    expect(resolveTier(false)).toBe('lite');
  });
});
