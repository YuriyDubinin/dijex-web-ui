import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  FileSpreadsheet,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  StickyNote,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 480×360: сверху полоса «было / стало» и KPI, ниже — доска из трёх колонок. */
const BOARD_TOP = 76;
const COLUMN_X = [16, 168, 320] as const;
const COLUMN_W = 144;
const CARD_H = 50;
const CARD_GAP = 8;
const CARD_TOP = BOARD_TOP + 36;

/** «Хаос» до автоматизации: разрозненные таблицы, письма, чаты, стикеры. */
const CHAOS: readonly { icon: LucideIcon; x: number; y: number; delay: number }[] = [
  { icon: FileSpreadsheet, x: 60, y: 120, delay: 0 },
  { icon: Mail, x: 190, y: 160, delay: 0.3 },
  { icon: MessageCircle, x: 330, y: 110, delay: 0.6 },
  { icon: StickyNote, x: 110, y: 250, delay: 0.2 },
  { icon: Phone, x: 270, y: 260, delay: 0.5 },
  { icon: FileText, x: 400, y: 220, delay: 0.1 },
];

/** Колонка каждой карточки на каждом шаге: карточки переезжают «Заявка → Согласование → Готово». */
const COLUMNS_BY_STEP: readonly (readonly number[])[] = [
  [0, 0, 1, 2],
  [0, 0, 1, 2],
  [1, 0, 1, 2],
  [2, 0, 1, 2],
  [2, 1, 2, 2],
  [2, 1, 2, 2],
];

const OWNERS = ['AK', 'MR', 'LW', 'SM'] as const;

/** Шаги: хаос → доска собирается → карточки переезжают по колонкам → пауза с KPI. */
const STEPS = [1800, 900, 1000, 1000, 1100, 1800] as const;
const STEP = { chaos: 0, board: 1, hold: 5 } as const;

/** «Цифровые процессы» в карточке направления: разрозненная ручная работа превращается в управляемый поток. */
export function ProcessFlowVisual() {
  const text = useContent('visuals', 'processFlow');
  const format = useVisualFormat();
  const { animated, full, interactive } = useVisual();
  const { step } = useVisualLoop(STEPS, { poster: STEP.hold });
  const [hovered, setHovered] = useState<number | null>(null);
  const chaos = step === STEP.chaos;
  const columns = COLUMNS_BY_STEP[step] ?? COLUMNS_BY_STEP[STEP.hold] ?? [];
  const spring = animated ? SPRING.soft : { duration: 0 };
  const fade = { duration: animated ? DURATION.slow : 0, ease: EASE.outExpo };

  // Позиция карточки — по порядку внутри своей колонки
  const slots = columns.map(
    (column, index) => columns.slice(0, index).filter((other) => other === column).length,
  );

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-10 top-24 h-48 rounded-full bg-glow-indigo opacity-60 blur-2xl" />

      {/* Было / стало + KPI */}
      <div
        className="absolute flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-elevated/90 px-2 py-1.5"
        style={{ left: 16, top: 16, width: 448, height: 44 }}
      >
        <div className="relative flex min-w-0 rounded-lg bg-bg-base/60 p-0.5 text-[10.5px] font-medium">
          {[text.before, text.after].map((label, index) => {
            const current = (index === 0) === chaos;
            return (
              <span
                key={label}
                className={cn(
                  'relative min-w-0 truncate px-2.5 py-1 transition-colors duration-300',
                  current
                    ? index === 0
                      ? 'text-warning'
                      : 'text-text-primary'
                    : 'text-text-muted',
                )}
              >
                <span
                  className={cn(
                    'absolute inset-0 rounded-md transition-opacity duration-300',
                    index === 0 ? 'bg-warning/15' : 'bg-accent-primary/25',
                    current ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="relative">{label}</span>
              </span>
            );
          })}
        </div>
        <motion.div
          className="flex min-w-0 items-center gap-2"
          initial={false}
          animate={{ opacity: chaos ? 0.25 : 1 }}
          transition={fade}
        >
          <span className="truncate text-[10.5px] text-text-secondary">{text.kpi}</span>
          <span className="flex items-center gap-1 whitespace-nowrap font-display text-[17px] font-bold text-success">
            <TrendingDown size={15} />
            {format.signedPercent(-0.64)}
          </span>
        </motion.div>
      </div>

      {/* Колонки доски */}
      {COLUMN_X.map((x, index) => {
        const count = columns.filter((column) => column === index).length;
        return (
          <motion.div
            key={x}
            className="absolute rounded-xl border border-border/80 bg-bg-surface/70"
            style={{ left: x, top: BOARD_TOP, width: COLUMN_W, height: 266 }}
            initial={false}
            animate={{ opacity: chaos ? 0.25 : 1 }}
            transition={fade}
          >
            <div className="flex items-center justify-between gap-2 px-2.5 py-2">
              <span className="flex min-w-0 items-center gap-1.5 text-[10.5px] font-semibold text-text-secondary">
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    ['bg-accent-secondary', 'bg-warning', 'bg-success'][index],
                  )}
                />
                <span className="truncate">{text.columns[index]}</span>
              </span>
              <span className="rounded-md bg-bg-base/70 px-1.5 font-mono text-[10px] text-text-muted">
                {count}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Карточки задач */}
      {columns.map((column, index) => {
        const done = column === 2;
        const left = (COLUMN_X[column] ?? 0) + 8;
        const top = CARD_TOP + (slots[index] ?? 0) * (CARD_H + CARD_GAP);
        return (
          <motion.div
            key={index}
            className="absolute left-0 top-0"
            style={{ width: COLUMN_W - 16, zIndex: hovered === index ? 5 : 1 }}
            initial={false}
            animate={{
              x: left,
              y: hovered === index ? top - 3 : top,
              opacity: chaos ? 0 : 1,
              scale: chaos ? 0.85 : 1,
            }}
            transition={spring}
            onPointerEnter={interactive ? () => setHovered(index) : undefined}
            onPointerLeave={interactive ? () => setHovered(null) : undefined}
          >
            <div
              className={cn(
                'flex flex-col gap-1.5 rounded-lg border bg-bg-elevated px-2.5 py-2 transition-[border-color,box-shadow] duration-500',
                done
                  ? 'border-success/50 shadow-[0_0_20px_-8px_rgb(var(--success)/0.8)]'
                  : 'border-border',
              )}
              style={{ height: CARD_H }}
            >
              <span className="flex items-center gap-1.5">
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-text-primary">
                  {text.tasks[index]}
                </span>
                {done ? (
                  <motion.span
                    key="done"
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success text-bg-base"
                    initial={animated ? { scale: 0 } : false}
                    animate={{ scale: 1 }}
                    transition={animated ? SPRING.snappy : { duration: 0 }}
                  >
                    <Check size={10} strokeWidth={3} />
                  </motion.span>
                ) : null}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 flex-1 rounded-full bg-text-muted/20" />
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-primary/25 font-mono text-[7px] font-semibold text-accent-primary">
                  {OWNERS[index]}
                </span>
              </span>
            </div>
            <AnimatePresence>
              {hovered === index ? (
                <motion.span
                  className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-bg-base px-1.5 py-0.5 text-[9px] text-text-secondary"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.fast }}
                >
                  {text.owner}: {OWNERS[index]}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Хаос «до»: дрожит, мигает уведомлениями, затягивается в доску */}
      {CHAOS.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={index}
            className="absolute left-0 top-0"
            initial={false}
            animate={
              chaos
                ? { x: item.x, y: item.y, opacity: 1, scale: 1 }
                : { x: COLUMN_X[0] + 50, y: CARD_TOP + 10, opacity: 0, scale: 0.3 }
            }
            transition={{
              duration: animated ? DURATION.slow : 0,
              ease: EASE.inOut,
              delay: animated && !chaos ? index * 0.04 : 0,
            }}
          >
            <span
              className={cn(
                'relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-bg-elevated text-text-muted',
                full && 'animate-jitter',
              )}
              style={{ animationDelay: `${item.delay}s` }}
            >
              <Icon size={18} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-bg-elevated bg-danger" />
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
