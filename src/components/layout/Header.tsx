import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from './Container';
import { AnchorLink } from './AnchorLink';
import { BurgerIcon } from './header/BurgerIcon';
import { MobileMenu } from './header/MobileMenu';
import { SolutionsMenu } from './header/SolutionsMenu';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { HEADER_ANCHORS, SOLUTION_SECTION_IDS } from '@/content/nav';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useIntro } from '@/motion/intro';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, SPRING, SPRING_VALUE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

const SPY_IDS = [...SOLUTION_SECTION_IDS, ...HEADER_ANCHORS.map((item) => item.id)];
/** Диапазон скролла, за который шапка «уплотняется». */
const MORPH_DISTANCE = 80;
/** Скорость скролла вниз (px/с), при которой шапка уезжает. */
const HIDE_VELOCITY = 600;

const navItemClass = (active: boolean) =>
  cn(
    'relative rounded-lg px-2.5 py-2 text-small font-medium transition-colors duration-200 xl:px-3',
    active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
  );

/**
 * Подложки пунктов навигации — общие layoutId, поэтому «переезжают» между пунктами:
 * активная пилюля с градиентным подчёркиванием и «призрачная» за курсором.
 */
function NavIndicator({ active, hovered }: { active: boolean; hovered: boolean }) {
  return (
    <>
      {hovered && !active ? (
        <motion.span
          layoutId="nav-hover"
          aria-hidden
          className="absolute inset-0 rounded-lg bg-bg-surface/50"
          transition={SPRING.snappy}
        />
      ) : null}
      {active ? (
        <motion.span
          layoutId="nav-active"
          aria-hidden
          className="absolute inset-0 rounded-lg bg-bg-surface/80"
          transition={SPRING.snappy}
        >
          <span className="absolute inset-x-2.5 bottom-1 h-px bg-gradient-to-r from-accent-primary to-accent-secondary xl:inset-x-3" />
        </motion.span>
      ) : null}
    </>
  );
}

export function Header() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const tier = useMotionTier();
  const { playing } = useIntro();
  const activeId = useScrollSpy(SPY_IDS, { offset: 80 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const animated = tier !== 'off';

  const solutionsActive =
    pathname.startsWith('/solutions/') ||
    (activeId !== null && (SOLUTION_SECTION_IDS as readonly string[]).includes(activeId));

  useEffect(() => setMenuOpen(false), [pathname]);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Морфинг при скролле — только motion values, без ререндеров на каждый пиксель
  const { scrollY, scrollYProgress } = useScroll();
  const morph = useTransform(scrollY, [0, MORPH_DISTANCE], [0, 1]);
  const backdropOpacity = morph;
  const backdropScale = useTransform(morph, [0, 1], [1, 0.8]);
  const contentY = useTransform(morph, [0, 1], [0, -8]);
  const logoScale = useTransform(morph, [0, 1], [1, 0.86]);
  const progress = useSpring(scrollYProgress, SPRING_VALUE.soft);
  const progressTip = useTransform(progress, (value) => `${value * 100}%`);

  // Шапка уезжает при быстром скролле вниз ниже первого экрана и возвращается при скролле вверх
  useMotionValueEvent(scrollY, 'change', (current) => {
    if (!animated) return;
    const previous = scrollY.getPrevious() ?? current;
    const velocity = scrollY.getVelocity();
    const focusInside = headerRef.current?.contains(document.activeElement) ?? false;
    if (menuOpen || focusInside || current < window.innerHeight) {
      setHidden(false);
    } else if (current > previous && velocity > HIDE_VELOCITY) {
      setHidden(true);
    } else if (current < previous) {
      setHidden(false);
    }
  });

  const full = tier === 'full';

  return (
    <motion.header
      ref={headerRef}
      className="sticky top-0 z-40 w-full [view-transition-name:site-header]"
      initial={animated ? { y: '-100%' } : false}
      animate={{ y: (playing && animated) || hidden ? '-100%' : '0%' }}
      transition={{ duration: hidden ? DURATION.base : DURATION.slow, ease: EASE.outExpo }}
      onFocusCapture={() => setHidden(false)}
    >
      {/* Фон: проявляется и «уплотняется» при скролле */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-top border-b border-border bg-bg-base/80 backdrop-blur-md"
        style={{ opacity: menuOpen ? 1 : backdropOpacity, scaleY: full ? backdropScale : 1 }}
      />

      <motion.div style={{ y: full ? contentY : 0 }} className="relative">
        <Container className="flex h-16 items-center justify-between gap-4 md:h-20">
          <motion.div style={{ scale: full ? logoScale : 1 }} className="origin-left">
            <AnchorLink
              href="/#hero"
              className="font-display text-xl font-bold tracking-tight text-text-primary hover:text-text-primary/90 md:text-2xl"
              aria-label={t('header.homeLink')}
            >
              {t('brand')}
            </AnchorLink>
          </motion.div>

          <LayoutGroup id="header-nav">
            <nav
              className="hidden items-center gap-0.5 lg:flex"
              aria-label={t('header.mainNav')}
              onPointerLeave={() => setHoveredId(null)}
            >
              <SolutionsMenu
                active={solutionsActive}
                hovered={hoveredId === 'solutions'}
                onHover={() => setHoveredId('solutions')}
                className={navItemClass(solutionsActive)}
                renderIndicator={(active, hovered) => (
                  <NavIndicator active={active} hovered={hovered} />
                )}
              />
              {HEADER_ANCHORS.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <AnchorLink
                    key={item.id}
                    href={item.href}
                    aria-current={isActive ? 'true' : undefined}
                    onPointerEnter={() => setHoveredId(item.id)}
                    className={navItemClass(isActive)}
                  >
                    <NavIndicator active={isActive} hovered={hoveredId === item.id} />
                    <span className="relative">{t(`nav.${item.labelKey}`)}</span>
                  </AnchorLink>
                );
              })}
            </nav>
          </LayoutGroup>

          <div className="flex items-center gap-2">
            <LanguageSwitcher showRegionHint className="hidden sm:block" />
            <AnchorLink
              href="/#contact"
              className="hidden items-center justify-center whitespace-nowrap rounded-xl border border-border bg-bg-surface/60 px-4 py-2 text-small font-semibold text-text-primary backdrop-blur-sm transition-all hover:border-accent-primary/60 hover:bg-bg-surface hover:shadow-glow lg:inline-flex"
            >
              {t('header.cta')}
            </AnchorLink>

            <button
              ref={burgerRef}
              type="button"
              className="relative z-40 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-bg-surface/60 text-text-primary backdrop-blur-sm lg:hidden"
              aria-label={menuOpen ? t('header.closeMenu') : t('header.openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <BurgerIcon open={menuOpen} />
            </button>
          </div>
        </Container>
      </motion.div>

      {/* Прогресс чтения страницы со светящимся кончиком */}
      {animated ? (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-accent-primary to-accent-secondary"
            style={{ scaleX: progress }}
          />
          <motion.span
            className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-secondary shadow-[0_0_10px_2px_rgb(var(--accent-secondary)/0.7)]"
            style={{ left: progressTip }}
          />
        </div>
      ) : null}

      <MobileMenu open={menuOpen} onClose={closeMenu} originRef={burgerRef} activeId={activeId} />
    </motion.header>
  );
}
