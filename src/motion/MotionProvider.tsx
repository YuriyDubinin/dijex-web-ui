import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { EASE } from './tokens';

/** Глобальные настройки framer-motion: уважение prefers-reduced-motion и фирменная кривая по умолчанию. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: EASE.brand }}>
      {children}
    </MotionConfig>
  );
}
