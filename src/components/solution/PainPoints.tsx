import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { SectionDivider } from '@/components/layout/SectionDivider';
import { Icon } from '@/components/ui/Icon';
import type { KeyedIcon } from '@/content/solutionPages/types';
import { SplitText } from '@/motion/SplitText';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, STAGGER, gridWaveDelay } from '@/motion/tokens';

type Props = {
  items: readonly KeyedIcon[];
  texts: Record<string, string>;
};

/**
 * «Знакомо?» — боли клиента: появляются «тревожно» (красноватое свечение, иконки вздрагивают),
 * а при прокрутке к мосту «Вот как мы это решаем» фон переходит из тревожного оттенка в фирменный.
 */
export function PainPoints({ items, texts }: Props) {
  const { t } = useTranslation('solutions');
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const alarm = useTransform(scrollYProgress, [0.15, 0.45, 0.75], [0, 1, 0]);
  const relief = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);

  return (
    <section
      ref={ref}
      id="pains"
      aria-labelledby="pains-title"
      className="relative scroll-mt-20 overflow-hidden py-24 md:py-32"
    >
      <SectionDivider />
      {animated ? (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,rgb(var(--danger)/0.08),transparent_70%)]"
            style={{ opacity: alarm }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_80%,rgb(var(--accent-primary)/0.12),transparent_70%)]"
            style={{ opacity: relief }}
          />
        </>
      ) : null}

      <Container className="relative">
        <SplitText
          as="h2"
          id="pains-title"
          text={t('labels.painsTitle')}
          className="text-center font-display text-h2 font-bold text-text-primary"
        />
        <ul className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <motion.li
              key={item.key}
              initial={animated ? { opacity: 0, y: 18 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: DURATION.slow,
                ease: EASE.outExpo,
                delay: gridWaveDelay(index, 2, STAGGER.cards),
              }}
              className="flex items-start gap-4 rounded-2xl border border-danger/15 bg-bg-base/60 p-5 shadow-[0_0_40px_-24px_rgb(var(--danger)/0.6)]"
            >
              <motion.span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-danger/25 bg-danger/10 text-danger/80"
                initial={false}
                whileInView={animated ? { x: [0, -1.5, 1.5, -1, 0] } : undefined}
                viewport={{ once: true, amount: 1 }}
                transition={{ duration: 0.25, delay: 0.35 + index * 0.08 }}
              >
                <Icon name={item.icon} size={18} />
              </motion.span>
              <p className="text-body leading-relaxed text-text-secondary">{texts[item.key]}</p>
            </motion.li>
          ))}
        </ul>
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <motion.span
            className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-primary/40 bg-accent-primary/10 text-accent-primary"
            initial={animated ? { y: -16, opacity: 0 } : false}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
          >
            <ArrowDown size={18} aria-hidden />
          </motion.span>
          <p className="text-gradient bg-[length:200%_auto] font-display text-h3 font-semibold motion-safe:animate-gradient-pan">
            {t('labels.painsBridge')}
          </p>
        </div>
      </Container>
    </section>
  );
}
