import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Icon } from './Icon';
import type { IconKey } from './iconMap';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';

export type TabItem<T extends string = string> = {
  id: T;
  label: string;
  icon?: IconKey;
};

type Props<T extends string> = {
  items: readonly TabItem<T>[];
  /** Доступное имя списка вкладок. */
  label: string;
  renderPanel: (id: T) => ReactNode;
  defaultId?: T;
  className?: string;
};

/** Смена панели «по направлению»: вправо — контент уезжает влево, новый приходит справа. */
const panelVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 32, filter: 'blur(6px)' }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION.slow, ease: EASE.outExpo },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -24,
    filter: 'blur(6px)',
    transition: { duration: DURATION.fast, ease: EASE.sharp },
  }),
};

/**
 * Доступные вкладки (WAI-ARIA Tabs, автоматическая активация): ←/→, Home/End.
 * Подложка активной вкладки переезжает пружиной и растягивается по ходу движения;
 * панели сменяются по направлению. На узких экранах ряд вкладок прокручивается, активная — в центре.
 */
export function Tabs<T extends string>({
  items,
  label,
  renderPanel,
  defaultId,
  className,
}: Props<T>) {
  const baseId = useId();
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const [activeId, setActiveId] = useState<T | undefined>(defaultId ?? items[0]?.id);
  const [direction, setDirection] = useState(1);
  const tabRefs = useRef(new Map<T, HTMLButtonElement>());

  const tabId = (id: T) => `${baseId}-tab-${id}`;
  const panelId = (id: T) => `${baseId}-panel-${id}`;
  const activeIndex = items.findIndex((item) => item.id === activeId);

  const activate = (id: T, focus = false) => {
    const nextIndex = items.findIndex((item) => item.id === id);
    setDirection(nextIndex >= activeIndex ? 1 : -1);
    setActiveId(id);
    const node = tabRefs.current.get(id);
    if (focus) node?.focus();
    node?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: animated ? 'smooth' : 'auto',
    });
  };

  const focusTab = (index: number) => {
    const item = items[(index + items.length) % items.length];
    if (item) activate(item.id, true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keyActions: Record<string, () => void> = {
      ArrowRight: () => focusTab(index + 1),
      ArrowLeft: () => focusTab(index - 1),
      Home: () => focusTab(0),
      End: () => focusTab(items.length - 1),
    };
    const action = keyActions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  return (
    <div className={className}>
      <div className="no-scrollbar -mx-4 snap-x overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label={label}
          className="mx-auto flex w-max gap-1 rounded-2xl border border-border bg-bg-surface/60 p-1.5 backdrop-blur-sm"
        >
          {items.map((item, index) => {
            const selected = item.id === activeId;
            return (
              <button
                key={item.id}
                ref={(node) => {
                  if (node) tabRefs.current.set(item.id, node);
                  else tabRefs.current.delete(item.id);
                }}
                type="button"
                role="tab"
                id={tabId(item.id)}
                aria-selected={selected}
                aria-controls={panelId(item.id)}
                tabIndex={selected ? 0 : -1}
                onClick={() => activate(item.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  'group relative inline-flex min-h-[44px] snap-center items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-small font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
                  selected ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {selected ? (
                  <motion.span
                    layoutId={`${baseId}-active`}
                    aria-hidden
                    className="absolute inset-0 rounded-xl border border-accent-primary/30 bg-accent-primary/10"
                    transition={animated ? SPRING.snappy : { duration: 0 }}
                  >
                    <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-accent-primary to-accent-secondary" />
                  </motion.span>
                ) : null}
                {item.icon ? (
                  <Icon
                    name={item.icon}
                    size={16}
                    className={cn('relative transition-colors', selected && 'text-accent-primary')}
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        layout={animated ? 'size' : false}
        className="relative mt-10"
        transition={SPRING.soft}
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {activeId === undefined ? null : (
            <motion.div
              key={activeId}
              role="tabpanel"
              id={panelId(activeId)}
              aria-labelledby={tabId(activeId)}
              tabIndex={0}
              custom={direction}
              variants={animated ? panelVariants : undefined}
              initial={animated ? 'enter' : false}
              animate="center"
              exit="exit"
              className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60"
            >
              {renderPanel(activeId)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
