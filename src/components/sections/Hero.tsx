import { Fragment, useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { AnchorLink } from '@/components/layout/AnchorLink';
import { HeroBackdrop } from '@/components/hero/HeroBackdrop';
import { Button } from '@/components/ui/Button';
import { ButtonArrow } from '@/components/ui/ButtonArrow';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { HERO_PILLARS } from '@/content/home/hero';
import { useContent } from '@/i18n/useContent';
import { useIntro } from '@/motion/intro';
import { SplitText } from '@/motion/SplitText';
import { useMotionTier } from '@/motion/tier';
import { DISTANCE, DURATION, EASE, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';

/** Порядок первого экрана (секунды от готовности): бейдж → заголовок по словам → подзаголовок → CTA → чипы → статы. */
const TIMELINE = {
  badge: 0,
  title: 0.05,
  subtitle: 0.45,
  ctas: 0.65,
  pillars: 0.8,
  stats: 0.95,
  scrollHint: 1.4,
} as const;

const fadeUp = (delay: number): Variants => ({
  hidden: { opacity: 0, y: DISTANCE.small },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.outExpo, delay },
  },
});

const pillarsContainer: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: TIMELINE.pillars, staggerChildren: STAGGER.items } },
};
const pillarItem: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION.base, ease: EASE.outExpo } },
};

/** «24/7», «30+» — слова с цифрами в заголовке выделяются переливающимся градиентом. */
const isAccentWord = (word: string) => /\d/.test(word);

const TITLE_CLASS =
  'max-w-4xl text-balance font-display text-display font-bold leading-[1.05] tracking-tight text-text-primary';
const SUBTITLE_CLASS = 'max-w-2xl text-body text-text-secondary md:text-lg';

export function Hero() {
  const hero = useContent('home', 'hero');
  const tier = useMotionTier();
  const { ready } = useIntro();
  const sectionRef = useRef<HTMLElement>(null);
  const animated = tier !== 'off';
  const state = !animated || ready ? 'visible' : 'hidden';

  // Сцена ухода hero при скролле
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.96]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.7], ['blur(0px)', 'blur(6px)']);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const sceneStyle =
    tier === 'full'
      ? { y: contentY, opacity: contentOpacity, scale: contentScale, filter: contentBlur }
      : tier === 'lite'
        ? { y: contentY, opacity: contentOpacity }
        : undefined;

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-title"
      className="relative -mt-16 flex min-h-[100svh] scroll-mt-20 flex-col items-center justify-center overflow-hidden pb-24 pt-32 md:-mt-20 md:pt-36"
    >
      <HeroBackdrop scrollProgress={scrollYProgress} />

      <Container className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          style={sceneStyle}
          initial={animated ? 'hidden' : false}
          animate={state}
          className="flex flex-col items-center gap-7 md:gap-9"
        >
          {/* Бейдж со «сканирующим» бликом */}
          <motion.div variants={animated ? fadeUp(TIMELINE.badge) : undefined}>
            <span
              lang="en"
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-border bg-bg-surface/60 px-4 py-1.5 text-xs text-text-secondary backdrop-blur-sm sm:text-small"
            >
              <span aria-hidden className="relative flex h-1.5 w-1.5">
                {animated ? (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-secondary opacity-60" />
                ) : null}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-secondary" />
              </span>
              {hero.badge}
              {animated ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-scan bg-gradient-to-r from-transparent via-white/15 to-transparent"
                />
              ) : null}
            </span>
          </motion.div>

          {/* Заголовок — по словам из маски (без opacity: участвует в LCP) */}
          {ready || !animated ? (
            <SplitText
              as="h1"
              id="hero-title"
              text={hero.title}
              mode="mask-up"
              trigger="mount"
              delay={TIMELINE.title}
              accent={isAccentWord}
              accentClassName="text-gradient bg-[length:200%_auto] animate-gradient-pan"
              className={TITLE_CLASS}
            />
          ) : (
            <h1 id="hero-title" className={cn(TITLE_CLASS, 'invisible')}>
              {hero.title}
            </h1>
          )}

          {ready || !animated ? (
            <SplitText
              as="p"
              text={hero.subtitle}
              mode="blur-in"
              trigger="mount"
              delay={TIMELINE.subtitle}
              stagger={0.012}
              duration={DURATION.slow}
              className={SUBTITLE_CLASS}
            />
          ) : (
            <p className={cn(SUBTITLE_CLASS, 'invisible')}>{hero.subtitle}</p>
          )}

          <motion.div
            variants={animated ? fadeUp(TIMELINE.ctas) : undefined}
            className="flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center"
          >
            <Button as={AnchorLink} href="#contact" variant="primary" size="lg">
              {hero.primaryCta}
              <ButtonArrow />
            </Button>
            <Button as={AnchorLink} href="#solutions" variant="ghost" size="lg">
              {hero.secondaryCta}
            </Button>
          </motion.div>

          <motion.nav
            aria-label={hero.pillarsLabel}
            variants={animated ? pillarsContainer : undefined}
          >
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {HERO_PILLARS.map((pillar) => (
                <motion.li key={pillar.key} variants={animated ? pillarItem : undefined}>
                  <AnchorLink
                    href={pillar.href}
                    className="group inline-flex min-h-[40px] items-center gap-2 rounded-full border border-border bg-bg-surface/60 px-4 py-2 text-small text-text-secondary backdrop-blur-sm transition-all duration-200 hover:border-accent-primary/50 hover:text-text-primary hover:shadow-glow"
                  >
                    <Icon
                      name={pillar.icon}
                      size={16}
                      className={cn('text-accent-primary', iconMotionClass(pillar.icon))}
                    />
                    {hero.pillars[pillar.key]}
                  </AnchorLink>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <motion.p
            variants={animated ? fadeUp(TIMELINE.stats) : undefined}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-small text-text-muted"
          >
            {hero.stats.map((stat, index) => (
              <Fragment key={stat}>
                {index > 0 ? (
                  <motion.span
                    aria-hidden
                    className="text-accent-primary"
                    initial={animated ? { opacity: 0, scale: 0 } : false}
                    animate={state === 'visible' ? { opacity: 0.7, scale: 1 } : undefined}
                    transition={{
                      delay: TIMELINE.stats + 0.2 + index * 0.12,
                      duration: DURATION.fast,
                    }}
                  >
                    ·
                  </motion.span>
                ) : null}
                <span>{stat}</span>
              </Fragment>
            ))}
          </motion.p>
        </motion.div>
      </Container>

      {animated ? (
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-text-muted"
          style={{ opacity: hintOpacity }}
          aria-hidden
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: [0, 1, 0], y: [0, 6, 0] } : undefined}
            transition={{
              delay: TIMELINE.scrollHint,
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>
      ) : null}
    </section>
  );
}
