import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StepTimeline } from './StepTimeline';
import { PROCESS_STEPS } from '@/content/home/process';
import { useContent } from '@/i18n/useContent';
import { DrawCheck } from '@/motion/DrawCheck';

export function Process() {
  const content = useContent('home', 'process');

  return (
    <Section id="process" labelledBy="process-title" divider>
      <SectionHeader
        titleId="process-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <StepTimeline
        className="mt-16"
        steps={PROCESS_STEPS.map((key, index) => {
          const step = content.steps[key];
          return {
            id: key,
            content: (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className="text-gradient bg-[length:220%_auto] bg-[position:100%_0] font-display text-h1 font-bold leading-none tracking-tight transition-[background-position] duration-1000 ease-out group-data-[active=true]/step:bg-[position:0%_0]"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="rounded-full border border-border bg-bg-base/60 px-2.5 py-1 text-xs text-text-secondary transition-[border-color,color,transform] duration-500 group-data-[active=true]/step:scale-105 group-data-[active=true]/step:border-accent-secondary/50 group-data-[active=true]/step:text-accent-secondary">
                    {step.duration}
                  </span>
                </div>
                <h3 className="font-display text-h3 font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-small leading-relaxed text-text-secondary">{step.description}</p>
                <div className="mt-auto border-t border-border/60 pt-3">
                  <p className="caps-label text-text-muted">{content.outputLabel}</p>
                  <p className="mt-1.5 flex items-start gap-2 text-small font-medium text-text-primary">
                    <DrawCheck className="mt-0.5 text-success" delay={0.3} />
                    {step.output}
                  </p>
                </div>
              </>
            ),
          };
        })}
      />
    </Section>
  );
}
