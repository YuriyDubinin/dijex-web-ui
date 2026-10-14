import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AgentAvatar } from '@/components/agent/AgentAvatar';
import { Flag } from '@/components/ui/Flag';
import { AGENT_GREETINGS } from '@/content/home/support';
import { LOCALE_META, SWITCHER_ORDER, type Locale } from '@/i18n/config';
import { useLocale } from '@/i18n/useLocale';
import { useContent } from '@/i18n/useContent';
import { useMotionTier } from '@/motion/tier';
import { cn } from '@/lib/cn';

/** «Языки агента»: клик по флагу — приветствие агента на этом языке (тексты — данные, не переводятся). */
export function LanguagesDemo() {
  const content = useContent('solutions', 'supportAgent').languagesDemo;
  const { locale } = useLocale();
  const prefersReducedMotion = useMotionTier() === 'off';
  const [active, setActive] = useState<Locale>(locale === 'en' ? 'ja' : 'en');
  const meta = LOCALE_META[active];

  return (
    <div className="rounded-2xl border border-border bg-bg-surface/60 p-6 backdrop-blur-sm">
      <h3 className="font-display text-h3 font-semibold text-text-primary">{content.title}</h3>
      <p className="mt-1 text-small text-text-secondary">{content.lead}</p>

      <div role="group" aria-label={content.title} className="mt-5 flex flex-wrap gap-2">
        {SWITCHER_ORDER.map((code) => {
          const selected = code === active;
          return (
            <button
              key={code}
              type="button"
              lang={LOCALE_META[code].htmlLang}
              aria-pressed={selected}
              onClick={() => setActive(code)}
              className={cn(
                'inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3 py-1.5 text-small transition-colors',
                selected
                  ? 'border-accent-primary/60 bg-accent-primary/10 text-text-primary'
                  : 'border-border bg-bg-base/40 text-text-secondary hover:text-text-primary',
              )}
            >
              <Flag country={LOCALE_META[code].flag} size={18} />
              {LOCALE_META[code].nativeName}
            </button>
          );
        })}
        <span className="inline-flex min-h-[40px] items-center rounded-xl border border-dashed border-border px-3 py-1.5 text-small text-text-muted">
          {content.more}
        </span>
      </div>

      <div className="mt-6 flex min-h-[4.5rem] items-start gap-3">
        <AgentAvatar size={36} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={active}
            lang={meta.htmlLang}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="rounded-2xl rounded-tl-md border border-border bg-bg-elevated px-4 py-3 text-body text-text-primary"
          >
            {AGENT_GREETINGS[active]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
