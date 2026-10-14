/**
 * Токены движения — единственный источник длительностей, кривых и пружин.
 * Никаких «магических» чисел в компонентах: только эти значения.
 */

export const DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
  reveal: 0.8,
  cinematic: 1.2,
} as const;

type CubicBezier = [number, number, number, number];

export const EASE = {
  /** Фирменная кривая: быстрый старт, мягкое завершение. */
  brand: [0.22, 1, 0.36, 1] as CubicBezier,
  outExpo: [0.16, 1, 0.3, 1] as CubicBezier,
  outQuart: [0.25, 1, 0.5, 1] as CubicBezier,
  inOut: [0.65, 0, 0.35, 1] as CubicBezier,
  sharp: [0.4, 0, 0.2, 1] as CubicBezier,
} as const;

/** CSS-версии кривых — для transition / animation в классах и стилях. */
export const CSS_EASE = {
  brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
  outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

export const SPRING = {
  snappy: { type: 'spring', stiffness: 520, damping: 38 },
  soft: { type: 'spring', stiffness: 220, damping: 26 },
  magnetic: { type: 'spring', stiffness: 160, damping: 15, mass: 0.12 },
  tilt: { type: 'spring', stiffness: 260, damping: 22 },
} as const;

/** То же для useSpring (без поля type). */
export const SPRING_VALUE = {
  snappy: { stiffness: 520, damping: 38 },
  soft: { stiffness: 220, damping: 26 },
  magnetic: { stiffness: 160, damping: 15, mass: 0.12 },
  tilt: { stiffness: 260, damping: 22 },
} as const;

export const STAGGER = {
  chars: 0.012,
  words: 0.035,
  items: 0.06,
  cards: 0.08,
  sections: 0.12,
} as const;

export const DISTANCE = {
  reveal: 24,
  small: 10,
  parallax: 60,
} as const;

/** Задержка «волной» по диагонали сетки: (строка + колонка) × шаг. */
export function gridWaveDelay(index: number, columns: number, step: number = STAGGER.cards) {
  const safeColumns = Math.max(1, columns);
  const row = Math.floor(index / safeColumns);
  const column = index % safeColumns;
  return (row + column) * step;
}

/** Задержка «радиально от центра» сетки. */
export function gridRadialDelay(
  index: number,
  columns: number,
  rows: number,
  step: number = STAGGER.cards,
) {
  const row = Math.floor(index / columns);
  const column = index % columns;
  const distance = Math.hypot(column - (columns - 1) / 2, row - (rows - 1) / 2);
  return distance * step;
}
