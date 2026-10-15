import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { segmentWords } from '@/motion/segment';
import { DURATION } from '@/motion/tokens';

type Props = {
  text: string;
  lang: string;
  animated: boolean;
  /** Пауза между словами, секунды. */
  wordDelay?: number;
  delay?: number;
};

/** Текст «стримится» по словам — как ответ языковой модели. Сегментация учитывает th/ja/zh. */
export function StreamedText({ text, lang, animated, wordDelay = 0.035, delay = 0 }: Props) {
  const segments = useMemo(() => segmentWords(text, lang), [text, lang]);
  if (!animated) return <>{text}</>;
  let wordIndex = 0;
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.kind === 'space') return segment.text;
        const order = wordIndex++;
        return (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: DURATION.base, delay: delay + order * wordDelay }}
          >
            {segment.text}
          </motion.span>
        );
      })}
    </>
  );
}
