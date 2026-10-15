import { AnimatePresence, motion, useTransform } from 'framer-motion';
import {
  Database,
  FileSpreadsheet,
  Globe,
  MessageCircle,
  Package,
  ShoppingCart,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { Packet } from '../parts/Packet';
import { Wire } from '../parts/Wire';
import { useVisualLoop } from '../useVisualLoop';

/** Модули (порядок = порядок подписей в visuals.systemsMap.modules): портал, ERP, CRM, мессенджер, приложение. */
const CARD_W = 156;
const CARD_H = 82;
const MODULES: readonly { x: number; y: number; icon: LucideIcon; bars: readonly number[] }[] = [
  { x: 26, y: 72, icon: Globe, bars: [0.8, 0.55, 0.7] },
  { x: 242, y: 34, icon: Package, bars: [0.6, 0.9, 0.45] },
  { x: 458, y: 82, icon: Database, bars: [0.7, 0.4, 0.85] },
  { x: 398, y: 256, icon: MessageCircle, bars: [0.5, 0.75, 0.6] },
  { x: 86, y: 252, icon: Smartphone, bars: [0.9, 0.5, 0.65] },
];
const center = (index: number) => {
  const module = MODULES[index] ?? MODULES[0];
  return { x: (module?.x ?? 0) + CARD_W / 2, y: (module?.y ?? 0) + CARD_H / 2 };
};
const linkPath = (from: number, to: number) => {
  const a = center(from);
  const b = center(to);
  const midY = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${midY} ${b.x} ${midY} ${b.x} ${b.y}`;
};

const LINKS: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 3],
  [1, 3],
];

/** Путь события «Новый заказ»: портал → ERP → CRM → мессенджер. */
const CHAIN = [0, 1, 2, 3] as const;

/** Шаги: пауза → событие в портале → ERP → CRM → мессенджер → пауза. */
const STEPS = [800, 800, 800, 800, 1000, 1000] as const;
const STEP = { idle: 0, first: 1, last: 4 } as const;

const SHEET = { x: 250, y: 158, w: 140, h: 84 } as const;
const SHEET_CELLS = Array.from({ length: 12 }, (_, index) => index);

/** Страница цифровых процессов, первый экран: связанные системы, по которым проходит событие. */
export function SystemsMapVisual() {
  const text = useContent('visuals', 'systemsMap');
  const { animated, full, interactive, pointerX, pointerY } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.last });
  const rotateX = useTransform(pointerY, (value) => 16 - value * 8);
  const rotateY = useTransform(pointerX, (value) => value * 8);
  const chainIndex = step >= STEP.first && step <= STEP.last ? step - STEP.first : -1;
  const activeModule = chainIndex >= 0 ? (CHAIN[chainIndex] ?? -1) : -1;
  const reached = (module: number) => {
    const position = CHAIN.indexOf(module as (typeof CHAIN)[number]);
    return position >= 0 && position <= chainIndex;
  };
  const linkActive = ([from, to]: readonly [number, number]) => {
    const a = CHAIN.indexOf(from as (typeof CHAIN)[number]);
    const b = CHAIN.indexOf(to as (typeof CHAIN)[number]);
    return a >= 0 && b === a + 1 && b <= chainIndex;
  };
  const eventAt = activeModule >= 0 ? center(activeModule) : null;
  const showSheet = full && cycle === 0 && step <= STEP.first;

  return (
    <div className="absolute inset-0 [perspective:1400px]">
      <div className="absolute inset-x-16 top-16 h-64 rounded-full bg-glow-indigo opacity-70 blur-3xl" />
      <motion.div
        className="absolute inset-0"
        style={{
          rotateX: full ? (interactive ? rotateX : 16) : 0,
          rotateY: interactive ? rotateY : 0,
          rotateZ: full ? -4 : 0,
          scale: 0.9,
          transformStyle: 'preserve-3d',
        }}
      >
        <svg viewBox="0 0 640 400" className="absolute inset-0 h-full w-full overflow-visible">
          {LINKS.map((link) => (
            <Wire
              key={link.join('-')}
              d={linkPath(link[0], link[1])}
              active={linkActive(link)}
              dashed
            />
          ))}
        </svg>
        {chainIndex >= 1 ? (
          <Packet
            key={`event-${cycle}-${chainIndex}`}
            d={linkPath(CHAIN[chainIndex - 1] ?? 0, CHAIN[chainIndex] ?? 1)}
            duration={0.7}
            size={8}
          />
        ) : null}
        {/* Фоновый поток по остальным шинам */}
        {full ? <Packet d={linkPath(0, 4)} loop duration={3.2} tone="glow" size={4} /> : null}
        {full ? (
          <Packet d={linkPath(1, 3)} loop duration={4} delay={1.2} tone="glow" size={4} />
        ) : null}

        {MODULES.map((module, index) => {
          const Icon = module.icon;
          const current = index === activeModule;
          return (
            <motion.div
              key={index}
              className={cn(
                'absolute flex flex-col gap-2 rounded-xl border bg-bg-elevated/95 p-2.5 transition-[border-color,box-shadow] duration-500',
                current
                  ? 'border-accent-secondary shadow-[0_0_36px_-6px_rgb(var(--accent-secondary)/0.85)]'
                  : reached(index)
                    ? 'border-accent-primary/50'
                    : 'border-border',
              )}
              style={{ left: module.x, top: module.y, width: CARD_W, height: CARD_H }}
              initial={false}
              animate={{ y: current ? -6 : 0 }}
              transition={animated ? SPRING.soft : { duration: 0 }}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-500',
                    current
                      ? 'bg-accent-secondary text-bg-base'
                      : 'bg-accent-primary/15 text-accent-primary',
                  )}
                >
                  <Icon size={14} />
                </span>
                <span className="min-w-0 flex-1 text-[11px] font-semibold leading-tight text-text-primary line-clamp-2">
                  {text.modules[index]}
                </span>
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    reached(index) ? 'bg-success' : 'bg-text-muted/40',
                  )}
                />
              </span>
              <span className="flex flex-col gap-1">
                {module.bars.map((bar, barIndex) => (
                  <span key={barIndex} className="h-1 rounded-full bg-text-muted/15">
                    <span
                      className="block h-full rounded-full bg-text-muted/35"
                      style={{ width: `${bar * 100}%` }}
                    />
                  </span>
                ))}
              </span>
            </motion.div>
          );
        })}

        {/* Событие едет по цепочке */}
        <AnimatePresence>
          {eventAt ? (
            <motion.span
              key={`chip-${cycle}`}
              className="absolute left-0 top-0 flex max-w-[150px] items-center gap-1 whitespace-nowrap rounded-full border border-accent-secondary/50 bg-bg-base px-2 py-0.5 text-[9.5px] font-medium text-accent-secondary shadow-[0_0_16px_-4px_rgb(var(--accent-secondary)/0.8)]"
              initial={
                animated ? { x: eventAt.x - 40, y: eventAt.y - CARD_H / 2 - 30, opacity: 0 } : false
              }
              animate={{ x: eventAt.x - 40, y: eventAt.y - CARD_H / 2 - 30, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={animated ? SPRING.soft : { duration: 0 }}
            >
              <ShoppingCart size={10} className="shrink-0" />
              <span className="truncate">{text.event}</span>
            </motion.span>
          ) : null}
        </AnimatePresence>

        {/* Таблица «распадается» на ячейки, которые разлетаются по модулям — миграция из Excel */}
        {showSheet ? (
          <>
            <motion.div
              className="absolute flex flex-col overflow-hidden rounded-lg border border-success/40 bg-bg-elevated"
              style={{ left: SHEET.x, top: SHEET.y, width: SHEET.w, height: SHEET.h }}
              initial={false}
              animate={{ opacity: step === STEP.idle ? 1 : 0, scale: step === STEP.idle ? 1 : 0.9 }}
              transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
            >
              <span className="flex items-center gap-1 border-b border-border px-2 py-1 text-[9px] text-success">
                <FileSpreadsheet size={10} className="shrink-0" />
                <span className="truncate">{text.spreadsheet}</span>
              </span>
            </motion.div>
            {SHEET_CELLS.map((cell) => {
              const column = cell % 4;
              const row = Math.floor(cell / 4);
              const target = center(cell % MODULES.length);
              const start = { x: SHEET.x + 8 + column * 32, y: SHEET.y + 26 + row * 18 };
              return (
                <motion.span
                  key={cell}
                  className="absolute left-0 top-0 h-3.5 w-7 rounded-sm bg-success/30"
                  initial={{ x: start.x, y: start.y, opacity: 1 }}
                  animate={
                    step === STEP.idle
                      ? { x: start.x, y: start.y, opacity: 1, scale: 1 }
                      : { x: target.x - 14, y: target.y - 7, opacity: 0, scale: 0.5 }
                  }
                  transition={{
                    duration: DURATION.cinematic,
                    ease: EASE.inOut,
                    delay: cell * 0.03,
                  }}
                />
              );
            })}
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
