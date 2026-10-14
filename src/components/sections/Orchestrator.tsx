import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Section } from '@/components/layout/Section';
import { FadeIn } from '@/components/motion/FadeIn';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button } from '@/components/ui/Button';
import { ButtonArrow } from '@/components/ui/ButtonArrow';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { OrchestratorDiagram } from './OrchestratorDiagram';
import { ORCHESTRATOR_EXAMPLES, ORCHESTRATOR_FEATURES } from '@/content/home/orchestrator';
import { useContent } from '@/i18n/useContent';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, STAGGER, gridWaveDelay } from '@/motion/tokens';
import { iconMotionClass } from '@/components/ui/iconMotion';

export function Orchestrator() {
  const content = useContent('home', 'orchestrator');
  const animated = useMotionTier() !== 'off';

  return (
    <Section id="orchestrator" labelledBy="orchestrator-title" divider tinted>
      <SectionHeader
        titleId="orchestrator-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <div className="mt-16">
        <OrchestratorDiagram />
      </div>

      <SpotlightGroup>
        <ScrollReveal className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ORCHESTRATOR_FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.key}
              icon={feature.icon}
              title={content.features[feature.key].title}
              description={content.features[feature.key].description}
              waveDelay={gridWaveDelay(index, 3)}
            />
          ))}
        </ScrollReveal>
      </SpotlightGroup>

      <FadeIn className="mt-16">
        <h3 className="caps-label text-center text-text-muted">{content.examplesTitle}</h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {ORCHESTRATOR_EXAMPLES.map((example, index) => (
            <motion.li
              key={example.key}
              initial={animated ? { opacity: 0, x: -16 } : false}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: DURATION.slow,
                ease: EASE.outExpo,
                delay: index * STAGGER.cards,
              }}
              className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-bg-base/40 p-4"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-secondary/25 bg-accent-secondary/10 text-accent-secondary">
                {animated ? (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-lg border border-accent-secondary"
                    initial={{ scale: 1, opacity: 0 }}
                    whileInView={{ scale: 1.8, opacity: [0, 0.8, 0] }}
                    viewport={{ once: true, amount: 1 }}
                    transition={{ duration: 1, delay: 0.3 + index * STAGGER.cards }}
                  />
                ) : null}
                <Icon name={example.icon} size={16} className={iconMotionClass(example.icon)} />
              </span>
              <div>
                <p className="text-small font-semibold text-text-primary">
                  {content.examples[example.key].title}
                </p>
                <p className="mt-1 text-small text-text-secondary">
                  {content.examples[example.key].description}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </FadeIn>

      <div className="mt-12 flex justify-center">
        <Button as={Link} viewTransition to="/solutions/ai-orchestrator" variant="ghost">
          {content.cta}
          <ButtonArrow />
        </Button>
      </div>
    </Section>
  );
}
