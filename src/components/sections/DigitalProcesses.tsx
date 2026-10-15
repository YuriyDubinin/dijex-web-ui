import { useEffect, type ReactNode } from 'react';
import { motion, useSpring, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { ButtonArrow } from '@/components/ui/ButtonArrow';
import { VisualSlot } from '@/components/ui/VisualSlot';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Tabs } from '@/components/ui/Tabs';
import { PROCESS_TABS, type ProcessTabKey } from '@/content/home/processes';
import { VISUAL_SLOTS } from '@/content/visualSlots';
import { preloadVisual } from '@/components/visuals/registry';
import { useContent } from '@/i18n/useContent';
import { DrawCheck } from '@/motion/DrawCheck';
import { usePointerFine } from '@/motion/hooks';
import { useMotionTier } from '@/motion/tier';
import { DISTANCE, DURATION, EASE, SPRING_VALUE, STAGGER } from '@/motion/tokens';

const cascade: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.items, delayChildren: 0.05 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: DISTANCE.small },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE.outExpo } },
};

/** Мини-график для плашки «Результат»: линия прорисовывается при появлении. */
function GrowthSpark({ animated }: { animated: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-success">
      <motion.polyline
        points="3 17 9 11 13 14 21 6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0 } : false}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: DURATION.reveal, ease: EASE.outExpo, delay: 0.4 }}
      />
      <motion.polyline
        points="15 6 21 6 21 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { opacity: 0 } : false}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.1 }}
      />
    </svg>
  );
}

/** Визуал направления с лёгким параллаксом за курсором (только full + мышь). */
function PointerParallax({ children }: { children: ReactNode }) {
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const x = useSpring(0, SPRING_VALUE.soft);
  const y = useSpring(0, SPRING_VALUE.soft);
  const enabled = tier === 'full' && pointerFine;

  return (
    <motion.div
      style={enabled ? { x, y } : undefined}
      onPointerMove={(event) => {
        if (!enabled) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width - 0.5) * 16);
        y.set(((event.clientY - rect.top) / rect.height - 0.5) * 16);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Содержимое направления: описание, что делаем, примеры, результат. Используется и на странице решения. */
export function ProcessDirection({
  tabKey,
  headingLevel = 'h3',
}: {
  tabKey: ProcessTabKey;
  headingLevel?: 'h3' | 'h4';
}) {
  const content = useContent('home', 'processes');
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const tab = content.tabs[tabKey];
  const definition = PROCESS_TABS.find((item) => item.key === tabKey);
  const Heading = headingLevel;

  // Визуалы соседних вкладок подгружаются заранее — при переключении сцена не мигает скелетом
  useEffect(() => {
    for (const item of PROCESS_TABS) {
      preloadVisual(VISUAL_SLOTS[item.visual]);
    }
  }, []);
  const motionProps = animated
    ? {
        variants: cascade,
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, amount: 0.2 },
      }
    : {};

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
      <motion.div className="flex flex-col gap-7" {...motionProps}>
        <motion.p
          variants={animated ? rise : undefined}
          className="text-body leading-relaxed text-text-secondary md:text-lg"
        >
          {tab.description}
        </motion.p>

        <motion.div variants={animated ? rise : undefined}>
          <Heading className="caps-label text-text-muted">{content.labels.whatWeDo}</Heading>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {tab.whatWeDo.map((item, index) => (
              <li key={item} className="flex items-start gap-2.5 text-small text-text-secondary">
                <DrawCheck className="mt-0.5 text-accent-primary" delay={0.15 + index * 0.08} />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={animated ? rise : undefined}>
          <Heading className="caps-label text-text-muted">{content.labels.examples}</Heading>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {tab.examples.map((example, index) => (
              <motion.li
                key={example.title}
                initial={animated ? { opacity: 0, y: 12, scale: 0.97 } : false}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: DURATION.slow,
                  ease: EASE.outExpo,
                  delay: 0.25 + index * STAGGER.cards,
                }}
                className="rounded-xl border border-border/70 bg-bg-base/40 p-3.5 transition-colors hover:border-accent-primary/40"
              >
                <p className="text-small font-semibold text-text-primary">{example.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {example.description}
                </p>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.p
          variants={animated ? rise : undefined}
          className="flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 p-3.5 text-small text-text-primary shadow-[0_0_40px_-18px_rgb(var(--success)/0.7)]"
        >
          <GrowthSpark animated={animated} />
          <span>
            <span className="font-semibold text-success">{content.labels.result}: </span>
            {tab.result}
          </span>
        </motion.p>
      </motion.div>

      {definition ? (
        <PointerParallax>
          <VisualSlot slot={definition.visual} />
        </PointerParallax>
      ) : null}
    </div>
  );
}

export function DigitalProcesses() {
  const content = useContent('home', 'processes');

  return (
    <Section id="processes" labelledBy="processes-title" divider>
      <SectionHeader
        titleId="processes-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <Tabs
        className="mt-14"
        label={content.tabsLabel}
        items={PROCESS_TABS.map((tab) => ({
          id: tab.key,
          label: content.tabs[tab.key].tab,
          icon: tab.icon,
        }))}
        renderPanel={(id) => <ProcessDirection tabKey={id} />}
      />

      <div className="mt-14 flex justify-center">
        <Button as={Link} viewTransition to="/solutions/digital-processes" variant="ghost">
          {content.cta}
          <ButtonArrow />
        </Button>
      </div>
    </Section>
  );
}
