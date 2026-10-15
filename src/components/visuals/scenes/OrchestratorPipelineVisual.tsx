import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CreditCard,
  Database,
  FileText,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { ChannelMark } from '@/components/ui/ChannelMark';
import { useTranslation } from 'react-i18next';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { pick } from '../pick';
import { Packet } from '../parts/Packet';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 640×400: четыре стадии-колонки, рельс со стадиями сверху, полоса guardrails снизу. */
const COLUMN_W = 140;
const COLUMN_GAP = 16;
const COLUMN_TOP = 52;
const COLUMN_H = 232;
const RAIL_Y = 24;
const columnX = (index: number) => 16 + index * (COLUMN_W + COLUMN_GAP);
const columnCenter = (index: number) => columnX(index) + COLUMN_W / 2;
const railSegment = (from: number) =>
  `M ${columnCenter(from)} ${RAIL_Y} L ${columnCenter(from + 1)} ${RAIL_Y}`;

type Scenario = {
  channel: LucideIcon;
  channelName: string;
  /** Ветка маршрута: 0 — быстрая модель, 1 — умная, 2 — оператор. */
  branch: 0 | 1 | 2;
  latency: number;
  cost: number;
  system: { label: string; icon: LucideIcon };
};

const SCENARIOS: readonly [Scenario, ...Scenario[]] = [
  {
    channel: MessageCircle,
    channelName: 'WhatsApp',
    branch: 0,
    latency: 0.4,
    cost: 0.002,
    system: { label: 'CRM', icon: Database },
  },
  {
    channel: Send,
    channelName: 'Telegram',
    branch: 2,
    latency: 1.8,
    cost: 0.006,
    system: { label: 'Billing', icon: CreditCard },
  },
  {
    channel: Mail,
    channelName: 'Email',
    branch: 1,
    latency: 3.2,
    cost: 0.011,
    system: { label: 'Docs', icon: FileText },
  },
];

const CONFIDENCE = [0.94, 0.88, 0.91] as const;

/** Шаги: запрос → намерение → маршрут → guardrails → действие. */
const STEPS = [1000, 1000, 1100, 1000, 1800] as const;
const STEP = { request: 0, intent: 1, route: 2, guard: 3, action: 4 } as const;

/** Страница оркестратора, первый экран: конвейер решения — от запроса до действия в системе. */
export function OrchestratorPipelineVisual() {
  const text = useContent('visuals', 'orchestratorPipeline');
  const { i18n } = useTranslation();
  const format = useVisualFormat();
  const { animated } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.action });
  const index = cycle % SCENARIOS.length;
  const scenario = pick(SCENARIOS, index);
  const confidence = CONFIDENCE[index] ?? 0.9;
  const SystemIcon = scenario.system.icon;
  const spring = animated ? SPRING.soft : { duration: 0 };
  const fade = { duration: animated ? DURATION.base : 0, ease: EASE.outExpo };
  const lit = (stage: number) => step >= stage;

  return (
    <div className="absolute inset-0">
      <div className="absolute left-1/4 top-12 h-60 w-80 rounded-full bg-glow-indigo opacity-60 blur-3xl" />

      {/* Рельс стадий */}
      <svg viewBox="0 0 640 400" className="absolute inset-0 h-full w-full overflow-visible">
        <line
          x1={columnCenter(0)}
          x2={columnCenter(3)}
          y1={RAIL_Y}
          y2={RAIL_Y}
          stroke="rgb(var(--border))"
          strokeWidth={1.25}
        />
        <motion.line
          x1={columnCenter(0)}
          x2={columnCenter(3)}
          y1={RAIL_Y}
          y2={RAIL_Y}
          stroke="rgb(var(--accent-secondary))"
          strokeWidth={1.75}
          initial={false}
          animate={{ pathLength: Math.min(step, 3) / 3 }}
          transition={{ duration: animated ? DURATION.slow : 0, ease: EASE.outExpo }}
        />
        {[0, 1, 2, 3].map((stage) => (
          <line
            key={stage}
            x1={columnCenter(stage)}
            x2={columnCenter(stage)}
            y1={RAIL_Y}
            y2={COLUMN_TOP}
            stroke="rgb(var(--border))"
            strokeDasharray="2 3"
          />
        ))}
      </svg>
      {step >= STEP.intent && step <= STEP.guard ? (
        <Packet
          key={`rail-${cycle}-${step}`}
          d={railSegment(Math.min(step, 3) - 1)}
          duration={0.7}
        />
      ) : null}
      {[0, 1, 2, 3].map((stage) => {
        const active = stage === 3 ? lit(STEP.action) : lit(stage);
        return (
          <span
            key={stage}
            className={cn(
              'absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-[8.5px] font-semibold transition-all duration-500',
              active
                ? 'border-accent-secondary bg-accent-secondary text-bg-base shadow-[0_0_14px_rgb(var(--accent-secondary)/0.8)]'
                : 'border-border bg-bg-elevated text-text-muted',
            )}
            style={{ left: columnCenter(stage), top: RAIL_Y }}
          >
            {stage + 1}
          </span>
        );
      })}

      {/* Колонки стадий */}
      {text.stages.map((label, stage) => {
        const active = stage === 3 ? lit(STEP.action) : lit(stage);
        return (
          <div
            key={label}
            className={cn(
              'absolute flex flex-col rounded-xl border bg-bg-elevated/90 transition-[border-color,box-shadow] duration-500',
              active && (stage === 3 ? step === STEP.action : step === stage)
                ? 'border-accent-primary/70 shadow-[0_0_32px_-8px_rgb(var(--accent-primary)/0.75)]'
                : 'border-border',
            )}
            style={{ left: columnX(stage), top: COLUMN_TOP, width: COLUMN_W, height: COLUMN_H }}
          >
            <span className="truncate border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {label}
            </span>
            <div className="relative flex min-h-0 flex-1 flex-col gap-2 p-2.5">
              {stage === 0 ? (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={cycle}
                    className="flex flex-col gap-2"
                    initial={animated ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={animated ? { opacity: 0, y: -8 } : { opacity: 0 }}
                    transition={fade}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-secondary/15 text-accent-secondary">
                        <ChannelMark
                          name={scenario.channelName}
                          fallback={scenario.channel}
                          size={12}
                        />
                      </span>
                      <span className="font-mono text-[9px] text-text-muted">
                        {format.clock(cycle * 37)}
                      </span>
                    </span>
                    <p
                      lang={i18n.language}
                      className="line-clamp-5 rounded-xl rounded-tl-sm bg-accent-primary px-2.5 py-2 text-[11px] leading-snug text-white"
                    >
                      {text.requests[index]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              ) : null}

              {stage === 1 ? (
                <>
                  {text.intents.map((intent, intentIndex) => {
                    const chosen = intentIndex === index && lit(STEP.intent);
                    return (
                      <span
                        key={intent}
                        className={cn(
                          'truncate rounded-lg border px-2.5 py-1.5 text-[10.5px] transition-all duration-500',
                          chosen
                            ? 'border-accent-primary bg-accent-primary/20 text-text-primary'
                            : 'border-border text-text-muted',
                        )}
                      >
                        {intent}
                      </span>
                    );
                  })}
                  <div className="mt-auto">
                    <span className="flex items-center justify-between gap-2 text-[9.5px] text-text-muted">
                      <span className="truncate">{text.confidence}</span>
                      <span className="font-mono text-text-primary">
                        {lit(STEP.intent) ? format.decimal(confidence) : '—'}
                      </span>
                    </span>
                    <span className="mt-1 block h-1 overflow-hidden rounded-full bg-text-muted/20">
                      <motion.span
                        className="block h-full origin-left rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                        initial={false}
                        animate={{ scaleX: lit(STEP.intent) ? confidence : 0 }}
                        transition={{
                          duration: animated ? DURATION.reveal : 0,
                          ease: EASE.outExpo,
                        }}
                      />
                    </span>
                  </div>
                </>
              ) : null}

              {stage === 2 ? (
                <>
                  <svg
                    viewBox="0 0 20 120"
                    className="absolute left-2.5 top-2.5 h-[120px] w-5 overflow-visible"
                  >
                    {[0, 1, 2].map((branch) => (
                      <path
                        key={branch}
                        d={`M 4 60 C 12 60 8 ${branch * 42 + 16} 18 ${branch * 42 + 16}`}
                        fill="none"
                        stroke={
                          branch === scenario.branch && lit(STEP.route)
                            ? 'rgb(var(--accent-secondary))'
                            : 'rgb(var(--border))'
                        }
                        strokeWidth={1.5}
                      />
                    ))}
                    <circle cx={4} cy={60} r={3} fill="rgb(var(--accent-secondary))" />
                  </svg>
                  {text.branches.map((branch, branchIndex) => {
                    const chosen = branchIndex === scenario.branch && lit(STEP.route);
                    return (
                      <div
                        key={branch}
                        className={cn(
                          'ml-6 flex h-[34px] flex-col justify-center rounded-lg border px-2 transition-all duration-500',
                          chosen
                            ? 'border-accent-secondary bg-accent-secondary/15'
                            : 'border-border opacity-60',
                        )}
                      >
                        <span
                          className={cn(
                            'truncate text-[10px] font-medium',
                            chosen ? 'text-text-primary' : 'text-text-muted',
                          )}
                        >
                          {branch}
                        </span>
                        {chosen ? (
                          <motion.span
                            className="truncate font-mono text-[8.5px] text-accent-secondary"
                            initial={animated ? { opacity: 0 } : false}
                            animate={{ opacity: 1 }}
                            transition={fade}
                          >
                            {format.seconds(scenario.latency)} · {format.usd(scenario.cost)}
                          </motion.span>
                        ) : null}
                      </div>
                    );
                  })}
                </>
              ) : null}

              {stage === 3 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-center">
                  <motion.span
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors duration-500',
                      lit(STEP.action)
                        ? 'border-success/60 bg-success/15 text-success'
                        : 'border-border text-text-muted',
                    )}
                    initial={false}
                    animate={{ scale: step === STEP.action ? [1, 1.12, 1] : 1 }}
                    transition={{ duration: animated ? DURATION.slow : 0 }}
                  >
                    <SystemIcon size={20} />
                  </motion.span>
                  <span className="font-mono text-[10px] text-text-secondary">
                    {scenario.system.label}
                  </span>
                  <AnimatePresence>
                    {lit(STEP.action) ? (
                      <motion.span
                        key={`result-${cycle}`}
                        className="flex max-w-full items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[10px] font-medium text-success"
                        initial={animated ? { opacity: 0, y: 6, scale: 0.9 } : false}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={spring}
                      >
                        <Check size={11} strokeWidth={3} className="shrink-0" />
                        <span className="truncate">{text.results[index]}</span>
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* Guardrails */}
      <div
        className="absolute flex items-center gap-2 rounded-xl border border-border bg-bg-elevated/90 px-3"
        style={{ left: 16, top: 300, width: 608, height: 52 }}
      >
        <ShieldCheck
          size={18}
          className={cn(
            'shrink-0 transition-colors duration-500',
            lit(STEP.guard) ? 'text-success' : 'text-text-muted',
          )}
        />
        <span className="font-mono text-[10px] text-text-muted">guardrails</span>
        <div className="ml-2 flex min-w-0 flex-1 gap-2">
          {text.guardrails.map((label, guardIndex) => {
            const passed = lit(STEP.guard);
            return (
              <span
                key={label}
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] transition-colors duration-500',
                  passed
                    ? 'border-success/40 bg-success/10 text-text-primary'
                    : 'border-dashed border-border text-text-muted',
                )}
                style={{ transitionDelay: animated && passed ? `${guardIndex * 180}ms` : '0ms' }}
              >
                <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
                  <circle
                    cx={6}
                    cy={6}
                    r={5.25}
                    fill="none"
                    stroke={passed ? 'rgb(var(--success))' : 'rgb(var(--border))'}
                    strokeWidth={1.25}
                  />
                  <motion.path
                    d="M3.5 6.2 L5.3 8 L8.6 4.4"
                    fill="none"
                    stroke="rgb(var(--success))"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={false}
                    animate={{ pathLength: passed ? 1 : 0, opacity: passed ? 1 : 0 }}
                    transition={{
                      duration: animated ? DURATION.base : 0,
                      delay: animated && passed ? guardIndex * 0.18 : 0,
                    }}
                  />
                </svg>
                <span className="truncate">{label}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
