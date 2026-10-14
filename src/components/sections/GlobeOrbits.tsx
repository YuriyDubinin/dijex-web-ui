import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMotionTier } from '@/motion/tier';
import { cn } from '@/lib/cn';

/** Точки-«клиенты» на глобусе (в % от рамки): вспыхивают по очереди. */
const PINGS = [
  { x: 38, y: 40 },
  { x: 56, y: 34 },
  { x: 64, y: 52 },
  { x: 46, y: 60 },
  { x: 30, y: 54 },
  { x: 70, y: 42 },
];

/**
 * Декор поверх иллюстрации глобуса: две наклонные орбиты с бегущими точками
 * и «пинги» клиентов по миру. Чистый SVG/CSS, бесконечные анимации только в full.
 */
export function GlobeOrbits() {
  const tier = useMotionTier();
  const full = tier === 'full';
  const delays = useMemo(() => PINGS.map((_, index) => index * 0.9), []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="globe-orbit" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--accent-primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(var(--accent-secondary))" stopOpacity="0.7" />
            <stop offset="100%" stopColor="rgb(var(--accent-primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[
          { rx: 175, ry: 46, rotate: -14, duration: 14 },
          { rx: 150, ry: 70, rotate: 22, duration: 20 },
        ].map((orbit, index) => {
          const d = `M ${200 - orbit.rx},150 a ${orbit.rx},${orbit.ry} 0 1,0 ${orbit.rx * 2},0 a ${orbit.rx},${orbit.ry} 0 1,0 ${-orbit.rx * 2},0`;
          return (
            <g key={index} transform={`rotate(${orbit.rotate} 200 150)`}>
              <motion.path
                d={d}
                fill="none"
                stroke="url(#globe-orbit)"
                strokeWidth={1}
                initial={tier === 'off' ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, delay: 0.3 + index * 0.3 }}
              />
              {full ? (
                <circle r="3" fill="rgb(var(--accent-secondary))">
                  <animateMotion dur={`${orbit.duration}s`} repeatCount="indefinite" path={d} />
                </circle>
              ) : null}
            </g>
          );
        })}
      </svg>
      {PINGS.map((ping, index) => (
        <span
          key={index}
          className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${ping.x}%`, top: `${ping.y}%` }}
        >
          <span className="absolute inset-0 rounded-full bg-accent-secondary" />
          {full ? (
            <span
              className={cn('absolute inset-0 animate-ping rounded-full bg-accent-secondary/70')}
              style={{ animationDelay: `${delays[index] ?? 0}s`, animationDuration: '2.8s' }}
            />
          ) : null}
        </span>
      ))}
    </div>
  );
}
