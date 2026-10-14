import { useEffect, useRef, useState, type ElementType } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supportsCharEffects } from './segment';
import { useMotionTier } from './tier';
import { DURATION, EASE } from './tokens';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·—+';

type Props = {
  text: string;
  as?: ElementType;
  /** Длительность «дешифровки», мс. */
  duration?: number;
  delay?: number;
  className?: string;
};

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '·';

/**
 * «Дешифровка»: символы перебираются и оседают в нужные. Только для алфавитов с пробелами (латиница, кириллица);
 * для th/ja/zh — проявление маской слева направо. Скринридер читает исходный текст.
 */
export function ScrambleText({
  text,
  as: Tag = 'span',
  duration = 500,
  delay = 0,
  className,
}: Props) {
  const { i18n } = useTranslation();
  const tier = useMotionTier();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const charMode = supportsCharEffects(i18n.language) && tier === 'full';
  const [display, setDisplay] = useState(() => (charMode ? text.replace(/\S/g, ' ') : text));

  useEffect(() => {
    if (!charMode) {
      setDisplay(text);
      return undefined;
    }
    if (!inView) return undefined;
    let frame = 0;
    const start = performance.now() + delay * 1000;
    // Момент «оседания» каждого символа: слева направо с небольшим разбросом
    const settleAt = Array.from(
      text,
      (_, index) => (index / text.length) * duration * 0.75 + Math.random() * duration * 0.25,
    );

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      let done = true;
      const next = Array.from(text, (char, index) => {
        if (/\s/.test(char)) return char;
        if (elapsed >= (settleAt[index] ?? 0)) return char;
        done = false;
        return randomGlyph();
      }).join('');
      setDisplay(next);
      if (!done) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, text, charMode, duration, delay]);

  if (tier === 'off') return <Tag className={className}>{text}</Tag>;

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      {charMode ? (
        <span aria-hidden>{display}</span>
      ) : (
        <motion.span
          aria-hidden
          className="inline-block"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={inView ? { clipPath: 'inset(0 0% 0 0)' } : undefined}
          transition={{ duration: DURATION.slow, ease: EASE.outExpo, delay }}
        >
          {text}
        </motion.span>
      )}
    </Tag>
  );
}
