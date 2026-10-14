import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { FadeIn } from '@/components/motion/FadeIn';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { waveItemVariants } from '@/components/motion/variants';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DEPLOYMENT_OPTIONS, SECURITY_ITEMS } from '@/content/home/security';
import { useContent } from '@/i18n/useContent';
import { useMotionTier } from '@/motion/tier';
import { DataLocationDiagram } from './DataLocationDiagram';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useActiveInViewport } from '@/motion/hooks';
import { EASE, SPRING, gridWaveDelay } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type DeploymentKey = (typeof DEPLOYMENT_OPTIONS)[number]['key'];

/** Карточка вариантов развёртывания с переключателем. Используется и на странице оркестратора. */
export function DeploymentOptions({ className }: { className?: string }) {
  const content = useContent('home', 'security').deployment;
  const prefersReducedMotion = useMotionTier() === 'off';
  const [active, setActive] = useState<DeploymentKey>('cloud');
  const option = content.options[active];
  const activeIcon = DEPLOYMENT_OPTIONS.find((item) => item.key === active)?.icon ?? 'cloud';
  const buttonRefs = useRef(new Map<DeploymentKey, HTMLButtonElement>());

  // radiogroup: стрелки перемещают выбор и фокус по кругу
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = DEPLOYMENT_OPTIONS.findIndex((item) => item.key === active);
    const next =
      DEPLOYMENT_OPTIONS[(index + step + DEPLOYMENT_OPTIONS.length) % DEPLOYMENT_OPTIONS.length];
    if (!next) return;
    setActive(next.key);
    buttonRefs.current.get(next.key)?.focus();
  };

  return (
    <div
      className={cn(
        'gradient-border rounded-2xl bg-bg-elevated/70 p-6 shadow-glow backdrop-blur-sm',
        className,
      )}
    >
      <h3 className="font-display text-h3 font-semibold text-text-primary">{content.title}</h3>
      <div
        role="radiogroup"
        aria-label={content.label}
        onKeyDown={onKeyDown}
        className="mt-5 grid grid-cols-3 gap-1 rounded-xl border border-border bg-bg-base/60 p-1"
      >
        {DEPLOYMENT_OPTIONS.map((item) => {
          const selected = item.key === active;
          return (
            <button
              key={item.key}
              ref={(node) => {
                if (node) buttonRefs.current.set(item.key, node);
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.key)}
              className={cn(
                'relative flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:flex-row sm:gap-2 sm:text-small',
                selected ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {selected ? (
                <motion.span
                  layoutId="deployment-active"
                  aria-hidden
                  className="absolute inset-0 rounded-lg bg-accent-primary/15 ring-1 ring-inset ring-accent-primary/40"
                  transition={prefersReducedMotion ? { duration: 0 } : SPRING.snappy}
                />
              ) : null}
              <Icon
                name={item.icon}
                size={16}
                className={cn('relative', selected && 'text-accent-primary')}
              />
              <span className="relative text-center">{content.options[item.key].title}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 min-h-[6.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="flex gap-4"
          >
            <motion.span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white"
              initial={prefersReducedMotion ? false : { scale: 0.6, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={SPRING.snappy}
            >
              <Icon name={activeIcon} size={22} />
            </motion.span>
            <div>
              <p className="text-body font-semibold text-text-primary">{option.title}</p>
              <p className="mt-1 text-small leading-relaxed text-text-secondary">{option.text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-2 rounded-xl border border-border/60 bg-bg-base/40 px-2">
        <DataLocationDiagram kind={active} />
      </div>
    </div>
  );
}

/** Однократная «активация» иконки при появлении — у каждой своя. */
const ACTIVATION: Record<string, Record<string, number[]>> = {
  lock: { y: [-3, 1, 0] },
  eye: { x: [0, -2.5, 2.5, 0] },
  server: { opacity: [1, 0.3, 1, 0.5, 1] },
  fileCheck: { scale: [0.7, 1.15, 1] },
  keyRound: { rotate: [0, -35, 0] },
  shieldCheck: { scale: [0.8, 1.12, 1] },
};

export function Security() {
  const content = useContent('home', 'security');
  const tier = useMotionTier();
  const gridRef = useRef<HTMLDivElement>(null);
  const scanning = useActiveInViewport(gridRef) && tier === 'full';

  return (
    <Section id="security" labelledBy="security-title" divider>
      <SectionHeader
        titleId="security-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <div className="mt-16 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div ref={gridRef} className="relative">
          <SpotlightGroup>
            <ScrollReveal className="grid gap-4 sm:grid-cols-2">
              {SECURITY_ITEMS.map((item, index) => (
                <motion.div
                  key={item.key}
                  variants={waveItemVariants}
                  custom={gridWaveDelay(index, 2)}
                  data-spotlight
                  className="spotlight flex gap-3 rounded-2xl border border-border bg-bg-surface/60 p-4 backdrop-blur-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
                    <motion.span
                      className="inline-flex"
                      initial={false}
                      whileInView={tier === 'off' ? undefined : ACTIVATION[item.icon]}
                      viewport={{ once: true, amount: 1 }}
                      transition={{ duration: 0.7, ease: EASE.outExpo, delay: 0.3 + index * 0.08 }}
                    >
                      <Icon name={item.icon} size={16} />
                    </motion.span>
                  </span>
                  <div>
                    <h3 className="text-small font-semibold text-text-primary">
                      {content.items[item.key].title}
                    </h3>
                    <p className="mt-1 text-small text-text-secondary">
                      {content.items[item.key].text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </ScrollReveal>
          </SpotlightGroup>
          {/* Сканирующая линия проходит по карточкам раз в несколько секунд */}
          {scanning ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-x-0 h-16 animate-scan-y bg-gradient-to-b from-transparent via-accent-secondary/10 to-transparent">
                <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent-secondary/70 to-transparent" />
              </div>
            </div>
          ) : null}
        </div>

        <FadeIn delay={0.15}>
          <DeploymentOptions />
        </FadeIn>
      </div>
    </Section>
  );
}
