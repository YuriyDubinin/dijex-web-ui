import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from './Container';

/** Экран ошибки маршрута (errorElement data-роутера) — вместо стандартного «Unexpected Application Error». */
export function RouteError() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen items-center bg-bg-base text-text-primary">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="eyebrow text-accent-primary">{t('notFound.eyebrow')}</p>
        <h1 className="font-display text-h1 font-bold">{t('notFound.title')}</h1>
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-bg-surface/60 px-5 py-2 text-small font-semibold transition-colors hover:border-accent-primary/60"
        >
          {t('actions.backHome')}
        </Link>
      </Container>
    </main>
  );
}
