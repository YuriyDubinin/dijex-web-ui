import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Section } from '@/components/layout/Section';
import { FadeIn } from '@/components/motion/FadeIn';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { waveItemVariants } from '@/components/motion/variants';
import { AgentCore } from '@/components/agent/AgentCore';
import { Button } from '@/components/ui/Button';
import { ButtonArrow } from '@/components/ui/ButtonArrow';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ChatDemo, type ChatActivity } from './ChatDemo';
import { ChannelGrid } from './ChannelGrid';
import { SUPPORT_FEATURES } from '@/content/home/support';
import { useContent } from '@/i18n/useContent';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useMotionTier } from '@/motion/tier';
import { gridWaveDelay } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type StickerPosition = 'topLeft' | 'right' | 'bottomLeft';

const STICKER_CLASSES: Record<StickerPosition, string> = {
  topLeft: 'left-0 top-8 sm:-left-2',
  right: 'right-0 top-1/2 sm:-right-2',
  bottomLeft: 'bottom-10 left-4 sm:left-2',
};

function Sticker({
  children,
  position,
  delay,
}: {
  children: string;
  position: StickerPosition;
  delay: string;
}) {
  return (
    <span
      className={cn(
        'absolute z-10 animate-float whitespace-nowrap rounded-xl border border-border bg-bg-elevated/90 px-3 py-2 text-small font-semibold text-text-primary shadow-glow backdrop-blur-md',
        STICKER_CLASSES[position],
      )}
      style={{ animationDelay: delay }}
    >
      {children}
    </span>
  );
}

export function SupportAgent() {
  const content = useContent('home', 'support');
  const tier = useMotionTier();
  const [activity, setActivity] = useState<ChatActivity | null>(null);
  const [hoverChannel, setHoverChannel] = useState<string | null>(null);
  const onActivity = useCallback((next: ChatActivity) => setActivity(next), []);

  return (
    <Section id="support" labelledBy="support-title" divider>
      <SectionHeader
        titleId="support-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
        tone="secondary"
      />

      <div className="mt-16 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <FadeIn>
          <ChatDemo onActivity={onActivity} />
        </FadeIn>
        <FadeIn
          delay={0.15}
          variant="scale-in"
          className="relative mx-auto w-full max-w-sm lg:max-w-none"
        >
          <AgentCore pulseKey={activity?.key} activeChannel={hoverChannel ?? activity?.channel} />
          <Sticker position="topLeft" delay="0s">
            {content.stickers.response}
          </Sticker>
          <Sticker position="right" delay="1.2s">
            {content.stickers.always}
          </Sticker>
          <Sticker position="bottomLeft" delay="2.4s">
            {content.stickers.languages}
          </Sticker>
        </FadeIn>
      </div>

      <div className="mt-20">
        <h3 className="mb-6 text-center font-display text-h3 font-semibold text-text-primary">
          {content.channels.title}
        </h3>
        <ChannelGrid onHoverChannel={setHoverChannel} />
      </div>

      <div className="mt-20">
        <h3 className="mb-6 text-center font-display text-h3 font-semibold text-text-primary">
          {content.featuresTitle}
        </h3>
        <SpotlightGroup>
          <ScrollReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.key}
                variants={waveItemVariants}
                custom={gridWaveDelay(index, 4)}
                data-spotlight
                className="spotlight spotlight-cyan group flex gap-3 rounded-2xl border border-border bg-bg-surface/60 p-4 backdrop-blur-sm transition-colors hover:border-accent-secondary/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-secondary/25 bg-accent-secondary/10 text-accent-secondary">
                  <Icon name={feature.icon} size={16} className={iconMotionClass(feature.icon)} />
                </span>
                <div>
                  <p className="text-small font-semibold text-text-primary">
                    {content.features[feature.key].title}
                  </p>
                  <p className="mt-1 text-small text-text-secondary">
                    {content.features[feature.key].description}
                  </p>
                </div>
              </motion.div>
            ))}
          </ScrollReveal>
        </SpotlightGroup>
      </div>

      <FadeIn className="mt-16 flex flex-col items-center gap-6">
        <h3 className="caps-label text-text-muted">{content.scenariosTitle}</h3>
        <ul className="flex max-w-4xl flex-wrap justify-center gap-2">
          {content.scenarios.map((scenario, index) => (
            <li
              key={scenario}
              className={cn(
                'rounded-full border border-border bg-bg-surface/60 px-4 py-2 text-small text-text-secondary',
                // «Бегущая» подсветка проходит по чипам слева направо
                tier === 'full' &&
                  'animate-[chip-sweep_5s_ease-in-out_infinite] bg-[linear-gradient(110deg,transparent_35%,rgb(var(--accent-secondary)/0.18)_50%,transparent_65%)] bg-[length:250%_100%]',
              )}
              style={tier === 'full' ? { animationDelay: `${index * 0.12}s` } : undefined}
            >
              {scenario}
            </li>
          ))}
        </ul>
        <Button
          as={Link}
          viewTransition
          to="/solutions/support-agent"
          variant="ghost"
          className="mt-4"
        >
          {content.cta}
          <ButtonArrow />
        </Button>
      </FadeIn>
    </Section>
  );
}
