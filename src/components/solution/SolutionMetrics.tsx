import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout/Section';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { revealItemVariants } from '@/components/motion/variants';
import { MetricCard } from '@/components/sections/MetricCard';
import type { SolutionPageText } from '@/content/solutionPages/types';

type Props = {
  items: readonly { key: string; value: number }[];
  texts: SolutionPageText['metrics'];
};

/** Метрики решения. Если подтверждённых цифр нет — блок не показывается. */
export function SolutionMetrics({ items, texts }: Props) {
  const { t } = useTranslation('solutions');
  if (items.length === 0 || !texts) return null;

  return (
    <Section id="metrics" labelledBy="metrics-title" divider tinted>
      <h2
        id="metrics-title"
        className="text-center font-display text-h2 font-bold text-text-primary"
      >
        {t('labels.metricsTitle')}
      </h2>
      <ScrollReveal
        className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3"
        staggerChildren={0.1}
      >
        {items.map((metric) => {
          const text = texts[metric.key];
          if (!text) return null;
          return (
            <motion.div key={metric.key} variants={revealItemVariants}>
              <MetricCard
                size="lg"
                value={metric.value}
                prefix={text.prefix}
                suffix={text.suffix}
                label={text.label}
              />
            </motion.div>
          );
        })}
      </ScrollReveal>
    </Section>
  );
}
