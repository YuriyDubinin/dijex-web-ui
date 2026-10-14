import { Container } from '@/components/layout/Container';
import { useContent } from '@/i18n/useContent';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function PrivacyPage() {
  useDocumentMeta('privacy');
  const privacy = useContent('legal', 'privacy');

  return (
    <Container className="py-24 md:py-32">
      <h1 className="font-display text-h1 font-bold text-text-primary">{privacy.title}</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-body text-text-secondary">
        {privacy.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Container>
  );
}
