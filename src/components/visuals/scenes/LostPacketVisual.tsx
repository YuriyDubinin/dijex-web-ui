import { AnimatePresence, motion } from 'framer-motion';
import { Cloud, Database, Home, Mail, Users, type LucideIcon } from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { Packet } from '../parts/Packet';
import { Wire } from '../parts/Wire';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 480×360: сеть проводов, маршрут от «Главной» обрывается — пакет упирается в обрыв и возвращается. */
const HOME = { x: 70, y: 200 } as const;
const BREAK = { x: 372, y: 200 } as const;
const ROUTE = `M ${HOME.x} ${HOME.y} L 150 200 L 150 120 L 286 120 L 286 200 L ${BREAK.x} ${BREAK.y}`;
const ROUTE_BACK = `M ${BREAK.x} ${BREAK.y} L 286 200 L 286 120 L 150 120 L 150 200 L ${HOME.x} ${HOME.y}`;
/** Обрыв: провод продолжается за разрывом к «неизвестному» узлу. */
const BEYOND = `M ${BREAK.x + 30} 200 L 420 200`;
const DECOR = [
  'M 150 120 L 150 60 L 236 60',
  'M 286 120 L 380 120 L 380 80',
  'M 150 200 L 150 290 L 260 290',
  'M 286 200 L 286 270 L 360 270',
] as const;
const JUNCTIONS = [
  [150, 200],
  [150, 120],
  [286, 120],
  [286, 200],
  [236, 60],
  [380, 80],
  [260, 290],
  [360, 270],
] as const;

/** Узлы сети на концах веток — сеть «живая», не хватает только одного маршрута. */
const SERVICES: readonly { x: number; y: number; icon: LucideIcon }[] = [
  { x: 236, y: 60, icon: Cloud },
  { x: 380, y: 80, icon: Database },
  { x: 260, y: 290, icon: Users },
  { x: 360, y: 270, icon: Mail },
];

/** Шаги: пакет идёт по маршруту → упирается в обрыв (404) → возвращается → «дома». */
const STEPS = [1700, 1600, 1700, 900] as const;
const STEP = { travel: 0, lost: 1, back: 2, home: 3 } as const;

/** 404: потерянный пакет данных ищет маршрут и возвращается на главную. */
export function LostPacketVisual() {
  const text = useContent('visuals', 'lostPacket');
  const { animated, full } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.lost });
  const lost = step === STEP.lost;

  return (
    <div className="absolute inset-0">
      <div className="absolute left-32 top-20 h-48 w-60 rounded-full bg-glow-indigo opacity-70 blur-3xl" />
      <svg viewBox="0 0 480 360" className="absolute inset-0 h-full w-full overflow-visible">
        {DECOR.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="rgb(var(--accent-primary))"
            strokeOpacity={0.3}
            strokeWidth={1.25}
          />
        ))}
        <Wire d={ROUTE} active={step !== STEP.home} tone="primary" />
        <Wire d={BEYOND} dashed baseOpacity={0.5} />
        {JUNCTIONS.map(([x, y]) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={3}
            fill="rgb(var(--bg-elevated))"
            stroke="rgb(var(--border))"
          />
        ))}
        {/* Концы обрыва */}
        <circle cx={BREAK.x} cy={BREAK.y} r={3.5} fill="rgb(var(--danger))" />
        <circle cx={BREAK.x + 30} cy={BREAK.y} r={3.5} fill="rgb(var(--danger))" opacity={0.6} />
      </svg>

      {step === STEP.travel ? (
        <Packet key={`go-${cycle}`} d={ROUTE} duration={1.5} size={9} tone="primary" />
      ) : null}
      {step === STEP.back ? (
        <Packet key={`back-${cycle}`} d={ROUTE_BACK} duration={1.5} size={9} tone="secondary" />
      ) : null}

      {/* Пакет застрял у обрыва и «ищет» путь пингами */}
      <AnimatePresence>
        {lost ? (
          <motion.span
            className="absolute"
            style={{ left: BREAK.x - 5, top: BREAK.y - 5 }}
            initial={animated ? { opacity: 0, scale: 0.5 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animated ? DURATION.fast : 0 }}
          >
            <span className="block h-2.5 w-2.5 rounded-full bg-accent-primary shadow-[0_0_12px_3px_rgb(var(--accent-primary)/0.8)]" />
            {full
              ? [0, 1].map((ring) => (
                  <motion.span
                    key={ring}
                    className="absolute -inset-2 rounded-full border border-danger/70"
                    initial={{ scale: 0.6, opacity: 0.9 }}
                    animate={{ scale: 2.4, opacity: 0 }}
                    transition={{
                      duration: 1.2,
                      delay: ring * 0.5,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                ))
              : null}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <motion.span
        className="absolute -translate-x-1/2 rounded-lg border border-danger/50 bg-bg-base/95 px-2.5 py-1 font-mono text-[15px] font-bold tracking-wider text-danger shadow-[0_0_24px_-6px_rgb(var(--danger)/0.8)]"
        style={{ left: BREAK.x + 15, top: BREAK.y - 64 }}
        initial={false}
        animate={{ opacity: lost ? 1 : 0.15, y: lost ? 0 : 6 }}
        transition={{ duration: animated ? DURATION.base : 0, ease: EASE.outExpo }}
      >
        404
      </motion.span>

      {SERVICES.map(({ x, y, icon: Icon }) => (
        <span
          key={`${x}-${y}`}
          className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-border bg-bg-elevated text-text-muted"
          style={{ left: x, top: y }}
        >
          <Icon size={13} />
        </span>
      ))}

      {/* Неизвестный узел за обрывом */}
      <span
        className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-border bg-bg-elevated/80 font-mono text-[14px] text-text-muted"
        style={{ left: 436, top: 200 }}
      >
        ?
      </span>

      {/* «Главная» */}
      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
        style={{ left: HOME.x, top: HOME.y }}
      >
        <span
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl border bg-bg-elevated transition-all duration-500',
            step === STEP.home
              ? 'border-accent-secondary text-accent-secondary shadow-glow-cyan'
              : 'border-border text-text-secondary',
          )}
        >
          <Home size={18} />
        </span>
        <span className="max-w-[110px] truncate text-[10.5px] font-medium text-text-secondary">
          {text.home}
        </span>
      </div>
    </div>
  );
}
