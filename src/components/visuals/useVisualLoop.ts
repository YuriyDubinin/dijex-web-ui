import { useEffect, useRef, useState } from 'react';
import { useVisual } from './context';

export type LoopState = {
  /** Текущий шаг сюжета. */
  step: number;
  /** Сколько раз сюжет прошёл целиком — для смены данных между циклами. */
  cycle: number;
};

/** Насколько медленнее идут циклы в lite. */
export const LITE_SLOWDOWN = 1.5;

/** Случайный сдвиг фазы, чтобы соседние визуалы не «дышали» синхронно, мс. */
const MAX_PHASE_MS = 1500;

/**
 * Сюжетный цикл визуала: шаги с длительностями (мс) идут по кругу, пока сцена активна.
 * - вне viewport / на паузе — стоит на текущем шаге и продолжает с него;
 * - lite — длительности ×1.5;
 * - off — сразу «постер» (по умолчанию последний шаг), без таймеров.
 * Массив длительностей должен быть стабильным (константа модуля).
 */
export function useVisualLoop(
  durations: readonly number[],
  { poster = durations.length - 1 }: { poster?: number } = {},
): LoopState {
  const { running, tier, startDelay } = useVisual();
  const [state, setState] = useState<LoopState>({ step: 0, cycle: 0 });
  const started = useRef(false);
  const phase = useRef(Math.random() * MAX_PHASE_MS);

  useEffect(() => {
    if (!running || durations.length === 0) return undefined;
    const factor = tier === 'lite' ? LITE_SLOWDOWN : 1;
    const lead = started.current ? 0 : startDelay * 1000 + phase.current;
    started.current = true;
    const timer = window.setTimeout(
      () =>
        setState(({ step, cycle }) => {
          const next = (step + 1) % durations.length;
          return { step: next, cycle: next === 0 ? cycle + 1 : cycle };
        }),
      (durations[state.step] ?? 1000) * factor + lead,
    );
    return () => window.clearTimeout(timer);
  }, [running, tier, startDelay, durations, state]);

  return tier === 'off' ? { step: poster, cycle: 0 } : state;
}

/** Простой «тикер»: номер тика растёт каждые `interval` мс, пока сцена активна (в off — всегда 0). */
export function useVisualTicker(interval: number): number {
  const durations = useRef([interval]).current;
  return useVisualLoop(durations).cycle;
}
