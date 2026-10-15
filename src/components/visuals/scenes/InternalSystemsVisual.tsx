import { AnimatePresence, motion } from 'framer-motion';
import {
  FileBarChart,
  Inbox,
  LayoutDashboard,
  Truck,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { pick } from '../pick';
import { RollingValue } from '../parts/RollingValue';
import { StatusPill } from '../parts/StatusPill';
import { WindowChrome } from '../parts/WindowChrome';
import { useVisualTicker } from '../useVisualLoop';

const NAV_ICONS: readonly LucideIcon[] = [LayoutDashboard, Inbox, Truck, Warehouse, FileBarChart];

type Page = {
  requests: number;
  minutes: number;
  load: number;
  /** Заявки по дням недели. */
  week: readonly number[];
};

/** Данные «страниц» админки — демонстрационные. */
const PAGES: readonly [Page, ...Page[]] = [
  { requests: 128, minutes: 14, load: 0.82, week: [62, 78, 71, 96, 88, 112, 128] },
  { requests: 136, minutes: 12, load: 0.79, week: [70, 66, 84, 91, 104, 98, 136] },
  { requests: 141, minutes: 11, load: 0.86, week: [58, 74, 90, 86, 118, 126, 141] },
  { requests: 133, minutes: 13, load: 0.74, week: [80, 72, 77, 95, 101, 119, 133] },
  { requests: 149, minutes: 10, load: 0.88, week: [66, 83, 97, 109, 121, 137, 149] },
];

const CHART_W = 440;
const CHART_H = 46;
const ROWS = [1042, 1043, 1044, 1045] as const;
/** Раз в столько тиков (по 2 с) меняется раздел в сайдбаре. */
const TICKS_PER_PAGE = 3;

/** Вкладка «Внутренние системы»: дашборд руководителя, который живёт — разделы, метрики, статусы заявок. */
export function InternalSystemsVisual() {
  const text = useContent('visuals', 'internalSystems');
  const format = useVisualFormat();
  const { animated } = useVisual();
  const tick = useVisualTicker(2000);
  const pageIndex = Math.floor(tick / TICKS_PER_PAGE) % PAGES.length;
  const page = pick(PAGES, pageIndex);
  const approved = (tick + 2) % (ROWS.length + 1);
  const fade = { duration: animated ? DURATION.slow : 0, ease: EASE.outExpo };

  const max = Math.max(...page.week) * 1.1;
  const points = page.week.map(
    (value, index) =>
      [(index / (page.week.length - 1)) * CHART_W, CHART_H - (value / max) * CHART_H] as const,
  );
  const line = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const peak = points[points.length - 1] ?? [CHART_W, 0];
  const kpis = [
    format.integer(page.requests),
    format.minutes(page.minutes),
    format.percent(page.load),
  ];

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated/95 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]">
      <WindowChrome url="ops.company.app" />
      <div className="flex min-h-0 flex-1">
        {/* Сайдбар */}
        <nav className="flex w-[132px] shrink-0 flex-col gap-0.5 border-r border-border bg-bg-base/40 p-2">
          <span className="mb-2 flex items-center gap-1.5 px-1.5 pt-1 font-display text-[11px] font-bold text-text-primary">
            <span className="h-3.5 w-3.5 rounded bg-brand-gradient" />
            Ops
          </span>
          {text.nav.map((label, index) => {
            const Icon = NAV_ICONS[index] ?? LayoutDashboard;
            const current = index === pageIndex;
            return (
              <span
                key={label}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10.5px] transition-colors duration-300',
                  current ? 'text-text-primary' : 'text-text-muted',
                )}
              >
                <span
                  className={cn(
                    'absolute inset-0 rounded-lg bg-accent-primary/15 transition-opacity duration-300',
                    current ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent-primary transition-opacity duration-300',
                    current ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon size={12} className="relative shrink-0" />
                <span className="relative truncate">{label}</span>
              </span>
            );
          })}
        </nav>

        {/* Контент раздела */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
          <div className="flex items-center justify-between gap-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={pageIndex}
                className="truncate font-display text-[14px] font-semibold text-text-primary"
                initial={animated ? { opacity: 0, x: -8 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={animated ? { opacity: 0, x: 8 } : undefined}
                transition={{ duration: animated ? DURATION.fast : 0 }}
              >
                {text.nav[pageIndex]}
              </motion.span>
            </AnimatePresence>
            <StatusPill tone="success">live</StatusPill>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {text.kpis.map((label, index) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-border bg-bg-surface/80 px-2.5 py-1.5"
              >
                <span className="block truncate text-[9.5px] text-text-muted">{label}</span>
                <RollingValue
                  value={kpis[index] ?? ''}
                  className={cn(
                    'mt-1 font-display text-[18px] font-bold leading-none',
                    ['text-text-primary', 'text-accent-secondary', 'text-accent-primary'][index],
                  )}
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-bg-surface/80 px-3 pb-2 pt-2">
            <span className="block truncate text-[9.5px] text-text-muted">{text.chart}</span>
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H + 14}`}
              className="mt-1.5 w-full overflow-visible"
            >
              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1={0}
                  x2={CHART_W}
                  y1={CHART_H * ratio}
                  y2={CHART_H * ratio}
                  stroke="rgb(var(--border))"
                  strokeDasharray="2 4"
                />
              ))}
              <motion.path
                key={`area-${pageIndex}`}
                d={`${line} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`}
                fill="url(#internal-area)"
                initial={animated ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ ...fade, delay: animated ? 0.3 : 0 }}
              />
              <motion.path
                key={`line-${pageIndex}`}
                d={line}
                fill="none"
                stroke="rgb(var(--accent-primary))"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={animated ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={{ duration: animated ? DURATION.cinematic : 0, ease: EASE.outExpo }}
              />
              <motion.g
                key={`peak-${pageIndex}`}
                initial={animated ? { opacity: 0, scale: 0.6 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...fade, delay: animated ? 0.9 : 0 }}
                style={{ transformOrigin: `${peak[0]}px ${peak[1]}px` }}
              >
                <circle
                  cx={peak[0]}
                  cy={peak[1]}
                  r={7}
                  fill="rgb(var(--accent-primary))"
                  opacity={0.25}
                />
                <circle cx={peak[0]} cy={peak[1]} r={3.5} fill="rgb(var(--accent-secondary))" />
              </motion.g>
              {page.week.map((_, index) => (
                <text
                  key={index}
                  x={(index / (page.week.length - 1)) * CHART_W}
                  y={CHART_H + 12}
                  textAnchor={
                    index === 0 ? 'start' : index === page.week.length - 1 ? 'end' : 'middle'
                  }
                  className="fill-text-muted text-[9px]"
                >
                  {format.weekday(index)}
                </text>
              ))}
              <defs>
                <linearGradient id="internal-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--accent-primary))" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="rgb(var(--accent-primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-bg-surface/80">
            <div className="flex justify-between border-b border-border px-3 py-0.5 text-[9px] uppercase leading-4 tracking-wider text-text-muted">
              <span>{text.request}</span>
              <span>{text.status}</span>
            </div>
            {ROWS.map((id, index) => {
              const isApproved = index < approved;
              const justApproved = index === approved - 1;
              return (
                <div
                  key={id}
                  className="relative flex h-[21px] items-center justify-between gap-3 px-3"
                >
                  {justApproved && animated ? (
                    <motion.span
                      key={`flash-${tick}`}
                      className="absolute inset-0 bg-success/15"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: DURATION.cinematic, ease: EASE.outExpo }}
                    />
                  ) : null}
                  <span className="relative min-w-0 truncate text-[10.5px] text-text-secondary">
                    {text.request} <span className="font-mono text-text-primary">#{id}</span>
                  </span>
                  <StatusPill
                    tone={isApproved ? 'success' : 'warning'}
                    className="relative shrink-0"
                  >
                    {isApproved ? text.approved : text.inProgress}
                  </StatusPill>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
