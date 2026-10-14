import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnchorLink } from '../AnchorLink';
import { Container } from '../Container';
import { Icon } from '@/components/ui/Icon';
import { LanguageTiles } from '@/components/ui/LanguageSwitcher';
import { HEADER_ANCHORS } from '@/content/nav';
import { SOLUTIONS } from '@/content/solutions';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Кнопка-бургер: из её центра раскрывается меню, она же входит в фокус-ловушку. */
  originRef: RefObject<HTMLButtonElement>;
  activeId: string | null;
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER.items, delayChildren: 0.12 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE.outExpo } },
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Полноэкранное мобильное меню: раскрывается кругом из точки бургера, пункты — каскадом,
 * фокус заперт внутри (вместе с бургером), прокрутка страницы заблокирована, Esc закрывает.
 */
export function MobileMenu({ open, onClose, originRef, activeId }: Props) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const tier = useMotionTier();
  const panelRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState('calc(100% - 2.5rem) 2rem');
  const animated = tier !== 'off';

  // Точка раскрытия — центр бургера
  useEffect(() => {
    if (!open) return;
    const rect = originRef.current?.getBoundingClientRect();
    if (rect) setOrigin(`${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`);
  }, [open, originRef]);

  // Блокировка прокрутки, Esc и фокус-ловушка
  useEffect(() => {
    if (!open) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        originRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = [
        originRef.current,
        ...Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
      ].filter((node): node is HTMLElement => node !== null);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, originRef]);

  // Портал в body: у шапки есть transform, внутри неё fixed позиционировался бы от шапки, а не от экрана
  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          key="mobile-menu"
          className="fixed inset-0 z-30 overflow-y-auto bg-bg-base/95 pt-16 backdrop-blur-xl md:pt-20 lg:hidden"
          initial={animated ? { clipPath: `circle(0px at ${origin})` } : { opacity: 0 }}
          animate={animated ? { clipPath: `circle(150% at ${origin})` } : { opacity: 1 }}
          exit={
            animated
              ? {
                  clipPath: `circle(0px at ${origin})`,
                  transition: { duration: DURATION.slow * 0.7, ease: EASE.inOut },
                }
              : { opacity: 0 }
          }
          transition={{ duration: animated ? DURATION.slow : 0, ease: EASE.outExpo }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-70"
          />
          <Container className="relative pb-10 pt-4">
            <motion.ul
              className="flex flex-col"
              variants={animated ? listVariants : undefined}
              initial="hidden"
              animate="visible"
            >
              <motion.li variants={animated ? itemVariants : undefined}>
                <p className="px-1 pb-2 text-xs font-medium text-text-muted">
                  {t('nav.solutions')}
                </p>
              </motion.li>
              {SOLUTIONS.map((solution) => (
                <motion.li key={solution.key} variants={animated ? itemVariants : undefined}>
                  <Link
                    viewTransition
                    to={solution.path}
                    onClick={onClose}
                    aria-current={pathname === solution.path ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[52px] items-center gap-3 rounded-xl px-1 py-2 font-display text-xl font-semibold transition-colors',
                      pathname === solution.path
                        ? 'text-text-primary'
                        : 'text-text-secondary hover:text-text-primary',
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-primary/25 bg-accent-primary/10 text-accent-primary">
                      <Icon name={solution.icon} size={18} />
                    </span>
                    {t(`solutions.${solution.key}.title`)}
                  </Link>
                </motion.li>
              ))}

              <motion.li variants={animated ? itemVariants : undefined} aria-hidden>
                <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </motion.li>

              {HEADER_ANCHORS.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <motion.li key={item.id} variants={animated ? itemVariants : undefined}>
                    <AnchorLink
                      href={item.href}
                      onNavigate={onClose}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'flex min-h-[52px] items-center gap-3 px-1 font-display text-2xl font-semibold transition-colors',
                        isActive
                          ? 'text-text-primary'
                          : 'text-text-secondary hover:text-text-primary',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'h-1.5 w-1.5 rounded-full transition-colors',
                          isActive ? 'bg-accent-secondary' : 'bg-border',
                        )}
                      />
                      {t(`nav.${item.labelKey}`)}
                    </AnchorLink>
                  </motion.li>
                );
              })}

              <motion.li variants={animated ? itemVariants : undefined} className="mt-6">
                <AnchorLink
                  href="/#contact"
                  onNavigate={onClose}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-accent-primary px-4 py-3 text-body font-semibold text-white shadow-glow transition-colors hover:bg-accent-primary/90"
                >
                  {t('header.cta')}
                </AnchorLink>
              </motion.li>

              <motion.li variants={animated ? itemVariants : undefined}>
                <LanguageTiles
                  onSelected={onClose}
                  className="mt-8 border-t border-border/60 pt-6"
                />
              </motion.li>
            </motion.ul>
          </Container>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
