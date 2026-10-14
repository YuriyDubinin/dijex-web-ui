import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';
import { Section } from '@/components/layout/Section';
import { FadeIn } from '@/components/motion/FadeIn';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { revealItemVariants } from '@/components/motion/variants';
import { Badge } from '@/components/ui/Badge';
import { ButtonArrow } from '@/components/ui/ButtonArrow';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProcessDirection } from '@/components/sections/DigitalProcesses';
import { PROCESS_TABS, type ProcessTabKey } from '@/content/home/processes';
import type { KeyedIcon } from '@/content/solutionPages/types';
import { useContent } from '@/i18n/useContent';

type Props = {
  eyebrow: string;
  directions: readonly ProcessTabKey[];
  aiBoost: readonly KeyedIcon[];
};

/** Цифровые процессы: четыре направления подробно и блок «Где AI усиливает систему». */
export function DirectionsSpecial({ eyebrow, directions, aiBoost }: Props) {
  const page = useContent('solutions', 'digitalProcesses');
  const tabs = useContent('home', 'processes').tabs;
  const boostItems = page.aiBoost.items as Record<string, { title: string; text: string }>;

  return (
    <>
      <Section id="directions" labelledBy="directions-title" divider tinted>
        <SectionHeader
          titleId="directions-title"
          eyebrow={eyebrow}
          title={page.directions.title}
          lead={page.directions.lead}
        />
        <div className="mt-16 flex flex-col gap-20">
          {directions.map((key) => {
            const definition = PROCESS_TABS.find((tab) => tab.key === key);
            return (
              <FadeIn key={key}>
                <article aria-labelledby={`direction-${key}`}>
                  <div className="mb-8 flex items-center gap-3">
                    {definition ? (
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
                        <Icon name={definition.icon} size={20} />
                      </span>
                    ) : null}
                    <h3
                      id={`direction-${key}`}
                      className="font-display text-h2 font-bold text-text-primary"
                    >
                      {tabs[key].tab}
                    </h3>
                  </div>
                  <ProcessDirection tabKey={key} headingLevel="h4" />
                  <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border/70 bg-bg-base/40 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <p className="max-w-2xl text-small leading-relaxed text-text-secondary">
                      {page.directions.extras[key]}
                    </p>
                    {definition ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="caps-label mr-1 text-text-muted">
                          {page.directions.techLabel}
                        </span>
                        {definition.tech.map((tech) => (
                          <Badge key={tech}>{tech}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      <Section id="ai-boost" labelledBy="ai-boost-title" divider>
        <SectionHeader
          titleId="ai-boost-title"
          eyebrow="AI"
          title={page.aiBoost.title}
          lead={page.aiBoost.lead}
        />
        <ScrollReveal
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          staggerChildren={0.07}
        >
          {aiBoost.map((item) => (
            <motion.div
              key={item.key}
              variants={revealItemVariants}
              className="conic-border group flex h-full flex-col gap-3 rounded-2xl bg-bg-surface/60 p-5 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <Icon name={item.icon} size={18} className={iconMotionClass(item.icon)} />
              </span>
              <h3 className="text-body font-semibold text-text-primary">
                {boostItems[item.key]?.title}
              </h3>
              <p className="text-small text-text-secondary">{boostItems[item.key]?.text}</p>
            </motion.div>
          ))}
        </ScrollReveal>
        <div className="mt-10 flex justify-center">
          <Link
            viewTransition
            to="/solutions/ai-orchestrator"
            className="group inline-flex items-center gap-2 text-body font-semibold text-accent-primary transition-colors hover:text-accent-secondary"
          >
            {page.aiBoost.link}
            <ButtonArrow />
          </Link>
        </div>
      </Section>
    </>
  );
}
