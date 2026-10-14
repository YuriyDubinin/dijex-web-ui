import { Section } from '@/components/layout/Section';
import { FadeIn } from '@/components/motion/FadeIn';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ChannelGrid } from '@/components/sections/ChannelGrid';
import { ChatDemo } from '@/components/sections/ChatDemo';
import { LanguagesDemo } from './LanguagesDemo';
import type { ImageKey } from '@/content/images';
import { useContent } from '@/i18n/useContent';

type Props = {
  eyebrow: string;
  inboxImage: ImageKey;
  timeline: readonly string[];
};

/** Агент поддержки: каналы, демо диалога, языки, inbox оператора и план запуска. */
export function ChannelsSpecial({ eyebrow, inboxImage, timeline }: Props) {
  const content = useContent('solutions', 'supportAgent');
  const steps = content.timeline.steps as Record<string, { label: string; text: string }>;

  return (
    <Section id="channels" labelledBy="channels-title" divider tinted>
      <SectionHeader
        titleId="channels-title"
        eyebrow={eyebrow}
        title={content.channels.title}
        lead={content.channels.lead}
        tone="secondary"
      />

      <div className="mt-14">
        <ChannelGrid />
      </div>

      <div className="mt-16 grid items-start gap-10 lg:grid-cols-2">
        <FadeIn>
          <ChatDemo />
        </FadeIn>
        <FadeIn delay={0.1} className="flex flex-col gap-6">
          <LanguagesDemo />
          <figure>
            <ImageSlot image={inboxImage} glow="cyan" />
            <figcaption className="mt-3 text-center text-small text-text-muted">
              {content.inboxCaption}
            </figcaption>
          </figure>
        </FadeIn>
      </div>

      <FadeIn className="mt-16">
        <h3 className="text-center font-display text-h3 font-semibold text-text-primary">
          {content.timeline.title}
        </h3>
        <ol className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((key, index) => {
            const step = steps[key];
            if (!step) return null;
            return (
              <li
                key={key}
                className="relative rounded-2xl border border-border bg-bg-surface/60 p-5 backdrop-blur-sm"
              >
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent-secondary">
                  {step.label}
                </span>
                <p className="mt-2 text-small font-medium text-text-primary">{step.text}</p>
                {index < timeline.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute -right-3 top-1/2 hidden h-px w-6 bg-gradient-to-r from-accent-secondary/60 to-transparent lg:block"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </FadeIn>
    </Section>
  );
}
