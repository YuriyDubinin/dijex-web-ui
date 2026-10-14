import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout/Section';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { SOLUTIONS, type SolutionKey } from '@/content/solutions';
import { SpotlightGroup } from '@/motion/Spotlight';

export function OtherSolutions({ current }: { current: SolutionKey }) {
  const { t } = useTranslation(['solutions', 'common']);

  return (
    <Section id="other-solutions" labelledBy="other-solutions-title" className="pt-0 md:pt-0">
      <h2
        id="other-solutions-title"
        className="text-center font-display text-h3 font-semibold text-text-primary"
      >
        {t('solutions:labels.otherSolutions')}
      </h2>
      <SpotlightGroup>
        <ScrollReveal className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
          {SOLUTIONS.filter((solution) => solution.key !== current).map((solution) => (
            <FeatureCard
              key={solution.key}
              icon={solution.icon}
              title={t(`common:solutions.${solution.key}.title`)}
              description={t(`common:solutions.${solution.key}.description`)}
              href={solution.path}
              linkLabel={t('common:actions.learnMore')}
              iconTransitionName={`solution-icon-${solution.key}`}
            />
          ))}
        </ScrollReveal>
      </SpotlightGroup>
    </Section>
  );
}
