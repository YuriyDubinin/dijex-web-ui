import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { RollingValue } from '../parts/RollingValue';
import { Sparkline } from '../parts/Sparkline';
import { useVisualTicker } from '../useVisualLoop';

/** Спаны одной трассировки: начало и длительность — доли от общего времени. Названия технические, не переводятся. */
const SPANS: readonly { name: string; start: number; length: number; tone: string }[] = [
  { name: 'intent', start: 0, length: 0.07, tone: 'bg-accent-primary' },
  { name: 'retrieve', start: 0.06, length: 0.17, tone: 'bg-accent-glow' },
  { name: 'llm', start: 0.22, length: 0.5, tone: 'bg-accent-secondary' },
  { name: 'tool.crm', start: 0.72, length: 0.13, tone: 'bg-warning' },
  { name: 'guardrail', start: 0.84, length: 0.07, tone: 'bg-success' },
  { name: 'reply', start: 0.9, length: 0.1, tone: 'bg-accent-primary' },
];
const TRACE_MS = 1240;
const TICKS_PER_TRACE = SPANS.length + 1;

/** Ряды метрик: демонстрационные значения, идут по кругу. */
const SERIES = {
  quality: [95, 96, 96, 97, 95, 96, 97, 97, 96, 98, 97, 96, 97, 98, 97, 96],
  cost: [3.1, 2.9, 3.0, 2.8, 3.2, 3.0, 2.7, 2.9, 3.1, 2.8, 2.6, 2.9, 3.0, 2.8, 2.7, 2.9],
  latency: [1.3, 1.2, 1.4, 1.1, 1.2, 1.3, 1.0, 1.2, 1.1, 1.3, 1.2, 1.0, 1.1, 1.2, 1.3, 1.1],
} as const;
const WINDOW = 12;

const LOGS: readonly { level: 'INFO' | 'WARN'; message: string }[] = [
  { level: 'INFO', message: 'route intent=order_status → claude (412 ms)' },
  { level: 'INFO', message: 'tool crm.get_order #4821 → 200 (96 ms)' },
  { level: 'INFO', message: 'guardrail pii_mask: 2 fields masked' },
  { level: 'WARN', message: 'gpt latency 2.1 s → fallback qwen' },
  { level: 'INFO', message: 'reply sent channel=whatsapp lang=es' },
  { level: 'INFO', message: 'cache hit embeddings (8 ms)' },
  { level: 'INFO', message: 'route intent=billing → operator queue' },
  { level: 'WARN', message: 'telegram webhook rate limit 80%' },
];
const LOG_LINES = 4;
const LOG_H = 21;

const windowOf = (values: readonly number[], offset: number) =>
  Array.from({ length: WINDOW }, (_, index) => values[(offset + index) % values.length] ?? 0);

/** Страница оркестратора, «Архитектура»: консоль наблюдаемости — трассировка, метрики, живые логи. */
export function ObservabilityConsoleVisual() {
  const text = useContent('visuals', 'observabilityConsole');
  const format = useVisualFormat();
  const { animated, full, interactive } = useVisual();
  const tick = useVisualTicker(1400);
  const [hovered, setHovered] = useState<number | null>(null);
  const run = Math.floor((tick + TICKS_PER_TRACE - 1) / TICKS_PER_TRACE);
  const grown = (tick + TICKS_PER_TRACE - 1) % TICKS_PER_TRACE;

  const quality = windowOf(SERIES.quality, tick);
  const cost = windowOf(SERIES.cost, tick);
  const latency = windowOf(SERIES.latency, tick);
  const last = (values: readonly number[]) => values[values.length - 1] ?? 0;
  const metrics = [
    {
      label: text.metrics[0],
      value: format.percent(last(quality) / 100),
      values: quality,
      tone: 'success' as const,
      domain: [93, 99] as const,
    },
    {
      label: text.metrics[1],
      value: format.usd(last(cost) / 1000),
      values: cost,
      tone: 'primary' as const,
      domain: [2.4, 3.4] as const,
    },
    {
      label: text.metrics[2],
      value: format.seconds(last(latency)),
      values: latency,
      tone: 'secondary' as const,
      domain: [0.9, 1.5] as const,
    },
  ];
  // Всегда четыре строки: новая приходит снизу, верхняя уезжает
  const lines = Array.from({ length: LOG_LINES }, (_, index) => tick + index);

  return (
    <div className="absolute inset-0">
      {/* Трассировка */}
      <div
        className="absolute flex flex-col rounded-xl border border-border bg-bg-elevated/95"
        style={{ left: 12, top: 12, width: 380, height: 232 }}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Activity size={12} className="text-accent-secondary" />
          <span className="truncate text-[11px] font-semibold text-text-primary">{text.trace}</span>
          <span className="truncate font-mono text-[9.5px] text-text-muted">
            tr_{(8231 + run * 17).toString(16)}
          </span>
          <span className="ml-auto font-mono text-[10px] text-accent-secondary">
            {format.ms(TRACE_MS)}
          </span>
        </div>
        <div className="relative flex flex-1 flex-col justify-around px-3 py-1.5">
          {/* Сетка времени */}
          <div className="pointer-events-none absolute bottom-1.5 left-[84px] right-3 top-1.5 flex justify-between">
            {[0, 1, 2, 3, 4].map((line) => (
              <span key={line} className="w-px bg-border/60" />
            ))}
          </div>
          {SPANS.map((span, index) => {
            const visible = index < grown;
            return (
              <div
                key={span.name}
                className="relative flex items-center gap-2"
                onPointerEnter={interactive ? () => setHovered(index) : undefined}
                onPointerLeave={interactive ? () => setHovered(null) : undefined}
              >
                <span className="w-[64px] shrink-0 truncate font-mono text-[9.5px] text-text-secondary">
                  {span.name}
                </span>
                <span className="relative h-3.5 flex-1">
                  <motion.span
                    key={`${run}-${span.name}`}
                    className={cn(
                      'absolute inset-y-0 origin-left overflow-hidden rounded',
                      span.tone,
                      hovered === index ? 'opacity-100' : 'opacity-80',
                    )}
                    style={{ left: `${span.start * 100}%`, width: `${span.length * 100}%` }}
                    initial={animated ? { scaleX: 0 } : false}
                    animate={{ scaleX: visible ? 1 : 0 }}
                    transition={{ duration: animated ? DURATION.slow : 0, ease: EASE.outExpo }}
                  >
                    {span.name === 'llm' && full && grown === index + 1 ? (
                      <span className="absolute inset-y-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    ) : null}
                  </motion.span>
                  <AnimatePresence>
                    {hovered === index ? (
                      <motion.span
                        className="absolute -top-5 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-bg-base px-1.5 py-0.5 font-mono text-[9px] text-text-primary"
                        style={{ left: `${(span.start + span.length / 2) * 100}%` }}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: DURATION.fast }}
                      >
                        {span.name} · {format.ms(span.length * TRACE_MS)}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Метрики */}
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className="absolute flex flex-col justify-between rounded-xl border border-border bg-bg-elevated/95 px-3 py-2"
          style={{ left: 404, top: 12 + index * 81, width: 224, height: 70 }}
        >
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[10px] text-text-muted">{metric.label}</span>
            <RollingValue
              value={metric.value}
              className="font-display text-[15px] font-bold text-text-primary"
            />
          </span>
          <Sparkline
            values={metric.values}
            width={200}
            height={26}
            tone={metric.tone}
            tick={tick}
            domain={metric.domain}
          />
        </div>
      ))}

      {/* Живые логи */}
      <div
        className="absolute flex flex-col overflow-hidden rounded-xl border border-border bg-bg-base/95"
        style={{ left: 12, top: 256, width: 616, height: 132 }}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            {full ? (
              <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
            ) : null}
            <span className="relative h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="truncate text-[10.5px] font-semibold text-text-primary">
            {text.logs}
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden px-3">
          <AnimatePresence initial={false}>
            {lines.map((seq, index) => {
              const entry = LOGS[seq % LOGS.length] ?? LOGS[0];
              const newest = index === lines.length - 1;
              return (
                <motion.div
                  key={seq}
                  className={cn(
                    'absolute inset-x-1.5 flex items-center gap-2.5 rounded px-1.5 font-mono text-[10px]',
                    newest && 'bg-accent-primary/10',
                  )}
                  style={{ height: LOG_H, top: 6 }}
                  initial={animated ? { y: LOG_LINES * LOG_H, opacity: 0 } : false}
                  animate={{ y: index * LOG_H, opacity: 1 }}
                  exit={animated ? { y: -LOG_H, opacity: 0 } : { opacity: 0 }}
                  transition={{ duration: animated ? DURATION.base : 0, ease: EASE.outExpo }}
                >
                  <span className="shrink-0 text-text-muted">{format.clock(seq * 3)}</span>
                  <span
                    className={cn(
                      'w-9 shrink-0 font-semibold',
                      entry?.level === 'WARN' ? 'text-warning' : 'text-accent-secondary',
                    )}
                  >
                    {entry?.level}
                  </span>
                  <span className="truncate text-text-secondary">{entry?.message}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
