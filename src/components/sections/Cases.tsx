import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Target, TrendingUp, Wrench, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CASES, type CaseDef } from '@/content/home/cases';
import { SOLUTIONS } from '@/content/solutions';
import { useContent } from '@/i18n/useContent';
import { STICKY_SCENE_QUERY, useMediaQuery } from '@/motion/hooks';
import { useMotionTier } from '@/motion/tier';
import { DISTANCE, DURATION, EASE, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';

/** Отступ липких карточек от верха и шаг «лесенки» стопки, px. */
const STICKY_TOP = 96;
const STACK_STEP = 18;

function CaseBlock({
  icon: IconComponent,
  label,
  text,
  delay,
  animated,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
  delay: number;
  animated: boolean;
}) {
  return (
    <motion.div
      className="relative flex gap-3"
      initial={animated ? { opacity: 0, x: -12 } : false}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: DURATION.slow, ease: EASE.outExpo, delay }}
    >
      <span className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-primary/20 bg-bg-elevated text-accent-primary">
        <IconComponent size={15} aria-hidden />
      </span>
      <div>
        <p className="caps-label text-text-muted">{label}</p>
        <p className="mt-1 text-small leading-relaxed text-text-secondary">{text}</p>
      </div>
    </motion.div>
  );
}

function CaseContent({ caseDef, index }: { caseDef: CaseDef; index: number }) {
  const { t } = useTranslation();
  const content = useContent('home', 'cases');
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const item = content.items[caseDef.key];
  const metricLabels = item.metrics as Record<string, string>;
  const reverse = index % 2 === 1;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
      <div className={cn(reverse && 'lg:order-2')}>
        <ImageSlot image={caseDef.image} glow="cyan" />
      </div>

      <div className={cn('flex flex-col gap-5', reverse && 'lg:order-1')}>
        <p className="eyebrow text-accent-secondary">{item.client}</p>
        <h3 className="font-display text-h2 font-bold text-text-primary">{item.title}</h3>
        <p className="text-body leading-relaxed text-text-secondary">{item.summary}</p>

        <div className="relative flex flex-col gap-4 rounded-2xl border border-border bg-bg-base/40 p-5">
          {/* Индикатор прогресса: линия проходит через «Задачу → Решение → Результат» */}
          <motion.span
            aria-hidden
            className="absolute bottom-9 left-[35px] top-9 w-px origin-top bg-gradient-to-b from-accent-primary/60 via-accent-glow/50 to-success/60"
            initial={animated ? { scaleY: 0 } : false}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: DURATION.cinematic, ease: EASE.outExpo, delay: 0.2 }}
          />
          <CaseBlock
            icon={Target}
            label={content.labels.challenge}
            text={item.challenge}
            delay={0.1}
            animated={animated}
          />
          <CaseBlock
            icon={Wrench}
            label={content.labels.solution}
            text={item.solution}
            delay={0.4}
            animated={animated}
          />
          <CaseBlock
            icon={TrendingUp}
            label={content.labels.result}
            text={item.result}
            delay={0.7}
            animated={animated}
          />
        </div>

        {caseDef.metrics.length > 0 ? (
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {caseDef.metrics.map((metric) => (
              <motion.div
                key={metric.key}
                initial={animated ? { opacity: 0, scale: 0.9 } : false}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: DURATION.slow, ease: EASE.outExpo, delay: 0.9 }}
              >
                <dt className="sr-only">{metricLabels[metric.key]}</dt>
                <dd className="text-gradient font-display text-h1 font-bold leading-none drop-shadow-[0_0_18px_rgb(var(--accent-primary)/0.45)]">
                  {metric.value}
                </dd>
                <dd aria-hidden className="mt-1 text-small text-text-secondary">
                  {metricLabels[metric.key]}
                </dd>
              </motion.div>
            ))}
          </dl>
        ) : null}

        <ul className="flex flex-wrap gap-2">
          {caseDef.tags.map((tag, tagIndex) => (
            <motion.li
              key={tag}
              initial={animated ? { opacity: 0, y: 8 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: DURATION.base, delay: 0.8 + tagIndex * STAGGER.items }}
            >
              <Badge>{tag}</Badge>
            </motion.li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <span className="text-xs text-text-muted">{content.labels.related}:</span>
          {caseDef.solutions.map((key) => {
            const solution = SOLUTIONS.find((candidate) => candidate.key === key);
            if (!solution) return null;
            return (
              <Link
                viewTransition
                key={key}
                to={solution.path}
                className="relative isolate overflow-hidden rounded-full border border-accent-primary/30 bg-accent-primary/10 px-3 py-1 text-xs font-medium text-accent-primary transition-colors duration-300 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-gradient-to-r before:from-accent-primary before:to-accent-secondary before:transition-transform before:duration-500 hover:text-white hover:before:scale-x-100"
              >
                {t(`solutions.${key}.title`)}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Липкая карточка стопки: уменьшается и темнеет, когда сверху наезжают следующие. */
function StackedCase({
  caseDef,
  index,
  total,
  progress,
}: {
  caseDef: CaseDef;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const targetScale = 1 - (total - 1 - index) * 0.04;
  const scale = useTransform(progress, [start, 1], [1, targetScale]);
  const brightness = useTransform(progress, [start, 1], [1, index === total - 1 ? 1 : 0.55]);
  const filter = useTransform(brightness, (value) => `brightness(${value})`);

  return (
    <div className="sticky" style={{ top: STICKY_TOP + index * STACK_STEP }}>
      <motion.article
        style={{ scale, filter, transformOrigin: 'top center' }}
        className="rounded-3xl border border-border bg-bg-elevated p-8 shadow-[0_-20px_60px_-30px_rgb(0_0_0/0.8)] xl:p-10"
      >
        <CaseContent caseDef={caseDef} index={index} />
      </motion.article>
    </div>
  );
}

function CasesStack() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <div ref={ref} className="relative mt-16 flex flex-col gap-[30vh] md:mt-20">
      {CASES.map((caseDef, index) => (
        <StackedCase
          key={caseDef.key}
          caseDef={caseDef}
          index={index}
          total={CASES.length}
          progress={scrollYProgress}
        />
      ))}
    </div>
  );
}

function CasesFlow() {
  const animated = useMotionTier() !== 'off';
  return (
    <div className="mt-16 flex flex-col gap-20 md:mt-20 md:gap-28">
      {CASES.map((caseDef, index) => (
        <motion.article
          key={caseDef.key}
          initial={animated ? { clipPath: 'inset(100% 0% 0% 0%)', y: DISTANCE.reveal } : false}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: DURATION.reveal, ease: EASE.outExpo }}
        >
          <CaseContent caseDef={caseDef} index={index} />
        </motion.article>
      ))}
    </div>
  );
}

export function Cases() {
  const content = useContent('home', 'cases');
  const tier = useMotionTier();
  const desktop = useMediaQuery(STICKY_SCENE_QUERY);

  return (
    <Section id="cases" labelledBy="cases-title" divider>
      <SectionHeader
        titleId="cases-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />
      {tier === 'full' && desktop ? <CasesStack /> : <CasesFlow />}
    </Section>
  );
}
