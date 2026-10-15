import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout/Section';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ButtonArrow } from '@/components/ui/ButtonArrow';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { VisualControlContext } from '@/components/visuals/context';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SOLUTIONS, type SolutionKey } from '@/content/solutions';
import { useContent } from '@/i18n/useContent';
import { DrawCheck } from '@/motion/DrawCheck';
import { Odometer } from '@/motion/Odometer';
import { SpotlightGroup } from '@/motion/Spotlight';
import { Tilt } from '@/motion/Tilt';
import { DISTANCE, DURATION, EASE, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';

/** Цвет «свечения» карточки по направлению. */
const ACCENT: Record<SolutionKey, { glow: 'indigo' | 'cyan'; spot: string; ring: string }> = {
  aiOrchestrator: { glow: 'indigo', spot: '', ring: 'group-hover:shadow-glow' },
  supportAgent: { glow: 'cyan', spot: 'spotlight-cyan', ring: 'group-hover:shadow-glow-cyan' },
  digitalProcesses: {
    glow: 'indigo',
    spot: '[--spot-color:var(--accent-glow)]',
    ring: 'group-hover:shadow-[0_0_60px_-15px_rgb(var(--accent-glow)/0.5)]',
  },
};

const cardVariants: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0% round 16px)', y: DISTANCE.reveal * 1.6 },
  visible: {
    clipPath: 'inset(0% 0% 0% 0% round 16px)',
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE.outExpo },
  },
};

export function Solutions() {
  const { t } = useTranslation();
  const content = useContent('home', 'solutions');
  // Наведённая карточка «в фокусе»: визуалы соседних ставятся на паузу
  const [focused, setFocused] = useState<SolutionKey | null>(null);

  return (
    <Section id="solutions" labelledBy="solutions-title">
      <SectionHeader
        titleId="solutions-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <SpotlightGroup>
        <ScrollReveal
          className="focus-group mt-16 grid gap-6 lg:grid-cols-3"
          staggerChildren={STAGGER.sections}
        >
          {SOLUTIONS.map((solution, index) => {
            const card = content.cards[solution.key];
            const accent = ACCENT[solution.key];
            return (
              <motion.div
                key={solution.key}
                variants={cardVariants}
                className="focus-item h-full"
                onPointerEnter={() => setFocused(solution.key)}
                onPointerLeave={() => setFocused(null)}
              >
                <Tilt className="h-full rounded-2xl">
                  <article
                    data-spotlight
                    className={cn(
                      'spotlight group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface/60 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-accent-primary/40',
                      accent.spot,
                      accent.ring,
                    )}
                  >
                    <div
                      className="overflow-hidden p-3 pb-0"
                      style={{ viewTransitionName: `solution-visual-${solution.key}` }}
                    >
                      <VisualControlContext.Provider
                        value={{
                          paused: focused !== null && focused !== solution.key,
                          // Визуалы трёх карточек стартуют по очереди, а не синхронно
                          startDelay: index * 0.4,
                        }}
                      >
                        <ImageSlot
                          image={solution.cardImage}
                          glow="none"
                          className="transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </VisualControlContext.Provider>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary"
                          style={{ viewTransitionName: `solution-icon-${solution.key}` }}
                        >
                          <Icon
                            name={solution.icon}
                            size={20}
                            className={iconMotionClass(solution.icon)}
                          />
                        </span>
                        <span className="text-gradient font-display text-h2 font-bold">
                          <Odometer value={index + 1} prefix="0" affixClassName="" format={false} />
                        </span>
                      </div>

                      <h3 className="font-display text-h3 font-semibold text-text-primary">
                        {t(`solutions.${solution.key}.title`)}
                      </h3>
                      <p className="text-body leading-relaxed text-text-secondary">
                        {card.description}
                      </p>

                      <ul className="flex flex-col gap-2.5">
                        {card.bullets.map((bullet, bulletIndex) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2.5 text-small text-text-secondary"
                          >
                            <DrawCheck
                              className="mt-0.5 text-accent-secondary"
                              delay={0.3 + bulletIndex * 0.12}
                            />
                            {bullet}
                          </li>
                        ))}
                      </ul>

                      <Link
                        viewTransition
                        to={solution.path}
                        className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3 text-small font-semibold text-accent-primary transition-colors after:absolute after:inset-0 hover:text-accent-secondary"
                      >
                        <span className="link-underline">{content.more}</span>
                        <span className="sr-only">: {t(`solutions.${solution.key}.title`)}</span>
                        <ButtonArrow size={16} />
                      </Link>
                    </div>
                  </article>
                </Tilt>
              </motion.div>
            );
          })}
        </ScrollReveal>
      </SpotlightGroup>
    </Section>
  );
}
