import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Capabilities } from '@/components/solution/Capabilities';
import { ChannelsSpecial } from '@/components/solution/ChannelsSpecial';
import { DeploymentSpecial } from '@/components/solution/DeploymentSpecial';
import { DirectionsSpecial } from '@/components/solution/DirectionsSpecial';
import { HowItWorks } from '@/components/solution/HowItWorks';
import { OtherSolutions } from '@/components/solution/OtherSolutions';
import { PainPoints } from '@/components/solution/PainPoints';
import { SolutionCta } from '@/components/solution/SolutionCta';
import { SolutionFaq } from '@/components/solution/SolutionFaq';
import { SolutionHero } from '@/components/solution/SolutionHero';
import { SolutionMetrics } from '@/components/solution/SolutionMetrics';
import { UseCases } from '@/components/solution/UseCases';
import {
  SOLUTION_PAGES,
  type SolutionPageText,
  type SolutionSpecial,
} from '@/content/solutionPages';
import { getSolutionBySlug, type SolutionDef } from '@/content/solutions';
import { useContent } from '@/i18n/useContent';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { NotFoundPage } from './NotFoundPage';

function SpecialBlock({ special, eyebrow }: { special: SolutionSpecial; eyebrow: string }) {
  switch (special.kind) {
    case 'deployment':
      return (
        <DeploymentSpecial
          eyebrow={eyebrow}
          models={special.models}
          consoleVisual={special.consoleVisual}
        />
      );
    case 'channels':
      return (
        <ChannelsSpecial
          eyebrow={eyebrow}
          inboxVisual={special.inboxVisual}
          timeline={special.timeline}
        />
      );
    case 'directions':
      return (
        <DirectionsSpecial
          eyebrow={eyebrow}
          directions={special.directions}
          aiBoost={special.aiBoost}
        />
      );
  }
}

function SolutionContent({ solution }: { solution: SolutionDef }) {
  const { t } = useTranslation('solutions');
  useDocumentMeta(solution.key);
  const page = SOLUTION_PAGES[solution.key];
  // Все три страницы имеют общую форму текстов (см. SolutionPageText); уникальные блоки читают свой ключ сами
  const text: SolutionPageText = useContent('solutions', solution.key);
  const eyebrow = text.hero.eyebrow;

  return (
    <>
      <SolutionHero solution={solution} hero={text.hero} />
      <PainPoints items={page.pains} texts={text.pains} />
      <HowItWorks eyebrow={t('labels.howItWorks')} steps={page.steps} content={text.howItWorks} />
      <Capabilities eyebrow={eyebrow} items={page.capabilities} content={text.capabilities} />
      <SpecialBlock special={page.special} eyebrow={eyebrow} />
      <UseCases eyebrow={eyebrow} items={page.useCases} content={text.useCases} />
      <SolutionMetrics items={page.metrics} texts={text.metrics} />
      <SolutionFaq order={page.faq} items={text.faq} />
      <SolutionCta content={text.cta} subjectKey={solution.subjectKey} />
      <OtherSolutions current={solution.key} />
    </>
  );
}

export function SolutionPage() {
  const { slug } = useParams();
  const solution = getSolutionBySlug(slug);
  if (!solution) return <NotFoundPage />;
  // key — чтобы при переходе между решениями состояние секций сбрасывалось
  return <SolutionContent key={solution.key} solution={solution} />;
}
