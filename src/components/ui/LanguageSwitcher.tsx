import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flag } from './Flag';
import { LOCALE_HINT_STORAGE_KEY, LOCALE_META, SWITCHER_ORDER, type Locale } from '@/i18n/config';
import { getInitialDetection } from '@/i18n/i18n';
import { useLocale } from '@/i18n/useLocale';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Variant = 'header' | 'inline';

type Props = {
  /** header — компактный триггер с кодом языка; inline — флаг и название, панель открывается вверх (футер). */
  variant?: Variant;
  /** Показывать одноразовую подсказку о языке, выбранном автоматически по региону. */
  showRegionHint?: boolean;
  className?: string;
};

const HINT_TIMEOUT_MS = 12000;

/** Нужна ли подсказка: язык выбран не пользователем и не по языку браузера. */
function shouldShowRegionHint(): boolean {
  const { source } = getInitialDetection();
  if (source !== 'timezone' && source !== 'default') return false;
  try {
    return window.localStorage.getItem(LOCALE_HINT_STORAGE_KEY) !== '1';
  } catch {
    return false;
  }
}

function markHintShown() {
  try {
    window.localStorage.setItem(LOCALE_HINT_STORAGE_KEY, '1');
  } catch {
    // localStorage недоступен — подсказка просто не запомнится
  }
}

/**
 * Переключатель языка: listbox с флагами и названиями языков на них самих.
 * Клавиатура: Enter/Space/↓ открывают, ↑/↓/Home/End — перемещение, Enter — выбор, Esc/Tab — закрыть,
 * буква — переход к языку по английскому названию.
 */
export function LanguageSwitcher({ variant = 'header', showRegionHint = false, className }: Props) {
  const { t } = useTranslation();
  const { locale, pendingLocale, setLocale } = useLocale();
  const prefersReducedMotion = useMotionTier() === 'off';
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => SWITCHER_ORDER.indexOf(locale));
  const [announcement, setAnnouncement] = useState('');
  const [hintVisible, setHintVisible] = useState(false);

  const current = LOCALE_META[locale];
  const optionId = (code: Locale) => `${listId}-${code}`;

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const openList = useCallback(() => {
    setActiveIndex(Math.max(0, SWITCHER_ORDER.indexOf(locale)));
    setOpen(true);
    setHintVisible(false);
  }, [locale]);

  // Фокус в список при открытии
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  // Клик вне — закрыть
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  // Одноразовая подсказка о языке, выбранном по региону
  useEffect(() => {
    if (!showRegionHint || !shouldShowRegionHint()) return undefined;
    markHintShown();
    const showTimer = window.setTimeout(() => setHintVisible(true), 1200);
    const hideTimer = window.setTimeout(() => setHintVisible(false), HINT_TIMEOUT_MS);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [showRegionHint]);

  const select = async (code: Locale) => {
    close(true);
    if (code === locale) return;
    await setLocale(code);
    setAnnouncement(LOCALE_META[code].nativeName);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openList();
    }
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const last = SWITCHER_ORDER.length - 1;
    const move = (index: number) => setActiveIndex(Math.min(last, Math.max(0, index)));

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(activeIndex + 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        move(activeIndex - 1);
        return;
      case 'Home':
        event.preventDefault();
        move(0);
        return;
      case 'End':
        event.preventDefault();
        move(last);
        return;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const code = SWITCHER_ORDER[activeIndex];
        if (code) void select(code);
        return;
      }
      case 'Escape':
        event.preventDefault();
        close(true);
        return;
      case 'Tab':
        close(false);
        return;
      default: {
        if (event.key.length !== 1) return;
        const letter = event.key.toLowerCase();
        const index = SWITCHER_ORDER.findIndex((code) =>
          LOCALE_META[code].englishName.toLowerCase().startsWith(letter),
        );
        if (index >= 0) move(index);
      }
    }
  };

  const isHeader = variant === 'header';
  const activeCode = SWITCHER_ORDER[activeIndex];

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={t('language.current', { name: current.nativeName })}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-border bg-bg-surface/60 text-small font-semibold text-text-primary backdrop-blur-sm transition-all duration-200',
          'hover:border-accent-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary',
          open && 'border-accent-primary/50',
          isHeader ? 'h-11 px-3 md:h-10' : 'h-10 px-3',
        )}
      >
        {/* Флаг переворачивается, код языка прокручивается при смене языка */}
        <span className="relative inline-flex [perspective:200px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current.code}
              className="inline-flex"
              initial={prefersReducedMotion ? false : { rotateY: 90 }}
              animate={{ rotateY: 0 }}
              exit={prefersReducedMotion ? undefined : { rotateY: -90 }}
              transition={{ duration: DURATION.fast, ease: EASE.sharp }}
            >
              <Flag country={current.flag} size={20} />
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="relative inline-flex overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current.code}
              className={isHeader ? 'uppercase tracking-wide' : undefined}
              lang={isHeader ? undefined : current.htmlLang}
              initial={prefersReducedMotion ? false : { y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { y: '-100%', opacity: 0 }}
              transition={{ duration: DURATION.base, ease: EASE.outExpo }}
            >
              {isHeader ? current.code : current.nativeName}
            </motion.span>
          </AnimatePresence>
        </span>
        {pendingLocale ? (
          <Loader2 size={14} aria-hidden className="animate-spin text-text-muted" />
        ) : (
          <ChevronDown
            size={14}
            aria-hidden
            className={cn(
              'text-text-muted transition-transform duration-200',
              open && 'rotate-180',
              !isHeader && 'rotate-180',
              !isHeader && open && 'rotate-0',
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            initial={
              prefersReducedMotion
                ? false
                : {
                    clipPath: isHeader
                      ? 'inset(0% 0% 100% 0% round 16px)'
                      : 'inset(100% 0% 0% 0% round 16px)',
                    y: isHeader ? -6 : 6,
                    opacity: 0,
                  }
            }
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 16px)', y: 0, opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    clipPath: isHeader
                      ? 'inset(0% 0% 100% 0% round 16px)'
                      : 'inset(100% 0% 0% 0% round 16px)',
                    y: isHeader ? -6 : 6,
                    opacity: 0,
                  }
            }
            transition={{ duration: prefersReducedMotion ? 0 : DURATION.base, ease: EASE.outExpo }}
            className={cn(
              'absolute z-50 w-60 rounded-2xl border border-border bg-bg-elevated p-1.5 shadow-glow',
              isHeader
                ? 'right-0 top-full mt-2 origin-top-right'
                : 'bottom-full left-0 mb-2 origin-bottom-left',
            )}
          >
            <p
              id={`${listId}-label`}
              className="px-3 pb-1.5 pt-2 text-xs font-medium text-text-muted"
            >
              {t('language.panelTitle')}
            </p>
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={`${listId}-label`}
              aria-activedescendant={activeCode ? optionId(activeCode) : undefined}
              onKeyDown={handleListKeyDown}
              className="flex flex-col gap-0.5 focus-visible:outline-none"
            >
              {SWITCHER_ORDER.map((code, index) => {
                const meta = LOCALE_META[code];
                const selected = code === locale;
                const active = index === activeIndex;
                return (
                  <li
                    key={code}
                    id={optionId(code)}
                    role="option"
                    aria-selected={selected}
                    lang={meta.htmlLang}
                    onClick={() => void select(code)}
                    onPointerMove={() => setActiveIndex(index)}
                    className={cn(
                      'relative flex min-h-[44px] cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2 transition-colors',
                      selected && 'bg-accent-primary/10',
                    )}
                  >
                    {/* Подсветка активной опции (клавиатура / курсор) */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-0 rounded-xl bg-bg-surface/70 ring-1 ring-inset ring-accent-primary/40 transition-opacity duration-150',
                        active ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <Flag country={meta.flag} size={22} className="relative" />
                    <span className="relative flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-small font-semibold text-text-primary">
                        {meta.nativeName}
                      </span>
                      {code !== 'en' ? (
                        <span lang="en" className="truncate text-xs text-text-muted">
                          {meta.englishName}
                        </span>
                      ) : null}
                    </span>
                    {selected ? (
                      <Check
                        size={16}
                        aria-hidden
                        className="relative shrink-0 text-accent-primary"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {hintVisible && !open ? (
          <motion.div
            key="hint"
            role="status"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full z-40 mt-3 w-64 rounded-2xl border border-accent-primary/30 bg-bg-elevated p-3 text-small text-text-secondary shadow-glow"
          >
            <span
              aria-hidden
              className="absolute -top-1.5 right-6 h-3 w-3 rotate-45 border-l border-t border-accent-primary/30 bg-bg-elevated"
            />
            <div className="flex items-start gap-2">
              <p className="flex-1">{t('language.hint', { name: current.nativeName })}</p>
              <button
                type="button"
                onClick={() => setHintVisible(false)}
                aria-label={t('language.hintDismiss')}
                className="-m-1 rounded p-1 text-text-muted transition-colors hover:text-text-primary"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
            <button
              type="button"
              onClick={openList}
              className="mt-2 text-small font-semibold text-accent-primary transition-colors hover:text-accent-secondary"
            >
              {t('language.hintAction')}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span aria-live="polite" className="sr-only">
        {announcement ? t('language.changed', { name: announcement }) : ''}
      </span>
    </div>
  );
}

type TilesProps = {
  onSelected?: () => void;
  className?: string;
};

/** Плитки языков для мобильного меню: без выпадающего списка, сразу все 7 вариантов. */
export function LanguageTiles({ onSelected, className }: TilesProps) {
  const { t } = useTranslation();
  const { locale, pendingLocale, setLocale } = useLocale();

  return (
    <div className={className}>
      <p className="px-1 text-xs font-medium text-text-muted" id="mobile-language-label">
        {t('language.label')}
      </p>
      <div
        role="group"
        aria-labelledby="mobile-language-label"
        className="mt-2 grid grid-cols-2 gap-2"
      >
        {SWITCHER_ORDER.map((code) => {
          const meta = LOCALE_META[code];
          const selected = code === locale;
          return (
            <button
              key={code}
              type="button"
              lang={meta.htmlLang}
              aria-pressed={selected}
              onClick={async () => {
                await setLocale(code);
                onSelected?.();
              }}
              className={cn(
                'flex min-h-[44px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-small font-medium transition-colors',
                selected
                  ? 'border-accent-primary/60 bg-accent-primary/10 text-text-primary'
                  : 'border-border bg-bg-surface/60 text-text-secondary hover:text-text-primary',
              )}
            >
              <Flag country={meta.flag} size={20} />
              <span className="flex-1 truncate">{meta.nativeName}</span>
              {pendingLocale === code ? (
                <Loader2 size={14} aria-hidden className="animate-spin text-text-muted" />
              ) : selected ? (
                <Check size={14} aria-hidden className="text-accent-primary" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
