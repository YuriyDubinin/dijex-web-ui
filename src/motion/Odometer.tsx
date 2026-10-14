import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMotionTier } from './tier';
import { DURATION, EASE } from './tokens';
import { cn } from '@/lib/cn';

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Длительность прокрутки самого медленного разряда, секунды. */
  duration?: number;
  delay?: number;
  /** Стартовать сразу, а не при появлении в viewport. */
  immediate?: boolean;
  /** Форматировать число по локали (разделители групп). */
  format?: boolean;
  /** Минимум цифр — дополнение нулями слева (02, 09). */
  minDigits?: number;
  className?: string;
  affixClassName?: string;
};

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * «Одометр»: каждая цифра — вертикальная лента 0–9 в маске, прокручивается к своему значению
 * (младшие разряды дольше — эффект механического счётчика), с лёгким motion blur.
 * Префикс и суффикс проявляются после остановки. Скринридер сразу получает итоговое значение.
 */
export function Odometer({
  value,
  prefix = '',
  suffix = '',
  duration = DURATION.cinematic + 0.4,
  delay = 0,
  immediate = false,
  format = true,
  minDigits = 1,
  className,
  affixClassName = 'text-accent-primary',
}: Props) {
  const { i18n } = useTranslation();
  const tier = useMotionTier();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const run = immediate || inView;
  const text = useMemo(
    () =>
      format
        ? new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: minDigits }).format(value)
        : String(value).padStart(minDigits, '0'),
    [format, i18n.language, value, minDigits],
  );
  const fullText = `${prefix}${text}${suffix}`;

  if (tier === 'off') {
    return (
      <span className={className}>
        {prefix ? <span className={affixClassName}>{prefix}</span> : null}
        {text}
        {suffix ? <span className={affixClassName}>{suffix}</span> : null}
      </span>
    );
  }

  const chars = Array.from(text);
  const digitCount = chars.filter((char) => DIGITS.includes(char)).length;
  let digitIndex = 0;

  return (
    <span ref={ref} className={cn('inline-flex items-baseline', className)}>
      <span className="sr-only">{fullText}</span>
      <span aria-hidden className="inline-flex items-baseline">
        {prefix ? (
          <motion.span
            className={affixClassName}
            initial={{ opacity: 0, x: -6 }}
            animate={run ? { opacity: 1, x: 0 } : undefined}
            transition={{ delay: delay + duration * 0.6, duration: DURATION.base }}
          >
            {prefix}
          </motion.span>
        ) : null}
        {chars.map((char, index) => {
          if (!DIGITS.includes(char)) {
            return (
              <span key={index} className="inline-block">
                {char}
              </span>
            );
          }
          const order = digitIndex++;
          // Старшие разряды останавливаются раньше, младшие крутятся дольше
          const columnDuration = duration * (0.55 + (0.45 * (order + 1)) / Math.max(1, digitCount));
          const target = Number(char);
          return (
            <span
              key={index}
              className="relative inline-block h-[1em] overflow-hidden leading-none"
              style={{ width: '0.62em' }}
            >
              <motion.span
                className="absolute left-0 top-0 flex w-full flex-col items-center"
                initial={{ y: '0%', filter: 'blur(0px)' }}
                animate={
                  run
                    ? {
                        y: `${-target * 10}%`,
                        filter: ['blur(0px)', 'blur(2px)', 'blur(0px)'],
                      }
                    : undefined
                }
                transition={{ duration: columnDuration, delay, ease: EASE.outExpo }}
              >
                {DIGITS.map((digit) => (
                  <span key={digit} className="block h-[1em] leading-none">
                    {digit}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
        {suffix ? (
          <motion.span
            className={affixClassName}
            initial={{ opacity: 0, x: 6 }}
            animate={run ? { opacity: 1, x: 0 } : undefined}
            transition={{ delay: delay + duration * 0.6, duration: DURATION.base }}
          >
            {suffix}
          </motion.span>
        ) : null}
      </span>
    </span>
  );
}
