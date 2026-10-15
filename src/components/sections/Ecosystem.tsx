import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionDivider } from '@/components/layout/SectionDivider';
import { FadeIn } from '@/components/motion/FadeIn';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProgressConnector, StepTimeline } from './StepTimeline';
import { ECOSYSTEM_STEPS } from '@/content/home/ecosystem';
import type { SolutionKey } from '@/content/solutions';
import { useContent } from '@/i18n/useContent';
import { STICKY_SCENE_QUERY, useMediaQuery } from '@/motion/hooks';
import { Odometer } from '@/motion/Odometer';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, SPRING_VALUE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

/** Короткие названия решений для бейджей — из home.hero.pillars. */
const SHORT_LABEL: Record<SolutionKey, 'orchestrator' | 'support' | 'processes'> = {
  aiOrchestrator: 'orchestrator',
  supportAgent: 'support',
  digitalProcesses: 'processes',
};

const SOLUTION_BADGE: Record<SolutionKey, string> = {
  aiOrchestrator: 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary',
  supportAgent: 'border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary',
  digitalProcesses: 'border-accent-glow/30 bg-accent-glow/10 text-accent-glow',
};

const SOLUTION_GLOW: Record<SolutionKey, string> = {
  aiOrchestrator: 'border-accent-primary/50 shadow-[0_0_50px_-18px_rgb(var(--accent-primary)/0.9)]',
  supportAgent:
    'border-accent-secondary/50 shadow-[0_0_50px_-18px_rgb(var(--accent-secondary)/0.9)]',
  digitalProcesses: 'border-accent-glow/50 shadow-[0_0_50px_-18px_rgb(var(--accent-glow)/0.9)]',
};

/** Часы сценария: цифры прокручиваются одометром от шага к шагу. */
function ScenarioClock({ time }: { time: readonly [number, number] }) {
  return (
    <span className="inline-flex items-baseline font-mono font-semibold tabular-nums text-text-primary">
      <Odometer value={time[0]} minDigits={2} format={false} immediate duration={DURATION.slow} />
      <span className="mx-0.5 animate-pulse text-accent-secondary">:</span>
      <Odometer value={time[1]} minDigits={2} format={false} immediate duration={DURATION.slow} />
    </span>
  );
}

function StepContent({
  step,
  active,
}: {
  step: (typeof ECOSYSTEM_STEPS)[number];
  active: boolean;
}) {
  const content = useContent('home', 'ecosystem');
  const pillars = useContent('home', 'hero').pillars;
  const [hours, minutes] = step.time;

  return (
    <div className="group flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl border bg-bg-elevated transition-colors duration-500',
            active
              ? 'border-accent-secondary/50 text-accent-secondary'
              : 'border-accent-primary/20 text-accent-primary',
          )}
        >
          <Icon name={step.icon} size={20} className={iconMotionClass(step.icon)} />
        </span>
        <time className="font-mono text-small font-semibold text-accent-secondary">
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
        </time>
      </div>
      <h3 className="font-display text-lg font-semibold leading-snug text-text-primary">
        {content.steps[step.key].title}
      </h3>
      <p className="text-small leading-relaxed text-text-secondary">
        {content.steps[step.key].text}
      </p>
      <span
        className={cn(
          'mt-auto inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium transition-transform duration-500',
          SOLUTION_BADGE[step.solution],
          active && 'scale-105',
        )}
      >
        {pillars[SHORT_LABEL[step.solution]]}
      </span>
    </div>
  );
}

/**
 * Desktop + full: sticky-сцена. Скролл ведёт «пакет» по линии, шаги активируются по очереди,
 * большие часы прокручиваются от 02:14 к 09:00, фон «светлеет» от ночи к утру.
 */
function EcosystemSticky() {
  const content = useContent('home', 'ecosystem');
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const track = useSpring(useTransform(scrollYProgress, [0.08, 0.85], [0, 1]), SPRING_VALUE.soft);
  const morning = useTransform(scrollYProgress, [0.55, 0.95], [0, 1]);
  const night = useTransform(morning, (value) => 1 - value * 0.7);
  const [activeCount, setActiveCount] = useState(0);
  const count = ECOSYSTEM_STEPS.length;

  useMotionValueEvent(track, 'change', (value) => {
    const next = Math.max(0, Math.min(count, Math.floor(value * count + 0.5)));
    setActiveCount((current) => (current === next ? current : next));
  });

  const currentStep = ECOSYSTEM_STEPS[Math.max(0, activeCount - 1)] ?? ECOSYSTEM_STEPS[0];

  return (
    <section
      ref={ref}
      id="ecosystem"
      aria-labelledby="ecosystem-title"
      className="relative scroll-mt-20"
      style={{ height: '260vh' }}
    >
      <SectionDivider />
      <div className="sticky top-0 flex h-screen min-h-[640px] flex-col justify-center overflow-hidden">
        {/* Ночь → утро */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_10%,rgb(var(--accent-primary)/0.14),transparent_70%)]"
          style={{ opacity: night }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgb(var(--accent-secondary)/0.16),transparent_70%)]"
          style={{ opacity: morning }}
        />

        <Container className="relative">
          <SectionHeader
            titleId="ecosystem-title"
            eyebrow={content.eyebrow}
            title={content.title}
            lead={content.lead}
          />

          {currentStep ? (
            <div className="mt-8 flex justify-center text-h1">
              <ScenarioClock time={currentStep.time} />
            </div>
          ) : null}

          <div className="relative mt-8">
            <div className="absolute left-0 right-0 top-12 h-px">
              <ProgressConnector direction="horizontal" progress={track} />
            </div>
            <ol className="relative grid grid-cols-5 gap-4">
              {ECOSYSTEM_STEPS.map((step, index) => {
                const active = index < activeCount;
                return (
                  <motion.li
                    key={step.key}
                    animate={{ y: active ? -8 : 0, opacity: active ? 1 : 0.55 }}
                    transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
                    className={cn(
                      'relative flex h-full flex-col rounded-2xl border bg-bg-surface/85 p-5 backdrop-blur-sm transition-[border-color,box-shadow] duration-500',
                      active ? SOLUTION_GLOW[step.solution] : 'border-border',
                    )}
                  >
                    <StepContent step={step} active={active} />
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <motion.p
            className="mt-8 text-center text-small text-text-muted"
            style={{ opacity: morning }}
          >
            {content.note}
          </motion.p>
        </Container>
      </div>
    </section>
  );
}

/** Мобильные, lite и off: обычный таймлайн с линией, заполняемой по прокрутке. */
function EcosystemFlow() {
  const content = useContent('home', 'ecosystem');

  return (
    <Section id="ecosystem" labelledBy="ecosystem-title" divider tinted>
      <SectionHeader
        titleId="ecosystem-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />
      <StepTimeline
        className="mt-16"
        steps={ECOSYSTEM_STEPS.map((step) => ({
          id: step.key,
          content: <StepContent step={step} active={false} />,
        }))}
      />
      <FadeIn>
        <p className="mt-8 text-center text-small text-text-muted">{content.note}</p>
      </FadeIn>
    </Section>
  );
}

export function Ecosystem() {
  const tier = useMotionTier();
  const desktop = useMediaQuery(STICKY_SCENE_QUERY);
  return tier === 'full' && desktop ? <EcosystemSticky /> : <EcosystemFlow />;
}
