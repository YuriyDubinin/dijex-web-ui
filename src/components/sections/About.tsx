import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { FadeIn } from '@/components/motion/FadeIn';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { waveItemVariants } from '@/components/motion/variants';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { VisualSlot } from '@/components/ui/VisualSlot';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MetricCard } from './MetricCard';
import { ABOUT_METRICS, ABOUT_PRINCIPLES } from '@/content/home/about';
import { useContent } from '@/i18n/useContent';
import { SpotlightGroup } from '@/motion/Spotlight';
import { Tilt } from '@/motion/Tilt';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, STAGGER, gridWaveDelay } from '@/motion/tokens';

/** Максимум шкалы для линии-прогресса под каждой метрикой. */
const METRIC_SCALE: Record<string, number> = {
  years: 10,
  projects: 100,
  clients: 30,
  technologies: 60,
};

export function About() {
  const about = useContent('home', 'about');
  const tier = useMotionTier();
  const animated = tier !== 'off';

  return (
    <Section id="about" labelledBy="about-title" divider>
      <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-6">
          <SectionHeader
            align="left"
            titleId="about-title"
            eyebrow={about.eyebrow}
            title={about.title}
            lead={about.lead}
          />
          <FadeIn delay={0.2}>
            <p className="text-body leading-relaxed text-text-muted">{about.body}</p>
          </FadeIn>

          {/* Принципы-«чекпоинты», соединённые линией */}
          <ul className="relative flex flex-col gap-3 pt-2">
            <motion.span
              aria-hidden
              className="absolute bottom-5 left-[18px] top-7 w-px origin-top bg-gradient-to-b from-accent-primary/60 to-accent-secondary/40"
              initial={animated ? { scaleY: 0 } : false}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: DURATION.cinematic, ease: EASE.outExpo, delay: 0.2 }}
            />
            {ABOUT_PRINCIPLES.map((principle, index) => (
              <motion.li
                key={principle.key}
                initial={animated ? { opacity: 0, x: -12 } : false}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: DURATION.slow,
                  ease: EASE.outExpo,
                  delay: 0.25 + index * STAGGER.sections,
                }}
                className="group relative flex items-center gap-3 text-body text-text-primary"
              >
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-primary/20 bg-bg-base text-accent-primary">
                  <Icon
                    name={principle.icon}
                    size={16}
                    className={iconMotionClass(principle.icon)}
                  />
                </span>
                {about.principles[principle.key]}
              </motion.li>
            ))}
          </ul>
        </div>

        <FadeIn delay={0.15} variant="scale-in">
          <Tilt max={5} className="rounded-2xl">
            <VisualSlot slot="aboutGlobe" />
          </Tilt>
        </FadeIn>
      </div>

      <SpotlightGroup>
        <ScrollReveal className="mt-16 grid grid-cols-2 gap-4 md:mt-20 lg:grid-cols-4">
          {ABOUT_METRICS.map((metric, index) => (
            <motion.div
              key={metric.key}
              variants={waveItemVariants}
              custom={gridWaveDelay(index, 4, STAGGER.cards)}
            >
              <MetricCard
                value={metric.value}
                suffix={metric.suffix}
                label={about.metrics[metric.key]}
                progress={metric.value / (METRIC_SCALE[metric.key] ?? metric.value)}
              />
            </motion.div>
          ))}
        </ScrollReveal>
      </SpotlightGroup>
    </Section>
  );
}
