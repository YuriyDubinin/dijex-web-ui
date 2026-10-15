import { AnimatePresence, motion, useTransform } from 'framer-motion';
import {
  Check,
  FileBarChart,
  Languages,
  Mail,
  MessageCircle,
  Network,
  type LucideIcon,
} from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { Packet } from '../parts/Packet';
import { Panel } from '../parts/Panel';
import { Wire } from '../parts/Wire';
import { pick } from '../pick';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 480×360: ядро в центре, спутники-модели и системы на эллипсе вокруг. */
const CX = 262;
const CY = 184;
const RX = 150;
const RY = 118;

type SatelliteId = 'gpt' | 'claude' | 'qwen' | 'llama' | 'crm' | 'erp';

const SATELLITES: readonly {
  id: SatelliteId;
  label: string;
  kind: 'model' | 'system';
  angle: number;
}[] = [
  { id: 'gpt', label: 'GPT', kind: 'model', angle: -90 },
  { id: 'claude', label: 'Claude', kind: 'model', angle: -32 },
  { id: 'qwen', label: 'Qwen', kind: 'model', angle: 22 },
  { id: 'llama', label: 'Llama', kind: 'model', angle: 78 },
  { id: 'crm', label: 'CRM', kind: 'system', angle: 132 },
  { id: 'erp', label: 'ERP', kind: 'system', angle: -142 },
];

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const position = (angle: number) => ({
  x: CX + RX * Math.cos(rad(angle)),
  y: CY + RY * Math.sin(rad(angle)),
});
const angleOf = (id: SatelliteId) => SATELLITES.find((item) => item.id === id)?.angle ?? 0;

/** Луч от ядра к спутнику. */
const spokePath = (angle: number) => {
  const { x, y } = position(angle);
  return `M ${CX} ${CY} L ${x.toFixed(1)} ${y.toFixed(1)}`;
};

/** Дуга по эллипсу от модели к системе — короткой стороной. */
const arcPath = (from: SatelliteId, to: SatelliteId) => {
  const a = angleOf(from);
  const b = angleOf(to);
  const start = position(a);
  const end = position(b);
  const delta = ((b - a + 540) % 360) - 180;
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${RX} ${RY} 0 0 ${delta > 0 ? 1 : 0} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
};

const REQUEST_PATH = `M 158 ${CY} L ${CX - 46} ${CY}`;

/** Маршрут под каждый запрос: модель → система, задержка и цена решения. */
type Route = {
  model: SatelliteId;
  system: SatelliteId;
  latency: number;
  cost: number;
  icon: LucideIcon;
};

const ROUTES: readonly [Route, ...Route[]] = [
  { model: 'claude', system: 'crm', latency: 0.4, cost: 0.002, icon: MessageCircle },
  { model: 'gpt', system: 'erp', latency: 0.7, cost: 0.004, icon: Mail },
  { model: 'qwen', system: 'erp', latency: 1.1, cost: 0.001, icon: FileBarChart },
  { model: 'llama', system: 'crm', latency: 0.9, cost: 0.0008, icon: Languages },
];

/** Шаги: запрос прилетает → ядро думает → луч к модели → действие в системе → готово. */
const STEPS = [700, 800, 700, 900, 900] as const;
const STEP = { arrive: 0, think: 1, route: 2, act: 3, done: 4 } as const;

function Satellite({
  label,
  kind,
  angle,
  active,
  depth,
}: {
  label: string;
  kind: 'model' | 'system';
  angle: number;
  active: boolean;
  depth: number;
}) {
  const { pointerX, pointerY, interactive } = useVisual();
  const x = useTransform(pointerX, (value) => value * depth);
  const y = useTransform(pointerY, (value) => value * depth);
  const { x: left, y: top } = position(angle);

  return (
    <motion.div className="absolute" style={{ left, top, ...(interactive ? { x, y } : {}) }}>
      <span
        className={cn(
          'flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border bg-bg-elevated/95 px-2.5 py-1 font-mono text-[11px] transition-all duration-500',
          active
            ? kind === 'model'
              ? 'scale-110 border-accent-primary text-text-primary shadow-[0_0_24px_-4px_rgb(var(--accent-primary)/0.9)]'
              : 'scale-110 border-accent-secondary text-text-primary shadow-[0_0_24px_-4px_rgb(var(--accent-secondary)/0.9)]'
            : 'border-border text-text-secondary',
        )}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            kind === 'model' ? 'bg-accent-primary' : 'bg-accent-secondary',
          )}
        />
        {label}
      </span>
    </motion.div>
  );
}

/** «AI-оркестратор» в карточке направления: каждый запрос получает свою модель и своё действие в системе. */
export function OrchestratorHubVisual() {
  const text = useContent('visuals', 'orchestratorHub');
  const format = useVisualFormat();
  const { animated, interactive, pointerX, pointerY, full } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.act });
  const routeIndex = cycle % ROUTES.length;
  const route = pick(ROUTES, routeIndex);
  const request = text.requests[routeIndex] ?? '';
  const RequestIcon = route.icon;
  const coreRotateX = useTransform(pointerY, (value) => value * -18);
  const coreRotateY = useTransform(pointerX, (value) => value * 18);
  const routing = step >= STEP.route && step < STEP.done;
  const acting = step >= STEP.act && step < STEP.done;
  const modelLabel = SATELLITES.find((item) => item.id === route.model)?.label ?? '';
  const fade = { duration: animated ? DURATION.base : 0, ease: EASE.outExpo };

  return (
    <div className="absolute inset-0">
      <div
        className="absolute rounded-full bg-glow-indigo opacity-70 blur-2xl"
        style={{ left: CX - 120, top: CY - 100, width: 240, height: 200 }}
      />

      <svg viewBox="0 0 480 360" className="absolute inset-0 h-full w-full overflow-visible">
        <ellipse
          cx={CX}
          cy={CY}
          rx={RX}
          ry={RY}
          fill="none"
          stroke="rgb(var(--border))"
          strokeDasharray="2 6"
        />
        {SATELLITES.map((satellite) => (
          <Wire
            key={satellite.id}
            d={spokePath(satellite.angle)}
            active={routing && satellite.id === route.model}
            tone="primary"
            baseOpacity={0.6}
          />
        ))}
        <Wire d={REQUEST_PATH} active={step < STEP.done} tone="secondary" />
        <Wire
          d={arcPath(route.model, route.system)}
          active={acting}
          tone="secondary"
          baseOpacity={0}
        />
      </svg>

      {/* Пакеты: запрос → ядро, ядро → модель, модель → система */}
      {step === STEP.arrive ? <Packet key={`in-${cycle}`} d={REQUEST_PATH} duration={0.6} /> : null}
      {step === STEP.route ? (
        <Packet
          key={`route-${cycle}`}
          d={spokePath(angleOf(route.model))}
          duration={0.6}
          tone="primary"
        />
      ) : null}
      {step === STEP.act ? (
        <Packet key={`act-${cycle}`} d={arcPath(route.model, route.system)} duration={0.8} />
      ) : null}

      {SATELLITES.map((satellite, index) => (
        <Satellite
          key={satellite.id}
          label={satellite.label}
          kind={satellite.kind}
          angle={satellite.angle}
          depth={6 + (index % 3) * 3}
          active={
            (routing && satellite.id === route.model) || (acting && satellite.id === route.system)
          }
        />
      ))}

      {/* Запрос */}
      <AnimatePresence initial={false}>
        <motion.div
          key={cycle}
          className="absolute"
          style={{ left: 8, top: CY - 28, width: 150 }}
          initial={animated ? { x: -24, opacity: 0, filter: 'blur(4px)' } : false}
          animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={animated ? { x: 16, opacity: 0, scale: 0.92 } : { opacity: 0 }}
          transition={animated ? SPRING.soft : { duration: 0 }}
        >
          <Panel
            active={step === STEP.done}
            tone="success"
            className="flex min-h-14 items-center gap-2 px-2.5 py-2"
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-500',
                step === STEP.done
                  ? 'bg-success/15 text-success'
                  : 'bg-accent-secondary/15 text-accent-secondary',
              )}
            >
              {step === STEP.done ? (
                <Check size={14} strokeWidth={2.5} />
              ) : (
                <RequestIcon size={14} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-[10.5px] font-medium leading-tight text-text-primary">
                {request}
              </span>
              <span className="block truncate font-mono text-[9px] text-text-muted">
                {step === STEP.done ? text.done : `#${4821 + routeIndex * 7}`}
              </span>
            </span>
          </Panel>
        </motion.div>
      </AnimatePresence>

      {/* Решение оркестратора */}
      <AnimatePresence>
        {step >= STEP.think && step < STEP.done ? (
          <motion.div
            key={`decision-${cycle}`}
            className="absolute -translate-x-1/2"
            style={{ left: CX, top: CY - 74 }}
            initial={animated ? { y: 6, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <span className="whitespace-nowrap rounded-md border border-accent-secondary/40 bg-bg-base/90 px-2 py-1 font-mono text-[10px] text-accent-secondary">
              → {modelLabel} · {format.seconds(route.latency)} · {format.usd(route.cost)}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Ядро */}
      <div
        className="absolute [perspective:600px]"
        style={{ left: CX - 46, top: CY - 46, width: 92, height: 92 }}
      >
        <motion.div
          className="relative h-full w-full"
          style={interactive ? { rotateX: coreRotateX, rotateY: coreRotateY } : undefined}
        >
          <AnimatePresence>
            {step === STEP.think && animated ? (
              <motion.svg
                key={`think-${cycle}`}
                viewBox="0 0 120 120"
                className="absolute -inset-[14px] h-[120px] w-[120px] animate-spin [animation-duration:1.2s]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={fade}
              >
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke="rgb(var(--accent-secondary))"
                  strokeWidth="1.5"
                  strokeDasharray="60 292"
                  strokeLinecap="round"
                />
              </motion.svg>
            ) : null}
          </AnimatePresence>
          <div className="hex absolute inset-0 bg-brand-gradient shadow-glow" />
          <div className="hex absolute inset-[2px] overflow-hidden bg-bg-elevated">
            <div
              className={cn(
                'absolute -inset-6 bg-[conic-gradient(from_0deg,transparent,rgb(var(--accent-primary)/0.55),transparent_45%,rgb(var(--accent-secondary)/0.45),transparent_80%)]',
                full && 'animate-spin-slow',
              )}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgb(255_255_255/0.12),transparent_65%)]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <Network size={28} strokeWidth={1.6} />
          </div>
        </motion.div>
      </div>
      <span
        className="absolute max-w-[150px] -translate-x-1/2 truncate text-center text-[11px] font-semibold tracking-wide text-text-primary"
        style={{ left: CX, top: CY + 54 }}
      >
        {text.core}
      </span>
    </div>
  );
}
