import { lazy, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { VisualSlot } from '@/components/ui/VisualSlot';
import { SOLUTIONS } from '@/content/solutions';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useMotionTier } from '@/motion/tier';

const NeuralField = lazy(() =>
  import('@/components/hero/NeuralField').then((module) => ({ default: module.NeuralField })),
);

export function NotFoundPage() {
  useDocumentMeta('notFound');
  const { t } = useTranslation();
  const tier = useMotionTier();

  return (
    <div className="relative overflow-hidden">
      {tier === 'full' ? (
        <Suspense fallback={null}>
          <NeuralField
            calm
            className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
          />
        </Suspense>
      ) : null}
      <Container className="relative py-24 md:py-32">
        {/* Сцена «потерянный пакет» — вместо статичной картинки */}
        <VisualSlot slot="notFound" priority className="mx-auto w-full max-w-md" />
        <SectionHeader
          as="h1"
          className="mt-6"
          eyebrow={t('notFound.eyebrow')}
          title={t('notFound.title')}
          lead={t('notFound.lead')}
        />
        <SpotlightGroup>
          <ScrollReveal className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
            {SOLUTIONS.map((solution) => (
              <FeatureCard
                key={solution.key}
                icon={solution.icon}
                title={t(`solutions.${solution.key}.title`)}
                description={t(`solutions.${solution.key}.description`)}
                href={solution.path}
                linkLabel={t('actions.learnMore')}
              />
            ))}
          </ScrollReveal>
        </SpotlightGroup>
        <div className="mt-12 flex justify-center">
          <Button as={Link} viewTransition to="/" variant="ghost">
            <ArrowLeft size={18} aria-hidden />
            {t('actions.backHome')}
          </Button>
        </div>
      </Container>
    </div>
  );
}
