import { AnimatePresence, motion } from 'framer-motion';
import { Cloud, Server, UserRound } from 'lucide-react';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';

type Kind = 'cloud' | 'private' | 'onPrem';

/** Куда «текут» данные: путь точек от компании к месту хранения. */
const ROUTES: Record<Kind, string> = {
  cloud: 'M 46 50 C 110 50 140 22 200 22',
  private: 'M 46 50 C 100 50 130 34 170 34',
  onPrem: 'M 46 50 C 80 50 100 54 124 54',
};

/** Пунктирный «периметр компании»: для частного облака он охватывает и облако. */
const PERIMETER: Record<Kind, { width: number }> = {
  cloud: { width: 150 },
  private: { width: 220 },
  onPrem: { width: 150 },
};

/**
 * Мини-схема «где живут данные»: точки-данные текут от компании в облако, в частное облако
 * внутри периметра или на собственные серверы. Анимация точек — только в full.
 */
export function DataLocationDiagram({ kind }: { kind: Kind }) {
  const tier = useMotionTier();
  const full = tier === 'full';

  return (
    <svg aria-hidden viewBox="0 0 240 90" className="h-24 w-full">
      <motion.rect
        x="8"
        y="8"
        height="74"
        rx="12"
        fill="rgb(var(--accent-primary) / 0.05)"
        stroke="rgb(var(--accent-primary) / 0.45)"
        strokeDasharray="4 5"
        initial={{ width: PERIMETER[kind].width }}
        animate={{ width: PERIMETER[kind].width }}
        transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
      />
      <foreignObject x="26" y="34" width="32" height="32">
        <UserRound size={22} className="text-text-secondary" />
      </foreignObject>

      <AnimatePresence mode="wait" initial={false}>
        <motion.g
          key={kind}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: DURATION.base, ease: EASE.outExpo }}
          style={{ transformOrigin: kind === 'onPrem' ? '124px 54px' : '200px 26px' }}
        >
          {kind === 'onPrem' ? (
            <foreignObject x="110" y="38" width="32" height="32">
              <Server size={24} className="text-accent-secondary" />
            </foreignObject>
          ) : (
            <foreignObject x={kind === 'cloud' ? 186 : 156} y="8" width="34" height="34">
              <Cloud size={28} className="text-accent-secondary" />
            </foreignObject>
          )}
        </motion.g>
      </AnimatePresence>

      <path
        d={ROUTES[kind]}
        fill="none"
        stroke="rgb(var(--accent-secondary) / 0.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {full
        ? [0, 0.6, 1.2].map((delay) => (
            <circle key={`${kind}-${delay}`} r="2.6" fill="rgb(var(--accent-secondary))">
              <animateMotion
                dur="1.8s"
                begin={`${delay}s`}
                repeatCount="indefinite"
                path={ROUTES[kind]}
              />
            </circle>
          ))
        : null}
    </svg>
  );
}
