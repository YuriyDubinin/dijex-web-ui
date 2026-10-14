import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { AnchorLink } from '@/components/layout/AnchorLink';
import { Button } from '@/components/ui/Button';
import { ButtonArrow } from '@/components/ui/ButtonArrow';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ENGAGEMENT_MODELS } from '@/content/home/engagement';
import type { ContactRouteState } from '@/content/contact';
import { useContent } from '@/i18n/useContent';
import { DrawCheck } from '@/motion/DrawCheck';
import { useActiveInViewport } from '@/motion/hooks';
import { SpotlightGroup } from '@/motion/Spotlight';
import { Tilt } from '@/motion/Tilt';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

/** Откуда въезжает карточка: боковые — с боков, центральная (featured) — снизу и чуть позже. */
const ENTRANCE = [
  { x: -40, y: 0, delay: 0 },
  { x: 0, y: 40, delay: 0.15 },
  { x: 40, y: 0, delay: 0 },
] as const;

export function Engagement() {
  const content = useContent('home', 'engagement');
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const gridRef = useRef<HTMLDivElement>(null);
  const active = useActiveInViewport(gridRef);

  return (
    <Section id="engagement" labelledBy="engagement-title" divider>
      <SectionHeader
        titleId="engagement-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <SpotlightGroup>
        <div ref={gridRef} className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {ENGAGEMENT_MODELS.map((model, index) => {
            const item = content.items[model.key];
            const state: ContactRouteState = { subjectKey: model.subjectKey };
            const entrance = ENTRANCE[index] ?? ENTRANCE[0];

            const card = (
              <article
                data-spotlight={model.featured ? undefined : true}
                className={cn(
                  'group relative flex h-full flex-col gap-5 rounded-2xl border p-7 backdrop-blur-sm transition-[border-color,box-shadow] duration-300',
                  model.featured
                    ? cn(
                        'conic-border border-transparent bg-bg-elevated/90 shadow-glow lg:py-10',
                        (!active || !animated) && 'is-paused',
                      )
                    : 'spotlight border-border bg-bg-surface/60 hover:-translate-y-1 hover:border-accent-primary/40 hover:shadow-glow',
                )}
              >
                {model.featured ? (
                  <span className="absolute -top-3 left-7 overflow-hidden rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-glow">
                    {content.popular}
                    {animated ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-1/2 animate-scan bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      />
                    ) : null}
                  </span>
                ) : null}
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl border',
                    model.featured
                      ? 'border-transparent bg-brand-gradient text-white'
                      : 'border-accent-primary/20 bg-accent-primary/10 text-accent-primary',
                  )}
                >
                  <Icon name={model.icon} size={22} className={iconMotionClass(model.icon)} />
                </span>
                <div>
                  <h3 className="font-display text-h3 font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-body text-text-secondary">{item.description}</p>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {item.points.map((point, pointIndex) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-small text-text-secondary"
                    >
                      <DrawCheck
                        className="mt-0.5 text-accent-secondary"
                        delay={0.4 + entrance.delay + pointIndex * 0.1}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
                <Button
                  as={AnchorLink}
                  href="/#contact"
                  state={state}
                  variant={model.featured ? 'primary' : 'ghost'}
                  className="mt-auto w-full"
                >
                  {item.cta}
                  <ButtonArrow />
                </Button>
              </article>
            );

            return (
              <motion.div
                key={model.key}
                className={cn('h-full', model.featured && 'lg:-my-3')}
                initial={animated ? { opacity: 0, x: entrance.x, y: entrance.y } : false}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: DURATION.reveal,
                  ease: EASE.outExpo,
                  delay: entrance.delay,
                }}
              >
                {model.featured ? (
                  <Tilt max={4} className="h-full rounded-2xl">
                    {card}
                  </Tilt>
                ) : (
                  card
                )}
              </motion.div>
            );
          })}
        </div>
      </SpotlightGroup>
    </Section>
  );
}
