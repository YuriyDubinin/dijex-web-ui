import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import type { IconKey } from '@/components/ui/iconMap';
import { useActiveInViewport, useLoopDebug, usePointerFine } from '@/motion/hooks';
import { useMotionTier } from '@/motion/tier';
import { SPRING_VALUE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

/** Сцена рисуется в координатах 400×400 и масштабируется под контейнер. */
const STAGE = 400;
const CENTER = STAGE / 2;

type OrbitNode = { channel: string; icon: IconKey };

type Orbit = {
  rx: number;
  ry: number;
  /** Наклон эллипса, градусы. */
  tilt: number;
  /** Секунд на оборот. */
  duration: number;
  nodes: readonly OrbitNode[];
};

const ORBITS: readonly Orbit[] = [
  {
    rx: 182,
    ry: 62,
    tilt: -16,
    duration: 28,
    nodes: [
      { channel: 'Telegram', icon: 'send' },
      { channel: 'WhatsApp', icon: 'messageCircle' },
      { channel: 'Instagram', icon: 'globe' },
    ],
  },
  {
    rx: 150,
    ry: 92,
    tilt: 34,
    duration: 22,
    nodes: [
      { channel: 'LINE', icon: 'messagesSquare' },
      { channel: 'Email', icon: 'mail' },
      { channel: 'Web', icon: 'code' },
    ],
  },
  {
    rx: 112,
    ry: 40,
    tilt: 80,
    duration: 16,
    nodes: [
      { channel: 'App', icon: 'smartphone' },
      { channel: 'API', icon: 'zap' },
    ],
  },
];

const ellipsePath = (rx: number, ry: number) =>
  `M ${CENTER - rx},${CENTER} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0`;

type Props = {
  /** Меняется при каждом новом сообщении — ядро «вспыхивает». */
  pulseKey?: string | number;
  /** Канал текущего диалога — его узел подсвечивается. */
  activeChannel?: string;
  className?: string;
};

/**
 * «Ядро» AI-агента: светящаяся сфера, орбиты с узлами-каналами, отклик на курсор и сообщения чата.
 * Всё на CSS/SVG: offset-path для узлов, никакой графической библиотеки.
 */
export function AgentCore({ pulseKey, activeChannel, className }: Props) {
  const { t } = useTranslation();
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const rootRef = useRef<HTMLDivElement>(null);
  const active = useActiveInViewport(rootRef);
  const [scale, setScale] = useState(1);
  useLoopDebug('agent-core', active && tier !== 'off');

  const rotateX = useSpring(useMotionValue(0), SPRING_VALUE.tilt);
  const rotateY = useSpring(useMotionValue(0), SPRING_VALUE.tilt);
  const interactive = tier === 'full' && pointerFine;
  const orbits = tier === 'lite' ? ORBITS.slice(0, 1) : ORBITS;
  const animated = tier !== 'off';

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / STAGE);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(x * 16);
    rotateX.set(-y * 16);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={t('images.supportAgent')}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      className={cn('relative aspect-square w-full [perspective:1000px]', className)}
    >
      <motion.div
        className={cn(
          'absolute left-1/2 top-1/2',
          !active && '[&_*]:[animation-play-state:paused]',
        )}
        style={{
          width: STAGE,
          height: STAGE,
          x: '-50%',
          y: '-50%',
          scale,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Внешнее свечение */}
        <div
          className={cn(
            'absolute inset-10 rounded-full bg-glow-indigo blur-3xl',
            animated && 'animate-glow-breathe',
          )}
        />
        <div className="absolute inset-24 rounded-full bg-glow-cyan opacity-40 blur-2xl" />

        {/* Орбиты */}
        {orbits.map((orbit, orbitIndex) => (
          <div
            key={orbitIndex}
            className="absolute inset-0"
            style={{ transform: `rotate(${orbit.tilt}deg)` }}
          >
            <svg
              viewBox={`0 0 ${STAGE} ${STAGE}`}
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <path
                d={ellipsePath(orbit.rx, orbit.ry)}
                fill="none"
                stroke="url(#agent-orbit-gradient)"
                strokeWidth={1}
                strokeDasharray={orbitIndex === 1 ? '2 6' : undefined}
                opacity={0.55}
              />
            </svg>
            {orbit.nodes.map((node, nodeIndex) => {
              const highlighted = node.channel === activeChannel;
              const style = {
                offsetPath: `path('${ellipsePath(orbit.rx, orbit.ry)}')`,
                offsetRotate: '0deg',
                '--orbit-duration': `${orbit.duration}s`,
                // Узлы равномерно распределены по орбите: отрицательная задержка = сдвиг фазы
                animationDelay: `${-(orbit.duration / orbit.nodes.length) * nodeIndex}s`,
                offsetDistance: `${(100 / orbit.nodes.length) * nodeIndex}%`,
              } as CSSProperties;
              return (
                <div
                  key={node.channel}
                  title={node.channel}
                  className={cn('absolute left-0 top-0', animated && 'animate-orbit')}
                  style={style}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border bg-bg-elevated/90 backdrop-blur-sm transition-all duration-300',
                      highlighted
                        ? 'scale-125 border-accent-secondary text-accent-secondary shadow-glow-cyan'
                        : 'border-border text-text-secondary',
                    )}
                    style={{ transform: `rotate(${-orbit.tilt}deg)` }}
                  >
                    <Icon name={node.icon} size={15} />
                  </span>
                </div>
              );
            })}
          </div>
        ))}

        {/* Сфера */}
        <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2">
          <div
            className={cn(
              'absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(var(--accent-secondary)/0.9),rgb(var(--accent-primary)/0.85)_45%,rgb(var(--accent-glow)/0.6)_75%,transparent_100%)] shadow-[0_0_80px_-10px_rgb(var(--accent-primary)/0.8)]',
              animated && 'animate-breathe',
            )}
          />
          <div
            className={cn(
              'absolute inset-2 rounded-full bg-[conic-gradient(from_0deg,transparent,rgb(255_255_255/0.35),transparent_40%,rgb(var(--accent-secondary)/0.5),transparent_75%)] opacity-70 mix-blend-overlay',
              animated && 'animate-spin-slow',
            )}
          />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_24px_rgb(255_255_255/0.35)]" />
          <div className="absolute inset-0 flex items-center justify-center text-white/90">
            <Sparkles size={34} strokeWidth={1.5} />
          </div>
          <AnimatePresence>
            {animated && pulseKey !== undefined ? (
              <motion.span
                key={pulseKey}
                className="absolute inset-0 rounded-full border-2 border-accent-secondary"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 1.9, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
            ) : null}
          </AnimatePresence>
        </div>

        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="agent-orbit-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(var(--accent-primary))" stopOpacity="0.1" />
              <stop offset="50%" stopColor="rgb(var(--accent-secondary))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="rgb(var(--accent-glow))" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
