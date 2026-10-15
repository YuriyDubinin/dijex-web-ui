import { motion, type Variants } from 'framer-motion';
import { Plug } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { SectionDivider } from '@/components/layout/SectionDivider';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { waveItemVariants } from '@/components/motion/variants';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { KineticMarquee } from './KineticMarquee';
import {
  INTEGRATION_GROUPS,
  MARQUEE_ITEMS,
  MARQUEE_ITEMS_ALT,
  type IntegrationItem,
} from '@/content/home/integrations';
import { useContent } from '@/i18n/useContent';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useMotionTier } from '@/motion/tier';
import { DURATION, SPRING, STAGGER, gridWaveDelay } from '@/motion/tokens';

function StaticTechList({ label, hidden }: { label?: string; hidden?: boolean }) {
  return (
    <ul aria-label={label} aria-hidden={hidden || undefined} className="flex shrink-0 gap-3 pr-3">
      {MARQUEE_ITEMS.map((name) => (
        <li
          key={name}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-bg-surface/60 px-5 py-2.5 text-body font-medium text-text-secondary backdrop-blur-sm"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
          {name}
        </li>
      ))}
    </ul>
  );
}

/** full — две «кинетические» строки навстречу; lite — одна CSS-строка; off — статичная сетка. */
function TechMarquee({ label }: { label: string }) {
  const tier = useMotionTier();

  if (tier === 'off') {
    return (
      <Container>
        <div className="flex justify-center [&>ul]:shrink [&>ul]:flex-wrap [&>ul]:justify-center [&>ul]:pr-0">
          <StaticTechList label={label} />
        </div>
      </Container>
    );
  }

  // Бегущая строка уходит за края намеренно — аудит вёрстки её пропускает
  return (
    <div className="relative" data-allow-overflow>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg-base to-transparent md:w-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg-base to-transparent md:w-40"
      />
      {tier === 'full' ? (
        <div className="flex flex-col gap-3">
          <KineticMarquee items={MARQUEE_ITEMS} label={label} />
          <KineticMarquee items={MARQUEE_ITEMS_ALT} direction={-1} speed={1} />
        </div>
      ) : (
        <div className="group overflow-hidden">
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
            <StaticTechList label={label} />
            <StaticTechList hidden />
          </div>
        </div>
      )}
    </div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.2 } },
};
const pillVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: SPRING.snappy },
};

export function Integrations() {
  const content = useContent('home', 'integrations');
  const animated = useMotionTier() !== 'off';
  const itemLabel = (item: IntegrationItem) =>
    typeof item === 'string' ? item : content.items[item.key];

  return (
    <section
      id="integrations"
      aria-labelledby="integrations-title"
      className="relative scroll-mt-20 py-24 md:py-32"
    >
      <SectionDivider />
      <Container>
        <SectionHeader
          titleId="integrations-title"
          eyebrow={content.eyebrow}
          title={content.title}
          lead={content.lead}
        />
      </Container>

      <div className="mt-12">
        <TechMarquee label={content.marqueeLabel} />
      </div>

      <Container>
        <SpotlightGroup>
          <ScrollReveal className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {INTEGRATION_GROUPS.map((group, index) => (
              <motion.div
                key={group.key}
                variants={waveItemVariants}
                custom={gridWaveDelay(index, 3, STAGGER.cards)}
                data-spotlight
                className="spotlight group rounded-2xl border border-border bg-bg-surface/60 p-5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
                    <Icon name={group.icon} size={16} className={iconMotionClass(group.icon)} />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    {content.groups[group.key]}
                  </h3>
                </div>
                <motion.ul
                  className="mt-4 flex flex-wrap gap-2"
                  variants={animated ? groupVariants : undefined}
                  initial={animated ? 'hidden' : false}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                >
                  {group.items.map((item) => {
                    const label = itemLabel(item);
                    return (
                      <motion.li
                        key={label}
                        variants={animated ? pillVariants : undefined}
                        whileHover={animated ? { y: -2 } : undefined}
                        className="rounded-lg border border-border/70 bg-bg-base/40 px-2.5 py-1 text-small text-text-secondary transition-[border-color,color,box-shadow] duration-200 hover:border-accent-primary/50 hover:text-text-primary hover:shadow-glow"
                      >
                        {label}
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </motion.div>
            ))}
            <motion.div
              variants={waveItemVariants}
              custom={gridWaveDelay(INTEGRATION_GROUPS.length, 3, STAGGER.cards)}
              className="group relative flex flex-col justify-center gap-3 rounded-2xl bg-accent-primary/5 p-5"
            >
              {/* «Бегущая» пунктирная рамка */}
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="100%"
                  height="100%"
                  rx="16"
                  fill="none"
                  stroke="rgb(var(--accent-primary) / 0.5)"
                  strokeDasharray="6 6"
                  className={animated ? 'animate-dash' : undefined}
                  style={{ animationDuration: `${DURATION.cinematic}s` }}
                />
              </svg>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white">
                <Plug
                  size={16}
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-45"
                />
              </span>
              <p className="relative text-body font-medium text-text-primary">{content.footer}</p>
            </motion.div>
          </ScrollReveal>
        </SpotlightGroup>
      </Container>
    </section>
  );
}
