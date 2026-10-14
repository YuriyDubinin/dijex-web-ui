import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { revealItemVariants } from '@/components/motion/variants';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { RESULT_METRICS, RESULT_ROWS } from '@/content/home/results';
import { useContent } from '@/i18n/useContent';
import { DrawCheck } from '@/motion/DrawCheck';
import { useActiveInViewport } from '@/motion/hooks';
import { Odometer } from '@/motion/Odometer';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type MetricKey = (typeof RESULT_METRICS)[number]['key'];

/** Строка «Было → Стало»: старое перечёркивается, стрелка «выстреливает», новое въезжает со вспышкой. */
function ResultRow({
  label,
  before,
  after,
  beforeLabel,
  afterLabel,
  index,
}: {
  label: string;
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const animated = useMotionTier() !== 'off';
  const run = !animated || inView;
  const base = index * STAGGER.sections;

  return (
    <div
      ref={ref}
      className="group grid gap-3 border-b border-border/60 px-6 py-5 transition-colors last:border-b-0 hover:bg-bg-surface/60 sm:grid-cols-[1.2fr_1fr_auto_1fr] sm:items-center sm:gap-4"
    >
      <dt className="text-small font-semibold text-text-primary">{label}</dt>
      <dd className="flex items-center gap-2 text-small text-text-muted">
        <X size={16} aria-hidden className="shrink-0 text-danger/70" />
        <motion.span
          className="relative"
          initial={animated ? { opacity: 0 } : false}
          animate={run ? { opacity: [0, 1, 0.55] } : undefined}
          transition={{ duration: 1, delay: base, times: [0, 0.3, 1] }}
        >
          <span className="sr-only">{beforeLabel}: </span>
          {before}
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-px origin-left bg-danger/70"
            initial={animated ? { scaleX: 0 } : false}
            animate={run ? { scaleX: 1 } : undefined}
            transition={{ duration: DURATION.base, ease: EASE.outExpo, delay: base + 0.35 }}
          />
        </motion.span>
      </dd>
      <dd aria-hidden className="hidden text-accent-primary sm:block">
        <motion.span
          className="inline-flex transition-transform group-hover:translate-x-1"
          initial={animated ? { opacity: 0, x: -10 } : false}
          animate={run ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: DURATION.base, ease: EASE.outExpo, delay: base + 0.55 }}
        >
          <ArrowRight size={16} />
        </motion.span>
      </dd>
      <dd className="flex items-center gap-2 text-small font-semibold text-text-primary">
        <DrawCheck className="text-success" delay={base + 0.8} />
        <motion.span
          className="relative isolate rounded px-1"
          initial={animated ? { opacity: 0, x: 16 } : false}
          animate={run ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: DURATION.slow, ease: EASE.outExpo, delay: base + 0.65 }}
        >
          <span className="sr-only">{afterLabel}: </span>
          {after}
          {animated ? (
            <motion.span
              aria-hidden
              className="absolute inset-0 -z-10 rounded bg-success/25"
              initial={{ opacity: 0 }}
              animate={run ? { opacity: [0, 1, 0] } : undefined}
              transition={{ duration: 0.9, delay: base + 0.75 }}
            />
          ) : null}
        </motion.span>
      </dd>
    </div>
  );
}

/** Визуал метрики: кольцо прогресса, «часы» или шкала скорости. */
function MetricVisual({ kind, value }: { kind: MetricKey; value: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const spinning = useActiveInViewport(ref) && tier === 'full';
  const transition = { duration: DURATION.cinematic + 0.4, ease: EASE.outExpo };

  if (kind === 'reply') {
    // Шкала «скорости»: заливка останавливается в самом начале — ответ почти мгновенный
    return (
      <svg ref={ref} aria-hidden viewBox="0 0 120 24" className="h-6 w-full max-w-[9rem]">
        <rect x="0" y="9" width="120" height="6" rx="3" className="fill-border/60" />
        {[0, 24, 48, 72, 96, 120].map((x) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1="2"
            y2="6"
            className="stroke-text-muted/50"
            strokeWidth={1}
          />
        ))}
        <motion.rect
          x="0"
          y="9"
          width="14"
          height="6"
          rx="3"
          fill="url(#speed-gradient)"
          style={{ transformBox: 'fill-box', originX: 0 }}
          initial={animated ? { scaleX: 0 } : false}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE.outExpo, delay: 0.3 }}
        />
        <defs>
          <linearGradient id="speed-gradient" x1="0" x2="1">
            <stop offset="0%" stopColor="rgb(var(--accent-primary))" />
            <stop offset="100%" stopColor="rgb(var(--accent-secondary))" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  const fraction = kind === 'automated' ? value / 100 : 1;
  return (
    <svg ref={ref} aria-hidden viewBox="0 0 64 64" className="h-16 w-16 shrink-0 -rotate-90">
      <circle cx="32" cy="32" r="27" fill="none" strokeWidth="4" className="stroke-border/60" />
      <motion.circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        stroke={
          kind === 'automated' ? 'rgb(var(--accent-secondary))' : 'rgb(var(--accent-primary))'
        }
        initial={animated ? { pathLength: 0 } : false}
        whileInView={{ pathLength: fraction }}
        viewport={{ once: true }}
        transition={transition}
        style={{ filter: 'drop-shadow(0 0 4px rgb(var(--accent-secondary) / 0.6))' }}
      />
      {kind === 'always' ? (
        // «Секундная стрелка» — медленно обходит круг, пока блок на экране
        <g
          className={cn('origin-center', spinning && 'animate-spin [animation-duration:8s]')}
          style={{ transformBox: 'view-box' }}
        >
          <circle cx="59" cy="32" r="2.5" fill="rgb(var(--accent-secondary))" />
        </g>
      ) : null}
    </svg>
  );
}

export function Results() {
  const content = useContent('home', 'results');

  return (
    <Section id="results" labelledBy="results-title" divider tinted>
      <SectionHeader
        titleId="results-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <div className="mt-16 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface/60 backdrop-blur-sm">
          <div
            aria-hidden
            className="hidden grid-cols-[1.2fr_1fr_auto_1fr] items-center gap-4 border-b border-border px-6 py-4 sm:grid"
          >
            <span />
            <span className="caps-label text-text-muted">{content.before}</span>
            <span className="w-4" />
            <span className="caps-label text-accent-secondary">{content.after}</span>
          </div>
          <dl>
            {RESULT_ROWS.map((rowKey, index) => {
              const row = content.rows[rowKey];
              return (
                <ResultRow
                  key={rowKey}
                  index={index}
                  label={row.label}
                  before={row.before}
                  after={row.after}
                  beforeLabel={content.before}
                  afterLabel={content.after}
                />
              );
            })}
          </dl>
        </div>

        <SpotlightGroup>
          <ScrollReveal className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1" staggerChildren={0.1}>
            {RESULT_METRICS.map((metric) => {
              const text = content.metrics[metric.key];
              return (
                <motion.div
                  key={metric.key}
                  variants={revealItemVariants}
                  data-spotlight
                  className="spotlight flex h-full flex-col gap-4 rounded-2xl border border-border bg-bg-surface/60 p-6 backdrop-blur-sm lg:flex-row lg:items-center"
                >
                  <MetricVisual kind={metric.key} value={metric.value} />
                  <div className="min-w-0">
                    <p className="font-display text-h1 font-bold leading-none tabular-nums text-text-primary">
                      <Odometer value={metric.value} prefix={text.prefix} suffix={text.suffix} />
                    </p>
                    <p className="mt-2 text-small text-text-secondary">{text.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </ScrollReveal>
        </SpotlightGroup>
      </div>
    </Section>
  );
}
