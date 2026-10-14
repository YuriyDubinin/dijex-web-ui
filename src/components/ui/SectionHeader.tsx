import { motion } from 'framer-motion';
import { Reveal } from '@/motion/Reveal';
import { ScrambleText } from '@/motion/ScrambleText';
import { SplitText } from '@/motion/SplitText';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: 'center' | 'left';
  as?: 'h1' | 'h2';
  tone?: 'primary' | 'secondary';
  /** id заголовка — для aria-labelledby секции. */
  titleId?: string;
  className?: string;
};

/**
 * Шапка секции — фирменная последовательность: надзаголовок «дешифруется» с линией перед ним,
 * заголовок выезжает по словам из маски, лид проявляется из размытия.
 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'center',
  as: Heading = 'h2',
  tone = 'primary',
  titleId,
  className,
}: Props) {
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const words = title.split(/\s+/).length;
  const leadDelay = Math.min(0.15 + words * 0.035, 0.6);

  return (
    <div
      className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl', className)}
    >
      <p
        className={cn(
          'eyebrow inline-flex items-center gap-2.5',
          tone === 'secondary' ? 'text-accent-secondary' : 'text-accent-primary',
        )}
      >
        <motion.span
          aria-hidden
          className="h-px w-6 origin-left bg-current"
          initial={animated ? { scaleX: 0 } : false}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
        />
        <ScrambleText text={eyebrow} />
      </p>
      <SplitText
        as={Heading}
        id={titleId}
        text={title}
        mode="mask-up"
        duration={DURATION.slow}
        delay={0.1}
        className={cn(
          'mt-3 text-balance font-display font-bold text-text-primary',
          Heading === 'h1' ? 'text-display' : 'text-h1',
        )}
      />
      {lead ? (
        <Reveal variant="blur-up" delay={leadDelay} amount={0.6}>
          <p className="mt-4 text-body text-text-secondary md:text-lg">{lead}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
