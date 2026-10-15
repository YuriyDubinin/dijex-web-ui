import { useMemo, type ElementType } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { segmentWords } from './segment';
import { useMotionTier } from './tier';
import { DURATION, EASE, STAGGER } from './tokens';
import { cn } from '@/lib/cn';

export type SplitMode = 'mask-up' | 'blur-in' | 'rise';

type Props = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  mode?: SplitMode;
  /** mount — сразу (hero), inView — при появлении в viewport. */
  trigger?: 'mount' | 'inView';
  delay?: number;
  stagger?: number;
  duration?: number;
  /** Слова, которые выделяются градиентом (например, «24/7»). */
  accent?: (word: string) => boolean;
  accentClassName?: string;
  /** Язык текста; по умолчанию — язык сайта. */
  locale?: string;
  id?: string;
  className?: string;
};

const WORD_VARIANTS: Record<SplitMode, Variants> = {
  // Без opacity: слово «выезжает» из маски — заголовок сразу участвует в LCP
  'mask-up': { hidden: { y: '108%' }, visible: { y: '0%' } },
  'blur-in': {
    hidden: { opacity: 0.001, filter: 'blur(10px)', y: '0.15em' },
    visible: { opacity: 1, filter: 'blur(0px)', y: '0em' },
  },
  rise: { hidden: { opacity: 0, y: '0.45em' }, visible: { opacity: 1, y: '0em' } },
};

/**
 * Текст, появляющийся по словам. Слова режутся с учётом языка (Intl.Segmenter для th/ja/zh).
 * Скринридер читает текст целиком (sr-only копия), анимированные слова скрыты от него.
 */
export function SplitText({
  text,
  as = 'span',
  mode = 'mask-up',
  trigger = 'inView',
  delay = 0,
  stagger = STAGGER.words,
  duration = DURATION.reveal,
  accent,
  accentClassName = 'text-gradient',
  locale,
  id,
  className,
}: Props) {
  const { i18n } = useTranslation();
  const tier = useMotionTier();
  const language = locale ?? i18n.language;
  const segments = useMemo(() => segmentWords(text, language), [text, language]);
  const Tag = as as ElementType;

  if (tier === 'off') {
    return (
      <Tag id={id} className={className}>
        {accent
          ? segments.map((segment, index) =>
              segment.kind === 'word' && accent(segment.text) ? (
                <span key={index} className={accentClassName}>
                  {segment.text}
                </span>
              ) : (
                segment.text
              ),
            )
          : text}
      </Tag>
    );
  }

  const variants = WORD_VARIANTS[tier === 'lite' && mode === 'blur-in' ? 'rise' : mode];
  const isMask = mode === 'mask-up';
  const triggerProps =
    trigger === 'mount'
      ? { initial: 'hidden', animate: 'visible' }
      : { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.4 } };

  let wordIndex = 0;

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        {...triggerProps}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
      >
        {segments.map((segment, index) => {
          if (segment.kind === 'space') return segment.text;
          const order = wordIndex++;
          const word = (
            <motion.span
              variants={variants}
              transition={{ duration, ease: EASE.outExpo }}
              className={cn(
                'inline-block will-change-transform',
                accent?.(segment.text) && accentClassName,
              )}
              data-word={order}
            >
              {segment.text}
            </motion.span>
          );
          return isMask ? (
            // Запас сверху и снизу — под выносные элементы, Й/Ё/Ü и тайские диакритики (см. .split-mask)
            <span key={index} className="split-mask inline-block overflow-hidden align-top">
              {word}
            </span>
          ) : (
            <span key={index} className="inline-block">
              {word}
            </span>
          );
        })}
      </motion.span>
    </Tag>
  );
}
