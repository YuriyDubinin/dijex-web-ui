import { motion } from 'framer-motion';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';

/** Разделитель секций: при первом появлении по линии один раз пробегает световой луч. */
export function SectionDivider() {
  const tier = useMotionTier();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
      <div className="absolute inset-0 bg-border/40" />
      {tier !== 'off' ? (
        <motion.div
          className="absolute inset-y-0 w-[30%] bg-gradient-to-r from-transparent via-accent-secondary to-transparent"
          initial={{ x: '-110%', opacity: 0 }}
          whileInView={{ x: '360%', opacity: [0, 1, 1, 0] }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: 1.1 * (DURATION.cinematic / 1.2), ease: EASE.inOut }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/60 to-transparent blur-sm" />
        </motion.div>
      ) : null}
    </div>
  );
}
