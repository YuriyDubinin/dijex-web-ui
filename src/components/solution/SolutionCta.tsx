import { useRef, type PointerEvent } from 'react';
import { motion, useMotionTemplate, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { AnchorLink } from '@/components/layout/AnchorLink';
import { Button } from '@/components/ui/Button';
import { ButtonArrow } from '@/components/ui/ButtonArrow';
import type { ContactRouteState, SubjectKey } from '@/content/contact';
import type { SolutionPageText } from '@/content/solutionPages/types';
import { useActiveInViewport, usePointerFine } from '@/motion/hooks';
import { Reveal } from '@/motion/Reveal';
import { SplitText } from '@/motion/SplitText';
import { Tilt } from '@/motion/Tilt';
import { useMotionTier } from '@/motion/tier';
import { SPRING_VALUE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Props = {
  content: SolutionPageText['cta'];
  subjectKey: SubjectKey;
};

/**
 * Финальный призыв: карточка с наклоном, вращающейся градиентной рамкой и «туманностью»,
 * дрейфующей за курсором. Ведёт к форме на главной с предзаполненной темой.
 */
export function SolutionCta({ content, subjectKey }: Props) {
  const { t } = useTranslation();
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const ref = useRef<HTMLDivElement>(null);
  const active = useActiveInViewport(ref);
  const state: ContactRouteState = { subjectKey };
  const glowX = useSpring(50, SPRING_VALUE.soft);
  const glowY = useSpring(30, SPRING_VALUE.soft);
  const glow = useMotionTemplate`radial-gradient(600px circle at ${glowX}% ${glowY}%, rgb(var(--accent-primary) / 0.22), transparent 60%)`;
  const drift = tier === 'full' && pointerFine;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drift) return;
    const rect = event.currentTarget.getBoundingClientRect();
    glowX.set(((event.clientX - rect.left) / rect.width) * 100);
    glowY.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <section aria-labelledby="solution-cta-title" className="py-16 md:py-24">
      <Container>
        <Reveal variant="clip-up">
          <Tilt max={3} glare={false} className="rounded-3xl">
            <div
              ref={ref}
              onPointerMove={onPointerMove}
              className={cn(
                'conic-border relative overflow-hidden rounded-3xl bg-bg-elevated/80 px-5 py-14 text-center shadow-glow sm:px-12',
                (!active || tier === 'off') && 'is-paused',
              )}
            >
              <div aria-hidden className="absolute inset-0 bg-hero-mesh opacity-70" />
              <motion.div aria-hidden className="absolute inset-0" style={{ background: glow }} />
              <div aria-hidden className="absolute inset-0 bg-grid-pattern opacity-60" />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
                <SplitText
                  as="h2"
                  id="solution-cta-title"
                  text={content.title}
                  className="text-balance font-display text-[1.5rem] font-bold leading-tight text-text-primary sm:text-h1"
                />
                <Reveal variant="blur-up" delay={0.3}>
                  <p className="text-body text-text-secondary md:text-lg">{content.lead}</p>
                </Reveal>
                <Reveal delay={0.45}>
                  <Button as={AnchorLink} href="/#contact" state={state} size="lg" className="mt-2">
                    {t('actions.discussProject')}
                    <ButtonArrow />
                  </Button>
                </Reveal>
              </div>
            </div>
          </Tilt>
        </Reveal>
      </Container>
    </section>
  );
}
