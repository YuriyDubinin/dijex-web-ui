import { createContext, useContext } from 'react';
import { motionValue, type MotionValue } from 'framer-motion';
import type { MotionTier } from '@/motion/tier';

/** Управление визуалами снаружи: секция может поставить визуал на паузу или сдвинуть его старт. */
export type VisualControl = {
  paused?: boolean;
  /** Задержка первого цикла, секунды (сверх случайного сдвига фазы). */
  startDelay?: number;
};

export const VisualControlContext = createContext<VisualControl>({});

/** Состояние сцены, общее для всех частей визуала. */
export type VisualState = {
  tier: MotionTier;
  /** Сцена видна, вкладка активна, уровень не off и визуал не на паузе — можно крутить циклы. */
  running: boolean;
  /** Уровень не off: переходы анимируются. */
  animated: boolean;
  full: boolean;
  /** Курсорные эффекты включены (full + мышь). */
  interactive: boolean;
  /** Положение курсора над сценой, −0.5…0.5 (сглаженное пружиной). */
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  startDelay: number;
};

const idle = motionValue(0);

export const VisualContext = createContext<VisualState>({
  tier: 'off',
  running: false,
  animated: false,
  full: false,
  interactive: false,
  pointerX: idle,
  pointerY: idle,
  startDelay: 0,
});

export function useVisual(): VisualState {
  return useContext(VisualContext);
}
