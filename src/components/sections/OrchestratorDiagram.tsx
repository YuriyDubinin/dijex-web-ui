import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, useInView, useScroll, useSpring, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { FlowConnector } from './FlowConnector';
import { AGENT_SYSTEM_LINKS, DIAGRAM_COLUMNS } from '@/content/home/orchestrator';
import { useContent } from '@/i18n/useContent';
import { useActiveInViewport, useLoopDebug, useMediaQuery } from '@/motion/hooks';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, SPRING_VALUE, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type ColumnKey = (typeof DIAGRAM_COLUMNS)[number]['key'];

type PathDef = {
  id: string;
  d: string;
  group: 'in' | 'out' | 'sys';
};

/** Когда (секунды от появления) включается каждая часть схемы. */
const SCENE = {
  inputs: 0,
  inPaths: 0.35,
  core: 0.6,
  outPaths: 1.0,
  agents: 1.15,
  sysPaths: 1.45,
  systems: 1.6,
  packets: 2.3,
} as const;

const COLUMN_DELAY: Record<ColumnKey, number> = {
  inputs: SCENE.inputs,
  core: SCENE.core,
  agents: SCENE.agents,
  systems: SCENE.systems,
};
const PATH_DELAY: Record<PathDef['group'], number> = {
  in: SCENE.inPaths,
  out: SCENE.outPaths,
  sys: SCENE.sysPaths,
};

const PACKET_SEGMENT_MS = 650;
const PACKET_INTERVAL_MS = 900;

const nodeId = (column: ColumnKey, key: string) => `${column}:${key}`;

/** Кривая Безье с горизонтальными касательными — «провод» между узлами. */
function curve(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(24, (x2 - x1) * 0.5);
  return `M ${x1},${y1} C ${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

const pick = <T,>(items: readonly T[]): T | undefined =>
  items[Math.floor(Math.random() * items.length)];

const AGENT_KEYS = Object.keys(AGENT_SYSTEM_LINKS);
const INPUT_KEYS = DIAGRAM_COLUMNS[0].items.map((item) => item.key as string);

/** Пути, которые подсвечиваются для выбранного узла. */
function routeFor(node: string | null): Set<string> | null {
  if (!node) return null;
  const [column, key = ''] = node.split(':') as [ColumnKey, string?];
  const ids = new Set<string>();
  if (column === 'inputs') {
    ids.add(`in-${key}`);
  } else if (column === 'core') {
    INPUT_KEYS.forEach((input) => ids.add(`in-${input}`));
    AGENT_KEYS.forEach((agent) => ids.add(`out-${agent}`));
  } else if (column === 'agents') {
    ids.add(`out-${key}`);
    (AGENT_SYSTEM_LINKS[key] ?? []).forEach((system) => ids.add(`sys-${key}-${system}`));
  } else if (column === 'systems') {
    AGENT_KEYS.forEach((agent) => {
      if (AGENT_SYSTEM_LINKS[agent]?.includes(key)) {
        ids.add(`out-${agent}`);
        ids.add(`sys-${agent}-${key}`);
      }
    });
  }
  return ids;
}

/** Маршрут пакета (список id путей), проходящий через выбранный узел, если он задан. */
function packetRoute(through: string | null): string[] {
  const [column, key] = (through ?? '').split(':');
  let input = pick(INPUT_KEYS) ?? 'messengers';
  let agent = pick(AGENT_KEYS) ?? 'support';
  if (column === 'inputs' && key) input = key;
  if (column === 'agents' && key) agent = key;
  if (column === 'systems' && key) {
    agent = pick(AGENT_KEYS.filter((item) => AGENT_SYSTEM_LINKS[item]?.includes(key))) ?? agent;
  }
  const systems = AGENT_SYSTEM_LINKS[agent] ?? [];
  const system = column === 'systems' && key && systems.includes(key) ? key : pick(systems);
  return [`in-${input}`, `out-${agent}`, ...(system ? [`sys-${agent}-${system}`] : [])];
}

const columnVariants = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE.outExpo,
      delay,
      staggerChildren: STAGGER.items,
      delayChildren: delay + 0.1,
    },
  },
});
const pillVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATION.base, ease: EASE.outExpo } },
};

/** Схема оркестратора: на десктопе — интерактивная SVG-сцена, на мобильных — вертикальный поток. */
export function OrchestratorDiagram() {
  const desktop = useMediaQuery('(min-width: 1024px)');
  return desktop ? <DesktopDiagram /> : <MobileDiagram />;
}

function DesktopDiagram() {
  const { i18n } = useTranslation();
  const content = useContent('home', 'orchestrator');
  const tier = useMotionTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const pathRefs = useRef(new Map<string, SVGPathElement>());
  const packetLayerRef = useRef<SVGGElement>(null);
  const [paths, setPaths] = useState<PathDef[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [coreFlash, setCoreFlash] = useState(0);
  const inView = useInView(containerRef, { once: true, amount: 0.35 });
  const active = useActiveInViewport(containerRef);
  const animated = tier !== 'off';
  const shown = !animated || inView;
  const focusNode = pinned ?? hovered;
  const route = useMemo(() => routeFor(focusNode), [focusNode]);
  const forcedRoute = useRef<string | null>(null);
  forcedRoute.current = focusNode;

  const registerNode = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      if (node) nodeRefs.current.set(id, node);
      else nodeRefs.current.delete(id);
    },
    [],
  );

  // Геометрия «проводов»: пересчёт на resize и смене языка (длины подписей меняются)
  useLayoutEffect(() => {
    const container = containerRef.current;
    const core = coreRef.current;
    if (!container || !core) return undefined;

    const measure = () => {
      const box = container.getBoundingClientRect();
      const coreBox = core.getBoundingClientRect();
      const rel = (rect: DOMRect) => ({
        left: rect.left - box.left,
        right: rect.right - box.left,
        centerY: rect.top - box.top + rect.height / 2,
      });
      const coreRect = rel(coreBox);
      const next: PathDef[] = [];

      INPUT_KEYS.forEach((key, index) => {
        const element = nodeRefs.current.get(nodeId('inputs', key));
        if (!element) return;
        const from = rel(element.getBoundingClientRect());
        const y2 = coreRect.centerY + (index - (INPUT_KEYS.length - 1) / 2) * 14;
        next.push({
          id: `in-${key}`,
          group: 'in',
          d: curve(from.right, from.centerY, coreRect.left, y2),
        });
      });
      AGENT_KEYS.forEach((key, index) => {
        const element = nodeRefs.current.get(nodeId('agents', key));
        if (!element) return;
        const to = rel(element.getBoundingClientRect());
        const y1 = coreRect.centerY + (index - (AGENT_KEYS.length - 1) / 2) * 14;
        next.push({
          id: `out-${key}`,
          group: 'out',
          d: curve(coreRect.right, y1, to.left, to.centerY),
        });
        (AGENT_SYSTEM_LINKS[key] ?? []).forEach((system) => {
          const target = nodeRefs.current.get(nodeId('systems', system));
          if (!target) return;
          const end = rel(target.getBoundingClientRect());
          next.push({
            id: `sys-${key}-${system}`,
            group: 'sys',
            d: curve(to.right, to.centerY, end.left, end.centerY),
          });
        });
      });

      setPaths(next);
      setSize({ width: box.width, height: box.height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [i18n.language]);

  // Поток «пакетов» по проводам
  const packetsEnabled = animated && shown && active && paths.length > 0;
  useLoopDebug('orchestrator-packets', packetsEnabled);

  useEffect(() => {
    const layer = packetLayerRef.current;
    if (!layer || !packetsEnabled) return undefined;
    const maxPackets = tier === 'full' ? 4 : 1;
    const withTrail = tier === 'full';
    type Packet = { route: string[]; start: number; dots: SVGCircleElement[]; flashed: boolean };
    const packets: Packet[] = [];
    let frame = 0;
    let lastSpawn = 0;
    const startedAt = performance.now();

    const spawn = (now: number) => {
      const dots = (withTrail ? [3.2, 2.2, 1.4] : [3]).map((radius, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', String(radius));
        circle.setAttribute('fill', index === 0 ? 'rgb(165 243 252)' : 'rgb(6 182 212)');
        circle.setAttribute('opacity', String(1 - index * 0.3));
        if (index === 0) circle.setAttribute('filter', 'url(#packet-glow)');
        layer.appendChild(circle);
        return circle;
      });
      packets.push({ route: packetRoute(forcedRoute.current), start: now, dots, flashed: false });
    };

    const tick = (now: number) => {
      const sceneTime = now - startedAt;
      const delay =
        sceneTime < SCENE.packets * 1000 && animated ? SCENE.packets * 1000 - sceneTime : 0;
      if (delay <= 0 && now - lastSpawn > PACKET_INTERVAL_MS && packets.length < maxPackets) {
        lastSpawn = now;
        spawn(now);
      }
      for (let index = packets.length - 1; index >= 0; index -= 1) {
        const packet = packets[index];
        if (!packet) continue;
        const progress = (now - packet.start) / PACKET_SEGMENT_MS;
        if (progress >= packet.route.length) {
          packet.dots.forEach((dot) => dot.remove());
          packets.splice(index, 1);
          continue;
        }
        if (!packet.flashed && progress >= 1) {
          packet.flashed = true;
          setCoreFlash((value) => value + 1);
        }
        packet.dots.forEach((dot, dotIndex) => {
          const local = progress - dotIndex * 0.06;
          const segment = Math.max(0, Math.floor(local));
          const path = pathRefs.current.get(packet.route[segment] ?? '');
          if (!path || local < 0) {
            dot.setAttribute('opacity', '0');
            return;
          }
          const t = Math.min(1, local - segment);
          const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
          const point = path.getPointAtLength(path.getTotalLength() * eased);
          dot.setAttribute('cx', String(point.x));
          dot.setAttribute('cy', String(point.y));
          dot.setAttribute('opacity', String(1 - dotIndex * 0.3));
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      packets.forEach((packet) => packet.dots.forEach((dot) => dot.remove()));
    };
  }, [packetsEnabled, tier, animated]);

  const togglePin = (id: string) => setPinned((current) => (current === id ? null : id));

  const pillClass = (id: string, core = false) => {
    const lit = focusNode === id || (route !== null && focusNode?.startsWith('core') && core);
    return cn(
      'relative flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-small transition-[border-color,background-color,box-shadow,opacity] duration-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
      core
        ? 'border-accent-primary/25 bg-accent-primary/10 text-text-primary'
        : 'border-border/70 bg-bg-base/40 text-text-secondary hover:text-text-primary',
      lit && 'border-accent-secondary/70 text-text-primary shadow-glow-cyan',
      pinned === id && 'bg-accent-secondary/10',
    );
  };

  return (
    <figure aria-label={content.diagramLabel} className="relative">
      <div ref={containerRef} className="relative grid grid-cols-[1fr_1.15fr_1fr_1fr] gap-10">
        {/* Провода и пакеты */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={size.width}
          height={size.height}
        >
          <defs>
            <linearGradient id="wire-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(var(--accent-primary))" />
              <stop offset="100%" stopColor="rgb(var(--accent-secondary))" />
            </linearGradient>
            <filter id="packet-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {paths.map((path) => {
            const lit = route?.has(path.id) ?? false;
            return (
              <motion.path
                key={path.id}
                ref={(node) => {
                  if (node) pathRefs.current.set(path.id, node);
                  else pathRefs.current.delete(path.id);
                }}
                d={path.d}
                fill="none"
                stroke="url(#wire-gradient)"
                strokeLinecap="round"
                initial={animated ? { pathLength: 0 } : false}
                animate={{
                  pathLength: shown ? 1 : 0,
                  opacity: route ? (lit ? 1 : 0.08) : 0.3,
                  strokeWidth: lit ? 1.6 : 1,
                }}
                transition={{
                  pathLength: {
                    duration: DURATION.slow,
                    ease: EASE.outExpo,
                    delay: PATH_DELAY[path.group],
                  },
                  opacity: { duration: DURATION.base },
                  strokeWidth: { duration: DURATION.base },
                }}
              />
            );
          })}
          <g ref={packetLayerRef} />
        </svg>

        {DIAGRAM_COLUMNS.map((column) => {
          const columnContent = content.columns[column.key];
          const items = columnContent.items as Record<string, string>;
          const isCore = column.key === 'core';
          const describedBy = `orchestrator-route-${column.key}`;

          return (
            <motion.div
              key={column.key}
              ref={isCore ? coreRef : undefined}
              variants={animated ? columnVariants(COLUMN_DELAY[column.key]) : undefined}
              initial={animated ? 'hidden' : false}
              animate={shown ? 'visible' : 'hidden'}
              onPointerEnter={isCore ? () => setHovered('core') : undefined}
              onPointerLeave={() => setHovered(null)}
              className={cn(
                'relative flex flex-col rounded-2xl border p-4 backdrop-blur-sm',
                isCore
                  ? 'gradient-border border-transparent bg-bg-elevated/80 shadow-glow'
                  : 'border-border bg-bg-surface/60',
              )}
            >
              <span id={describedBy} className="sr-only">
                {content.routes[column.key]}
              </span>
              <div className="mb-3 flex items-center gap-2 px-1">
                {isCore ? (
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
                    {animated ? (
                      <span
                        aria-hidden
                        className="absolute -inset-1.5 animate-spin rounded-xl bg-[conic-gradient(from_0deg,transparent_0deg,rgb(var(--accent-secondary)/0.8)_60deg,transparent_120deg)] [animation-duration:4s]"
                      />
                    ) : null}
                    <span className="relative flex h-full w-full items-center justify-center rounded-lg bg-brand-gradient">
                      <Icon name="network" size={16} />
                    </span>
                  </span>
                ) : null}
                <h3
                  className={cn(
                    isCore
                      ? 'font-display text-lg font-semibold text-text-primary'
                      : 'caps-label text-text-muted',
                  )}
                >
                  {columnContent.title}
                </h3>
              </div>
              <ul className="flex flex-col gap-1.5">
                {column.items.map((item, itemIndex) => {
                  const id = nodeId(column.key, item.key);
                  return (
                    <motion.li key={item.key} variants={animated ? pillVariants : undefined}>
                      <button
                        type="button"
                        ref={registerNode(id)}
                        aria-pressed={pinned === id}
                        aria-describedby={describedBy}
                        onPointerEnter={() => setHovered(isCore ? 'core' : id)}
                        onFocus={() => setHovered(isCore ? 'core' : id)}
                        onBlur={() => setHovered(null)}
                        onClick={() => togglePin(isCore ? 'core' : id)}
                        className={pillClass(id, isCore)}
                      >
                        {isCore && animated ? (
                          <motion.span
                            key={coreFlash}
                            aria-hidden
                            className="absolute inset-0 rounded-xl bg-accent-secondary/25"
                            initial={{ opacity: 0 }}
                            animate={coreFlash > 0 ? { opacity: [0, 1, 0] } : undefined}
                            transition={{ duration: 0.45, delay: itemIndex * 0.08 }}
                          />
                        ) : null}
                        <Icon
                          name={item.icon}
                          size={14}
                          className={cn(
                            'relative shrink-0',
                            isCore ? 'text-accent-primary' : 'text-accent-secondary',
                          )}
                        />
                        <span className="relative min-w-0">{items[item.key]}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          );
        })}
      </div>
      <figcaption className="mt-5 text-center text-xs text-text-muted">
        {content.routes.hint}
      </figcaption>
    </figure>
  );
}

/** Мобильная версия: вертикальный поток колонок, активная колонка подсвечивается при прокрутке. */
function MobileDiagram() {
  const content = useContent('home', 'orchestrator');
  const tier = useMotionTier();
  const ref = useRef<HTMLDivElement>(null);
  const animated = tier !== 'off';
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 40%'] });
  const progress = useSpring(scrollYProgress, SPRING_VALUE.soft);

  return (
    <figure aria-label={content.diagramLabel} className="relative">
      <div ref={ref} className="relative pl-5">
        <div aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-border/60">
          {animated ? (
            <motion.div
              className="h-full w-full origin-top bg-gradient-to-b from-accent-primary to-accent-secondary"
              style={{ scaleY: progress }}
            />
          ) : null}
        </div>
        {DIAGRAM_COLUMNS.map((column, index) => {
          const columnContent = content.columns[column.key];
          const items = columnContent.items as Record<string, string>;
          const isCore = column.key === 'core';
          return (
            <Fragment key={column.key}>
              {index > 0 ? (
                <div className="flex h-10 justify-center">
                  <FlowConnector direction="vertical" />
                </div>
              ) : null}
              <motion.div
                initial={animated ? { opacity: 0.45, scale: 0.98 } : false}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.6 }}
                transition={{ duration: DURATION.base }}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-4 backdrop-blur-sm',
                  isCore
                    ? 'gradient-border border-transparent bg-bg-elevated/80 shadow-glow'
                    : 'border-border bg-bg-surface/60',
                )}
              >
                <h3
                  className={cn(
                    'mb-3 px-1',
                    isCore
                      ? 'font-display text-lg font-semibold text-text-primary'
                      : 'caps-label text-text-muted',
                  )}
                >
                  {columnContent.title}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {column.items.map((item) => (
                    <li
                      key={item.key}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-small',
                        isCore
                          ? 'border-accent-primary/25 bg-accent-primary/10 text-text-primary'
                          : 'border-border/70 bg-bg-base/40 text-text-secondary',
                      )}
                    >
                      <Icon
                        name={item.icon}
                        size={14}
                        className={cn(
                          'shrink-0',
                          isCore ? 'text-accent-primary' : 'text-accent-secondary',
                        )}
                      />
                      <span className="min-w-0">{items[item.key]}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Fragment>
          );
        })}
      </div>
    </figure>
  );
}
