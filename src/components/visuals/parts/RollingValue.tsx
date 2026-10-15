import { AnimatePresence, motion } from 'framer-motion';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';

type Props = {
  /** Уже отформатированное значение (Intl). */
  value: string;
  className?: string;
};

/**
 * Значение метрики, которое «прокручивается» при обновлении: старое уезжает вверх, новое приходит снизу.
 * Без overflow: hidden — иначе у плотных строк (leading-none) срезаются выносные элементы глифов.
 */
export function RollingValue({ value, className }: Props) {
  const { animated } = useVisual();
  return (
    <span className={cn('relative inline-grid whitespace-nowrap', className)}>
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="[grid-area:1/1]"
          initial={animated ? { y: '70%', opacity: 0, filter: 'blur(3px)' } : false}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={animated ? { y: '-70%', opacity: 0, filter: 'blur(3px)' } : { opacity: 0 }}
          transition={{ duration: animated ? DURATION.base : 0, ease: EASE.outExpo }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
