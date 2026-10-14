import { Section } from '@/components/layout/Section';
import { FadeIn } from '@/components/motion/FadeIn';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DeploymentOptions } from '@/components/sections/Security';
import type { ImageKey } from '@/content/images';
import { useContent } from '@/i18n/useContent';

type Props = {
  eyebrow: string;
  models: readonly string[];
  consoleImage: ImageKey;
};

/** Оркестратор: варианты развёртывания, модели и консоль наблюдаемости. */
export function DeploymentSpecial({ eyebrow, models, consoleImage }: Props) {
  const content = useContent('solutions', 'aiOrchestrator').deployment;

  return (
    <Section id="deployment" labelledBy="deployment-title" divider tinted>
      <SectionHeader
        titleId="deployment-title"
        eyebrow={eyebrow}
        title={content.title}
        lead={content.lead}
      />
      <div className="mt-16 grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
        <FadeIn className="flex flex-col gap-6">
          <DeploymentOptions />
          <div className="rounded-2xl border border-border bg-bg-surface/60 p-6 backdrop-blur-sm">
            <h3 className="caps-label text-text-muted">{content.modelsTitle}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {models.map((model) => (
                <li
                  key={model}
                  className="flex items-center gap-2 rounded-xl border border-border/70 bg-bg-base/40 px-3 py-1.5 text-small text-text-secondary"
                >
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-secondary" />
                  {model}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <figure>
            <ImageSlot image={consoleImage} />
            <figcaption className="mt-4 text-center text-small text-text-muted">
              {content.consoleCaption}
            </figcaption>
          </figure>
        </FadeIn>
      </div>
    </Section>
  );
}
