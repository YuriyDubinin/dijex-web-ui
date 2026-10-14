import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/layout/Container';
import { AnchorLink } from '@/components/layout/AnchorLink';
import { HeroBackdrop } from '@/components/hero/HeroBackdrop';
import { Button } from '@/components/ui/Button';
import { ButtonArrow } from '@/components/ui/ButtonArrow';
import { Icon } from '@/components/ui/Icon';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { ContactRouteState } from '@/content/contact';
import type { SolutionPageText } from '@/content/solutionPages';
import type { SolutionDef } from '@/content/solutions';
import { Reveal } from '@/motion/Reveal';
import { SplitText } from '@/motion/SplitText';
import { Tilt } from '@/motion/Tilt';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, STAGGER } from '@/motion/tokens';

type Props = {
  solution: SolutionDef;
  hero: SolutionPageText['hero'];
};

export function SolutionHero({ solution, hero }: Props) {
  const { t } = useTranslation();
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const ref = useRef<HTMLElement>(null);
  const contactState: ContactRouteState = { subjectKey: solution.subjectKey };
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  const crumbs = [
    <Link
      key="home"
      viewTransition
      to="/"
      className="link-underline transition-colors hover:text-text-primary"
    >
      {t('breadcrumbs.home')}
    </Link>,
    <AnchorLink
      key="solutions"
      href="/#solutions"
      className="link-underline transition-colors hover:text-text-primary"
    >
      {t('breadcrumbs.solutions')}
    </AnchorLink>,
    <span key="current" aria-current="page" className="text-text-secondary">
      {t(`solutions.${solution.key}.title`)}
    </span>,
  ];

  return (
    <section
      ref={ref}
      aria-labelledby="solution-title"
      className="relative -mt-16 overflow-hidden pb-20 pt-28 md:-mt-20 md:pb-28 md:pt-36"
    >
      <HeroBackdrop calm scrollProgress={scrollYProgress} />
      <Container className="relative z-10">
        <nav aria-label={t('breadcrumbs.label')}>
          <ol className="flex flex-wrap items-center gap-1.5 text-small text-text-muted">
            {crumbs.map((crumb, index) => (
              <motion.li
                key={index}
                className="inline-flex items-center gap-1.5"
                initial={animated ? { opacity: 0, x: -8 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: DURATION.base,
                  ease: EASE.outExpo,
                  delay: index * STAGGER.items,
                }}
              >
                {index > 0 ? <ChevronRight size={14} aria-hidden /> : null}
                {crumb}
              </motion.li>
            ))}
          </ol>
        </nav>

        <motion.div
          className="mt-10 grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16"
          style={tier === 'full' ? { y: contentY, opacity: contentOpacity } : undefined}
        >
          <div className="flex flex-col gap-6">
            <Reveal immediate variant="blur-up">
              <p className="eyebrow inline-flex items-center gap-2 text-accent-primary">
                <span
                  className="inline-flex"
                  style={{ viewTransitionName: `solution-icon-${solution.key}` }}
                >
                  <Icon name={solution.icon} size={16} />
                </span>
                {hero.eyebrow}
              </p>
            </Reveal>
            <SplitText
              as="h1"
              id="solution-title"
              text={hero.title}
              mode="mask-up"
              trigger="mount"
              delay={0.1}
              className="text-balance font-display text-h1 font-bold text-text-primary lg:text-[clamp(2.25rem,3.6vw,3.25rem)] lg:leading-[1.1]"
            />
            <Reveal immediate variant="blur-up" delay={0.4}>
              <p className="text-body leading-relaxed text-text-secondary md:text-lg">
                {hero.lead}
              </p>
            </Reveal>
            <Reveal immediate delay={0.55} className="flex flex-wrap gap-3 pt-2">
              <Button as={AnchorLink} href="/#contact" state={contactState} size="lg">
                {hero.primaryCta}
                <ButtonArrow />
              </Button>
              <Button as={AnchorLink} href="#how" variant="ghost" size="lg">
                {hero.secondaryCta}
              </Button>
            </Reveal>
          </div>
          <Reveal immediate variant="scale-in" delay={0.2}>
            <div style={{ viewTransitionName: `solution-visual-${solution.key}` }}>
              <Tilt max={5} className="rounded-2xl">
                <ImageSlot image={solution.heroImage} priority />
              </Tilt>
            </div>
          </Reveal>
        </motion.div>
      </Container>
    </section>
  );
}
