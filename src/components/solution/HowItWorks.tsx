import { Section } from '@/components/layout/Section';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StepTimeline } from '@/components/sections/StepTimeline';
import type { KeyedIcon, SolutionPageText } from '@/content/solutionPages/types';

type Props = {
  eyebrow: string;
  steps: readonly KeyedIcon[];
  content: SolutionPageText['howItWorks'];
};

export function HowItWorks({ eyebrow, steps, content }: Props) {
  return (
    <Section id="how" labelledBy="how-title" divider tinted>
      <SectionHeader
        titleId="how-title"
        eyebrow={eyebrow}
        title={content.title}
        lead={content.lead}
      />
      <StepTimeline
        className="mt-16"
        horizontalFrom={steps.length > 5 ? 'xl' : 'lg'}
        steps={steps.map((step, index) => {
          const text = content.steps[step.key];
          return {
            id: step.key,
            content: (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-primary/20 bg-bg-elevated text-accent-primary">
                    <Icon name={step.icon} size={20} />
                  </span>
                  <span aria-hidden className="text-gradient font-display text-h3 font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  {text?.title}
                </h3>
                <p className="text-small leading-relaxed text-text-secondary">{text?.text}</p>
              </>
            ),
          };
        })}
      />
    </Section>
  );
}
