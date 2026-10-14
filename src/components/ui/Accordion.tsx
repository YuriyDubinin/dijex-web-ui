import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useMotionTier } from '@/motion/tier';
import { DISTANCE, DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type Props = {
  items: readonly AccordionItem[];
  /** Разрешить несколько открытых пунктов одновременно. */
  multiple?: boolean;
  defaultOpenIds?: readonly string[];
  /** Уровень заголовков пунктов. */
  headingLevel?: 'h3' | 'h4';
  /** Префикс DOM-id пунктов (например, «faq» → #faq-<id>) — для ссылок на конкретный вопрос. */
  itemIdPrefix?: string;
  className?: string;
};

/** Аккордеон: кнопки-заголовки с aria-expanded, плавное раскрытие по высоте. */
export function Accordion({
  items,
  multiple = false,
  defaultOpenIds = [],
  headingLevel: Heading = 'h3',
  itemIdPrefix,
  className,
}: Props) {
  const baseId = useId();
  const prefersReducedMotion = useMotionTier() === 'off';
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set(defaultOpenIds));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item, index) => {
        const open = openIds.has(item.id);
        const buttonId = `${baseId}-button-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <motion.div
            key={item.id}
            id={itemIdPrefix ? `${itemIdPrefix}-${item.id}` : undefined}
            data-spotlight
            initial={prefersReducedMotion ? false : { opacity: 0, y: DISTANCE.small }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: DURATION.slow,
              ease: EASE.outExpo,
              delay: Math.min(index, 8) * 0.05,
            }}
            className={cn(
              'spotlight relative scroll-mt-28 overflow-hidden rounded-2xl border bg-bg-surface/60 backdrop-blur-sm transition-colors duration-300',
              open ? 'border-accent-primary/40' : 'border-border hover:border-accent-primary/25',
            )}
          >
            {/* Луч по верхней границе при раскрытии */}
            <AnimatePresence>
              {open && !prefersReducedMotion ? (
                <motion.span
                  key="beam"
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-accent-secondary to-transparent"
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: '320%', opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: EASE.inOut }}
                />
              ) : null}
            </AnimatePresence>
            <Heading className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex min-h-[44px] w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-body font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary sm:px-6"
              >
                <span>{item.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                    open
                      ? 'rotate-45 border-accent-primary/50 bg-accent-primary text-white shadow-glow'
                      : 'border-border text-text-secondary',
                  )}
                >
                  <Plus size={16} />
                </span>
              </button>
            </Heading>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : SPRING.soft}
                  className="overflow-hidden"
                >
                  <motion.div
                    className="px-5 pb-5 text-body leading-relaxed text-text-secondary sm:px-6"
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 6, filter: 'blur(6px)' }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: DURATION.base, delay: 0.08 }}
                  >
                    {item.content}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
