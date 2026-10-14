import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function ThanksPage() {
  useDocumentMeta('thanks');
  const { t } = useTranslation(['legal', 'common']);

  return (
    <Container className="py-24 md:py-32">
      <h1 className="font-display text-h1 font-bold text-text-primary">
        {t('legal:thanks.title')}
      </h1>
      <p className="mt-6 max-w-2xl text-body text-text-secondary">{t('legal:thanks.body')}</p>
      <Link
        viewTransition
        to="/"
        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-bg-surface/60 px-4 py-2 text-small font-semibold text-text-primary backdrop-blur-sm transition-colors hover:border-accent-primary/60 hover:bg-bg-surface"
      >
        {t('common:actions.backHome')}
      </Link>
    </Container>
  );
}
