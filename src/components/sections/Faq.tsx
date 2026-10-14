import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout/Section';
import { AnchorLink } from '@/components/layout/AnchorLink';
import { FadeIn } from '@/components/motion/FadeIn';
import { Accordion } from '@/components/ui/Accordion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FAQ_ORDER } from '@/content/home/faq';
import { LOCALE_META } from '@/i18n/config';
import { resolveLocale } from '@/i18n/i18n';
import { useContent } from '@/i18n/useContent';
import { SpotlightGroup } from '@/motion/Spotlight';

export function Faq() {
  const { i18n } = useTranslation();
  const content = useContent('home', 'faq');
  const locale = resolveLocale(i18n);
  const { hash } = useLocation();
  // Ссылка вида #faq-<id> открывает конкретный вопрос
  const linkedId = hash.startsWith('#faq-') ? hash.slice('#faq-'.length) : null;
  const openId =
    linkedId && (FAQ_ORDER as readonly string[]).includes(linkedId) ? linkedId : FAQ_ORDER[0];

  useEffect(() => {
    if (!linkedId) return;
    document
      .getElementById(`faq-${linkedId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [linkedId]);

  // Разметка schema.org/FAQPage — на текущем языке, пересоздаётся при его смене
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: LOCALE_META[locale].htmlLang,
        mainEntity: FAQ_ORDER.map((key) => ({
          '@type': 'Question',
          name: content.items[key].q,
          acceptedAnswer: { '@type': 'Answer', text: content.items[key].a },
        })),
      }),
    [content, locale],
  );

  return (
    <Section id="faq" labelledBy="faq-title" divider>
      <SectionHeader titleId="faq-title" eyebrow={content.eyebrow} title={content.title} />

      <div className="mx-auto mt-14 max-w-3xl">
        <SpotlightGroup>
          <Accordion
            key={openId}
            itemIdPrefix="faq"
            defaultOpenIds={[openId ?? '']}
            items={FAQ_ORDER.map((key) => ({
              id: key,
              title: content.items[key].q,
              content: <p>{content.items[key].a}</p>,
            }))}
          />
        </SpotlightGroup>

        <FadeIn className="mt-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <span className="text-body text-text-secondary">{content.notFound}</span>
          <AnchorLink
            href="#contact"
            className="inline-flex items-center gap-2 text-body font-semibold text-accent-primary transition-colors hover:text-accent-secondary"
          >
            <MessageCircle size={18} aria-hidden />
            {content.ask}
          </AnchorLink>
        </FadeIn>
      </div>

      <script type="application/ld+json">{jsonLd}</script>
    </Section>
  );
}
