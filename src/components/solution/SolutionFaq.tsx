import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout/Section';
import { FadeIn } from '@/components/motion/FadeIn';
import { Accordion } from '@/components/ui/Accordion';
import type { SolutionPageText } from '@/content/solutionPages/types';

type Props = {
  order: readonly string[];
  items: SolutionPageText['faq'];
};

export function SolutionFaq({ order, items }: Props) {
  const { t } = useTranslation('solutions');

  return (
    <Section id="solution-faq" labelledBy="solution-faq-title" divider>
      <FadeIn className="mx-auto max-w-3xl">
        <h2
          id="solution-faq-title"
          className="text-center font-display text-h2 font-bold text-text-primary"
        >
          {t('labels.faqTitle')}
        </h2>
        <Accordion
          className="mt-10"
          defaultOpenIds={order.slice(0, 1)}
          items={order.flatMap((key) => {
            const item = items[key];
            return item ? [{ id: key, title: item.q, content: <p>{item.a}</p> }] : [];
          })}
        />
      </FadeIn>
    </Section>
  );
}
