import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMotionTier } from '@/motion/tier';
import { SPRING_VALUE } from '@/motion/tokens';

/** Кнопка «Наверх» с кольцом прогресса прокрутки страницы. */
export function BackToTop() {
  const { t } = useTranslation();
  const tier = useMotionTier();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, SPRING_VALUE.soft);

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: tier === 'off' ? 'auto' : 'smooth' });
        document.getElementById('main')?.focus({ preventScroll: true });
      }}
      aria-label={t('footer.backToTop')}
      title={t('footer.backToTop')}
      className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg-surface/60 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
    >
      <svg aria-hidden viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <motion.circle
          cx="22"
          cy="22"
          r="20.5"
          fill="none"
          stroke="url(#back-to-top-gradient)"
          strokeWidth="1.5"
          style={{ pathLength: tier === 'off' ? 1 : progress }}
        />
        <defs>
          <linearGradient id="back-to-top-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent-primary))" />
            <stop offset="100%" stopColor="rgb(var(--accent-secondary))" />
          </linearGradient>
        </defs>
      </svg>
      <ArrowUp
        size={16}
        aria-hidden
        className="relative transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
