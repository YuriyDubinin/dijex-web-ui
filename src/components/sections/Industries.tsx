import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { waveItemVariants } from '@/components/motion/variants';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { INDUSTRIES } from '@/content/home/industries';
import { useContent } from '@/i18n/useContent';
import { usePointerFine } from '@/motion/hooks';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useMotionTier } from '@/motion/tier';
import { gridRadialDelay } from '@/motion/tokens';
import { cn } from '@/lib/cn';

const COLUMNS = 4;
const ROWS = Math.ceil(INDUSTRIES.length / COLUMNS);

/**
 * На тач-устройствах нет hover: «активной» становится карточка, пересекающая центр экрана.
 * Возвращает ключи активных карточек.
 */
function useCenterActive(enabled: boolean) {
  const refs = useRef(new Map<string, HTMLElement>());
  const [active, setActive] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        setActive((previous) => {
          const next = new Set(previous);
          for (const entry of entries) {
            const key = (entry.target as HTMLElement).dataset.key ?? '';
            if (entry.isIntersecting) next.add(key);
            else next.delete(key);
          }
          return next;
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [enabled]);

  const register = (key: string) => (node: HTMLElement | null) => {
    if (node) refs.current.set(key, node);
    else refs.current.delete(key);
  };

  return { active, register };
}

export function Industries() {
  const content = useContent('home', 'industries');
  const tier = useMotionTier();
  const pointerFine = usePointerFine();
  const touchActive = tier !== 'off' && !pointerFine;
  const { active, register } = useCenterActive(touchActive);

  return (
    <Section id="industries" labelledBy="industries-title" divider>
      <SectionHeader
        titleId="industries-title"
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
      />

      <SpotlightGroup>
        <ScrollReveal className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map((industry, index) => {
            const item = content.items[industry.key];
            const isActive = active.has(industry.key);
            return (
              <motion.article
                key={industry.key}
                ref={register(industry.key)}
                data-key={industry.key}
                data-spotlight
                variants={waveItemVariants}
                custom={gridRadialDelay(index, COLUMNS, ROWS)}
                className={cn(
                  'spotlight spotlight-cyan group flex h-full flex-col gap-4 rounded-2xl border bg-bg-surface/60 p-5 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-accent-secondary/40 hover:shadow-glow-cyan',
                  isActive ? 'border-accent-secondary/40 shadow-glow-cyan' : 'border-border',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-secondary/20 bg-accent-secondary/10 text-accent-secondary transition-transform duration-300 group-hover:scale-105">
                    <Icon
                      name={industry.icon}
                      size={18}
                      className={iconMotionClass(industry.icon)}
                    />
                  </span>
                  <h3 className="font-display text-lg font-semibold leading-snug text-text-primary">
                    {item.title}
                  </h3>
                </div>
                <ul className="flex flex-col gap-2">
                  {item.tasks.map((task, taskIndex) => (
                    <li
                      key={task}
                      className="flex items-start gap-2.5 text-small text-text-secondary"
                    >
                      {/* Маркеры загораются по очереди при наведении */}
                      <span
                        aria-hidden
                        className={cn(
                          'mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-secondary/40 transition-[background-color,box-shadow] duration-300 group-hover:bg-accent-secondary group-hover:shadow-[0_0_8px_2px_rgb(var(--accent-secondary)/0.6)]',
                          isActive &&
                            'bg-accent-secondary shadow-[0_0_8px_2px_rgb(var(--accent-secondary)/0.6)]',
                        )}
                        style={{ transitionDelay: `${taskIndex * 90}ms` }}
                      />
                      {task}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </ScrollReveal>
      </SpotlightGroup>
    </Section>
  );
}
