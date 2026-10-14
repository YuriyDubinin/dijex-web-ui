import { Section } from '@/components/layout/Section';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { KeyedIcon, SolutionPageText } from '@/content/solutionPages/types';
import { SpotlightGroup } from '@/motion/Spotlight';
import { gridWaveDelay } from '@/motion/tokens';

type Props = {
  eyebrow: string;
  items: readonly KeyedIcon[];
  content: SolutionPageText['capabilities'];
};

export function Capabilities({ eyebrow, items, content }: Props) {
  return (
    <Section id="capabilities" labelledBy="capabilities-title" divider>
      <SectionHeader
        titleId="capabilities-title"
        eyebrow={eyebrow}
        title={content.title}
        lead={content.lead}
      />
      <SpotlightGroup>
        <ScrollReveal className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <FeatureCard
              key={item.key}
              icon={item.icon}
              title={content.items[item.key]?.title ?? ''}
              description={content.items[item.key]?.description ?? ''}
              waveDelay={gridWaveDelay(index, 3)}
            />
          ))}
        </ScrollReveal>
      </SpotlightGroup>
    </Section>
  );
}
