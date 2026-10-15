import { motion } from 'framer-motion';
import { Monitor, RefreshCw, Server } from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { DURATION } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { Packet } from '../parts/Packet';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 480×360: два узла, провод между ними оборван; пакеты доходят до разрыва и гаснут, у разрыва — искры. */
const LEFT = { x: 92, y: 180 } as const;
const RIGHT = { x: 388, y: 180 } as const;
const GAP_FROM = 222;
const GAP_TO = 258;
const WIRE_LEFT = `M ${LEFT.x + 30} 180 C 160 180 180 168 ${GAP_FROM} 180`;
const WIRE_RIGHT = `M ${GAP_TO} 180 C 300 192 320 180 ${RIGHT.x - 30} 180`;

/** Искры: короткие штрихи из концов обрыва. */
const SPARKS = [
  { x: GAP_FROM, angle: -40, length: 12 },
  { x: GAP_FROM, angle: 20, length: 9 },
  { x: GAP_FROM, angle: -75, length: 7 },
  { x: GAP_TO, angle: 200, length: 11 },
  { x: GAP_TO, angle: 150, length: 8 },
  { x: GAP_TO, angle: 250, length: 7 },
] as const;

/** Шаги: пакет идёт → искрит у разрыва → попытка переподключения. */
const STEPS = [1100, 700, 1300] as const;
const STEP = { send: 0, spark: 1, retry: 2 } as const;

/** Ошибка маршрута: оборванное соединение и попытка переподключиться. */
export function BrokenWireVisual() {
  const text = useContent('visuals', 'brokenWire');
  const { animated, full } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.spark });
  const sparking = step === STEP.spark;

  const node = (Icon: typeof Server, position: { x: number; y: number }) => (
    <span
      className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-border bg-bg-elevated text-text-secondary"
      style={{ left: position.x, top: position.y }}
    >
      <Icon size={20} />
    </span>
  );

  return (
    <div className="absolute inset-0">
      <div className="absolute left-40 top-24 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(var(--danger)/0.25),transparent_70%)] blur-xl" />
      <svg viewBox="0 0 480 360" className="absolute inset-0 h-full w-full overflow-visible">
        <path
          d={WIRE_LEFT}
          fill="none"
          stroke="rgb(var(--accent-primary))"
          strokeOpacity={0.7}
          strokeWidth={1.5}
        />
        <path
          d={WIRE_RIGHT}
          fill="none"
          stroke="rgb(var(--border))"
          strokeWidth={1.5}
          strokeDasharray="3 4"
        />
        {SPARKS.map((spark, index) => {
          const radians = (spark.angle * Math.PI) / 180;
          return (
            <motion.line
              key={index}
              x1={spark.x}
              y1={180}
              x2={spark.x + Math.cos(radians) * spark.length}
              y2={180 + Math.sin(radians) * spark.length}
              stroke={index % 2 ? 'rgb(var(--warning))' : 'rgb(var(--danger))'}
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={false}
              animate={{
                opacity: sparking ? [0, 1, 0.2, 1, 0] : 0.25,
                pathLength: sparking ? [0, 1, 1] : 1,
              }}
              transition={{ duration: animated ? 0.6 : 0, delay: animated ? index * 0.04 : 0 }}
            />
          );
        })}
        <circle cx={GAP_FROM} cy={180} r={3} fill="rgb(var(--danger))" />
        <circle cx={GAP_TO} cy={180} r={3} fill="rgb(var(--danger))" opacity={0.6} />
      </svg>

      {step === STEP.send ? (
        <Packet key={`send-${cycle}`} d={WIRE_LEFT} duration={1} size={8} tone="primary" />
      ) : null}

      {node(Monitor, LEFT)}
      {node(Server, RIGHT)}

      {/* Переподключение */}
      <motion.span
        className="absolute flex max-w-[200px] -translate-x-1/2 items-center gap-1.5 rounded-full border border-warning/50 bg-bg-base/95 px-2.5 py-1 text-[10.5px] text-warning"
        style={{ left: (GAP_FROM + GAP_TO) / 2, top: 236 }}
        initial={false}
        animate={{ opacity: step === STEP.retry ? 1 : 0.35 }}
        transition={{ duration: animated ? DURATION.base : 0 }}
      >
        <RefreshCw
          size={11}
          className={cn(
            'shrink-0',
            full && step === STEP.retry && 'animate-spin [animation-duration:1.2s]',
          )}
        />
        <span className="truncate">{text.retry}</span>
      </motion.span>
    </div>
  );
}
