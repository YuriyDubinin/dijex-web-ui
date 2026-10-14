import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout/Section';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { waveItemVariants } from '@/components/motion/variants';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { KeyedIcon, SolutionPageText } from '@/content/solutionPages/types';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, gridWaveDelay } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Props = {
  eyebrow: string;
  items: readonly KeyedIcon[];
  content: SolutionPageText['useCases'];
};

/**
 * Сценарии применения: «Ситуация → Что делаем → Результат» раскрываются последовательно,
 * линия слева проходит от серого (ситуация) через индиго к зелёному (результат).
 */
export function UseCases({ eyebrow, items, content }: Props) {
  const { t } = useTranslation('solutions');
  const animated = useMotionTier() !== 'off';
  const rows = [
    { key: 'situation', label: t('labels.situation'), tone: 'text-text-muted' },
    { key: 'action', label: t('labels.action'), tone: 'text-accent-primary' },
    { key: 'result', label: t('labels.result'), tone: 'text-success' },
  ] as const;

  return (
    <Section id="use-cases" labelledBy="use-cases-title" divider>
      <SectionHeader titleId="use-cases-title" eyebrow={eyebrow} title={content.title} />
      <SpotlightGroup>
        <ScrollReveal className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const useCase = content.items[item.key];
            if (!useCase) return null;
            return (
              <motion.article
                key={item.key}
                variants={waveItemVariants}
                custom={gridWaveDelay(index, 3)}
                data-spotlight
                className="spotlight group flex h-full flex-col gap-4 rounded-2xl border border-border bg-bg-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-accent-primary/40"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-secondary/20 bg-accent-secondary/10 text-accent-secondary">
                    <Icon name={item.icon} size={18} className={iconMotionClass(item.icon)} />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    {useCase.title}
                  </h3>
                </div>
                <dl className="relative flex flex-col gap-3 pl-3">
                  <motion.span
                    aria-hidden
                    className="absolute bottom-1 left-0 top-1 w-0.5 origin-top rounded-full bg-gradient-to-b from-text-muted/60 via-accent-primary to-success"
                    initial={animated ? { scaleY: 0 } : false}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={{ duration: DURATION.cinematic, ease: EASE.outExpo, delay: 0.2 }}
                  />
                  {rows.map((row, rowIndex) => (
                    <motion.div
                      key={row.key}
                      initial={animated ? { opacity: 0, x: -8 } : false}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{
                        duration: DURATION.slow,
                        ease: EASE.outExpo,
                        delay: 0.25 + rowIndex * 0.3,
                      }}
                    >
                      <dt className={cn('caps-label', row.tone)}>{row.label}</dt>
                      <dd className="mt-1 text-small leading-relaxed text-text-secondary">
                        {useCase[row.key]}
                      </dd>
                    </motion.div>
                  ))}
                </dl>
              </motion.article>
            );
          })}
        </ScrollReveal>
      </SpotlightGroup>
    </Section>
  );
}
