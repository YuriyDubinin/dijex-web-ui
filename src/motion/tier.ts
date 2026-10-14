import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Уровень движения:
 * - full — полный набор эффектов;
 * - lite — без WebGL, параллакса, курсорных эффектов и тяжёлых бесконечных циклов;
 * - off — prefers-reduced-motion или ?motion=off: контент сразу виден, без анимаций.
 */
export type MotionTier = 'full' | 'lite' | 'off';

const OVERRIDE_KEY = 'dijex.motion';

function isTier(value: unknown): value is MotionTier {
  return value === 'full' || value === 'lite' || value === 'off';
}

/** ?motion=off|lite|full — для QA; запоминается до конца сессии. */
function readOverride(): MotionTier | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('motion');
    if (isTier(fromQuery)) {
      window.sessionStorage.setItem(OVERRIDE_KEY, fromQuery);
      return fromQuery;
    }
    const stored = window.sessionStorage.getItem(OVERRIDE_KEY);
    return isTier(stored) ? stored : null;
  } catch {
    return null;
  }
}

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** Признаки слабого устройства или экономии трафика. */
function detectBaseTier(): 'full' | 'lite' {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'full';
  const nav = navigator as NavigatorHints;
  const lowCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
  const saveData = nav.connection?.saveData === true;
  const smallTouch =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)')?.matches === true &&
    window.innerWidth < 768;
  return lowCpu || lowMemory || saveData || smallTouch ? 'lite' : 'full';
}

let cachedBase: 'full' | 'lite' | null = null;
let cachedOverride: MotionTier | null | undefined;
/** Понижение уровня во время работы (например, шейдер не держит FPS). */
let runtimeDowngrade = false;
const listeners = new Set<() => void>();

export function getBaseTier(): 'full' | 'lite' {
  cachedBase ??= detectBaseTier();
  return runtimeDowngrade ? 'lite' : cachedBase;
}

export function getMotionOverride(): MotionTier | null {
  if (cachedOverride === undefined) cachedOverride = readOverride();
  return cachedOverride;
}

/** Понизить уровень до lite для всего приложения (необратимо до перезагрузки). */
export function downgradeMotionTier(): void {
  if (runtimeDowngrade) return;
  runtimeDowngrade = true;
  listeners.forEach((listener) => listener());
}

export function resolveTier(reducedMotion: boolean): MotionTier {
  if (reducedMotion) return 'off';
  return getMotionOverride() ?? getBaseTier();
}

export function useMotionTier(): MotionTier {
  const reduced = useReducedMotion() ?? false;
  const [, setVersion] = useState(0);

  useEffect(() => {
    const listener = () => setVersion((value) => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return resolveTier(reduced);
}

/** Только для тестов. */
export function __resetMotionTierCache() {
  cachedBase = null;
  cachedOverride = undefined;
  runtimeDowngrade = false;
}
