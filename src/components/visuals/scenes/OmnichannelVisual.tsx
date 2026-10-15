import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Globe,
  Instagram,
  Mail,
  MessageCircle,
  MessagesSquare,
  Send,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { pick } from '../pick';
import { RollingValue } from '../parts/RollingValue';
import { useVisualTicker } from '../useVisualLoop';

/** Сцена 640×400: каналы по дуге слева, ядро агента в центре, «лента перевода» справа. */
const CORE = { x: 330, y: 178 } as const;

const CHANNELS: readonly { name: string; icon: LucideIcon }[] = [
  { name: 'WhatsApp', icon: MessageCircle },
  { name: 'Telegram', icon: Send },
  { name: 'Instagram', icon: Instagram },
  { name: 'LINE', icon: MessagesSquare },
  { name: 'Email', icon: Mail },
  { name: 'Web', icon: Globe },
];

/** Позиции каналов на дуге (центр дуги — справа, у ядра). */
const channelPosition = (index: number) => {
  const angle = ((-62 + index * (124 / (CHANNELS.length - 1))) * Math.PI) / 180;
  return { x: CORE.x - 250 * Math.cos(angle), y: CORE.y + 150 * Math.sin(angle) };
};

const flightPath = (index: number) => {
  const { x, y } = channelPosition(index);
  const midX = (x + CORE.x) / 2;
  return `M ${x.toFixed(1)} ${y.toFixed(1)} C ${midX.toFixed(1)} ${y.toFixed(1)} ${midX.toFixed(1)} ${CORE.y} ${CORE.x - 56} ${CORE.y}`;
};

/** Приветствия — данные, не переводятся. */
const GREETINGS: readonly [{ text: string; lang: string }, ...{ text: string; lang: string }[]] = [
  { text: 'Hello', lang: 'en' },
  { text: 'Привет', lang: 'ru' },
  { text: 'Bonjour', lang: 'fr' },
  { text: 'Hallo', lang: 'de' },
  { text: 'こんにちは', lang: 'ja' },
  { text: '你好', lang: 'zh' },
  { text: 'สวัสดี', lang: 'th' },
  { text: 'Hola', lang: 'es' },
];

/** Страница агента поддержки, первый экран: все каналы сходятся в одного агента, который говорит на любом языке. */
export function OmnichannelVisual() {
  const text = useContent('visuals', 'omnichannel');
  const format = useVisualFormat();
  const { animated, full } = useVisual();
  const tick = useVisualTicker(1600);
  const source = tick % CHANNELS.length;
  const greeting = pick(GREETINGS, tick);
  const live = 128 + ((tick * 7) % 9) - 4;
  const fade = { duration: animated ? DURATION.slow : 0, ease: EASE.outExpo };

  return (
    <div className="absolute inset-0">
      <div
        className="absolute rounded-full bg-glow-indigo opacity-80 blur-3xl"
        style={{ left: CORE.x - 160, top: CORE.y - 130, width: 320, height: 260 }}
      />

      <svg viewBox="0 0 640 400" className="absolute inset-0 h-full w-full overflow-visible">
        {CHANNELS.map((channel, index) => (
          <path
            key={channel.name}
            d={flightPath(index)}
            fill="none"
            stroke={
              index === source && animated ? 'rgb(var(--accent-secondary))' : 'rgb(var(--border))'
            }
            strokeOpacity={index === source && animated ? 0.7 : 1}
            strokeWidth={1.25}
            strokeDasharray="3 5"
            className="transition-[stroke] duration-500"
          />
        ))}
        <ellipse
          cx={CORE.x}
          cy={CORE.y}
          rx={96}
          ry={34}
          fill="none"
          stroke="url(#omni-orbit)"
          transform={`rotate(-14 ${CORE.x} ${CORE.y})`}
        />
        <defs>
          <linearGradient id="omni-orbit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent-primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="rgb(var(--accent-secondary))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(var(--accent-glow))" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Каналы */}
      {CHANNELS.map((channel, index) => {
        const { x, y } = channelPosition(index);
        const Icon = channel.icon;
        const current = index === source && animated;
        return (
          <div
            key={channel.name}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: x, top: y }}
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border bg-bg-elevated transition-all duration-500',
                current
                  ? 'scale-110 border-accent-secondary text-accent-secondary shadow-glow-cyan'
                  : 'border-border text-text-secondary',
              )}
            >
              <Icon size={16} />
            </span>
            <span className="font-mono text-[9px] text-text-muted">{channel.name}</span>
          </div>
        );
      })}

      {/* Сообщение летит из канала к агенту */}
      {animated ? (
        <span
          key={`flight-${tick}`}
          className="absolute left-0 top-0 animate-travel"
          style={
            {
              offsetPath: `path('${flightPath(source)}')`,
              offsetRotate: '0deg',
              '--travel-duration': '1.1s',
            } as CSSProperties
          }
        >
          <span className="flex h-5 w-7 items-center justify-center rounded-lg rounded-bl-sm bg-accent-secondary text-bg-base shadow-[0_0_14px_rgb(var(--accent-secondary)/0.8)]">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((dot) => (
                <span key={dot} className="h-1 w-1 rounded-full bg-bg-base" />
              ))}
            </span>
          </span>
        </span>
      ) : null}

      {/* Ядро агента */}
      <div
        className="absolute"
        style={{ left: CORE.x - 56, top: CORE.y - 56, width: 112, height: 112 }}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(var(--accent-secondary)/0.9),rgb(var(--accent-primary)/0.85)_45%,rgb(var(--accent-glow)/0.6)_75%,transparent_100%)] shadow-[0_0_80px_-10px_rgb(var(--accent-primary)/0.8)]',
            full && 'animate-breathe',
          )}
        />
        <div
          className={cn(
            'absolute inset-2 rounded-full bg-[conic-gradient(from_0deg,transparent,rgb(255_255_255/0.35),transparent_40%,rgb(var(--accent-secondary)/0.5),transparent_75%)] opacity-70 mix-blend-overlay',
            full && 'animate-spin-slow',
          )}
        />
        <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_24px_rgb(255_255_255/0.35)]" />
        <div className="absolute inset-0 flex items-center justify-center text-white/90">
          <Sparkles size={30} strokeWidth={1.5} />
        </div>
        {animated ? (
          <motion.span
            key={`pulse-${tick}`}
            className="absolute inset-0 rounded-full border-2 border-accent-secondary"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1, 1.8], opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.6, times: [0, 0.62, 1], ease: 'easeOut' }}
          />
        ) : null}
      </div>
      <span
        className="absolute max-w-[140px] -translate-x-1/2 truncate text-[11px] font-semibold text-text-primary"
        style={{ left: CORE.x, top: CORE.y + 66 }}
      >
        {text.agent}
      </span>

      {/* Сейчас в диалогах */}
      <div
        className="absolute flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-bg-elevated/95 px-3 py-1.5"
        style={{ left: CORE.x, top: CORE.y + 86 }}
      >
        <span className="relative flex h-2 w-2">
          {full ? (
            <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
          ) : null}
          <span className="relative h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="max-w-[150px] truncate text-[10px] text-text-secondary">{text.live}</span>
        <RollingValue
          value={format.integer(live)}
          className="font-mono text-[12px] font-semibold text-text-primary"
        />
      </div>

      {/* Лента перевода */}
      <div
        className="absolute flex flex-col gap-2 rounded-xl border border-border bg-bg-elevated/95 p-3"
        style={{ left: 466, top: CORE.y - 66, width: 158, height: 132 }}
      >
        <span className="truncate text-[9.5px] uppercase tracking-wider text-text-muted">
          {text.languages}
        </span>
        <div className="relative flex flex-1 items-center">
          <AnimatePresence initial={false}>
            <motion.span
              key={greeting.text}
              lang={greeting.lang}
              className="absolute inset-x-0 truncate font-display text-[24px] font-bold text-text-primary"
              initial={animated ? { opacity: 0, y: 14, filter: 'blur(6px)' } : false}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={animated ? { opacity: 0, y: -14, filter: 'blur(6px)' } : { opacity: 0 }}
              transition={fade}
            >
              {greeting.text}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1.5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={greeting.lang}
              className="rounded-md border border-accent-primary/40 bg-accent-primary/15 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase text-accent-primary"
              initial={animated ? { opacity: 0, y: -4 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={animated ? { opacity: 0, y: 4 } : undefined}
              transition={{ duration: animated ? DURATION.fast : 0 }}
            >
              {greeting.lang}
            </motion.span>
          </AnimatePresence>
          <span className="flex flex-1 gap-0.5">
            {GREETINGS.map((item, index) => (
              <span
                key={item.lang}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  index === tick % GREETINGS.length ? 'bg-accent-secondary' : 'bg-text-muted/25',
                )}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
