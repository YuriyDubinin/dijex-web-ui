import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { iconMotionClass } from '@/components/ui/iconMotion';
import { SOLUTIONS } from '@/content/solutions';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';

const panelVariants: Variants = {
  hidden: { clipPath: 'inset(0% 0% 100% 0% round 16px)', y: -6, opacity: 0 },
  visible: {
    clipPath: 'inset(0% 0% 0% 0% round 16px)',
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATION.base,
      ease: EASE.outExpo,
      staggerChildren: STAGGER.items,
      delayChildren: 0.06,
    },
  },
  exit: {
    clipPath: 'inset(0% 0% 100% 0% round 16px)',
    y: -6,
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASE.sharp },
  },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATION.base, ease: EASE.outExpo } },
};

type Props = {
  /** Активен ли пункт (секция решений в viewport или страница решения). */
  active: boolean;
  /** Отрисовать подложку активного пункта (общий layoutId навигации). */
  renderIndicator: (active: boolean, hovered: boolean) => React.ReactNode;
  onHover: () => void;
  hovered: boolean;
  className: string;
};

/** Выпадающее меню «Решения»: hover на десктопе + клик/клавиатура (↓ открывает, ↑/↓ — по пунктам, Esc — закрыть). */
export function SolutionsMenu({ active, renderIndicator, onHover, hovered, className }: Props) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const tier = useMotionTier();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hoverTimer = useRef<number>();
  const animated = tier !== 'off';

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const focusLink = (index: number) => {
    const count = SOLUTIONS.length;
    linkRefs.current[(index + count) % count]?.focus();
  };

  const onButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusLink(0));
    }
  };

  const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const index = linkRefs.current.findIndex((node) => node === document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusLink(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusLink(index - 1);
    }
  };

  const hoverOpen = (next: boolean) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(next), next ? 80 : 160);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(event) => {
        onHover();
        if (event.pointerType === 'mouse') hoverOpen(true);
      }}
      onPointerLeave={(event) => event.pointerType === 'mouse' && hoverOpen(false)}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="solutions-menu"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKeyDown}
        className={cn(
          className,
          'inline-flex items-center gap-1',
          (active || open) && 'text-text-primary',
        )}
      >
        {renderIndicator(active, hovered)}
        <span className="relative">{t('nav.solutions')}</span>
        <ChevronDown
          size={14}
          aria-hidden
          className={cn('relative transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="solutions-menu"
            key="solutions-menu"
            onKeyDown={onPanelKeyDown}
            variants={animated ? panelVariants : undefined}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ x: '-50%' }}
            className="absolute left-1/2 top-full z-50 w-[22rem] pt-2"
          >
            <SpotlightGroup className="rounded-2xl border border-border bg-bg-elevated p-2 shadow-glow">
              <p className="px-3 pb-1 pt-2 text-xs font-medium text-text-muted">
                {t('header.solutionsMenu')}
              </p>
              <ul className="flex flex-col gap-0.5">
                {SOLUTIONS.map((solution, index) => {
                  const current = pathname === solution.path;
                  return (
                    <motion.li key={solution.key} variants={animated ? itemVariants : undefined}>
                      <Link
                        viewTransition
                        ref={(node) => {
                          linkRefs.current[index] = node;
                        }}
                        to={solution.path}
                        aria-current={current ? 'page' : undefined}
                        data-spotlight
                        className={cn(
                          'spotlight group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-bg-surface focus-visible:bg-bg-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent-primary/40',
                          current && 'bg-accent-primary/10',
                        )}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
                          <Icon
                            name={solution.icon}
                            size={18}
                            className={iconMotionClass(solution.icon)}
                          />
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="text-small font-semibold text-text-primary">
                            {t(`solutions.${solution.key}.title`)}
                          </span>
                          <span className="text-xs leading-snug text-text-muted">
                            {t(`solutions.${solution.key}.description`)}
                          </span>
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </SpotlightGroup>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
