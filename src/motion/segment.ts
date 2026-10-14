export type TextSegment = {
  text: string;
  /** Слово (анимируется) или пробел (остаётся текстом, чтобы строка переносилась). */
  kind: 'word' | 'space';
};

/** Языки без пробелов между словами — сегментируем через Intl.Segmenter. */
const UNSPACED = new Set(['th', 'ja', 'zh']);

function primary(locale: string) {
  return locale.toLowerCase().split(/[-_]/)[0] ?? locale;
}

function splitBySpaces(text: string): TextSegment[] {
  return text
    .split(/(\s+)/)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, kind: /^\s+$/.test(part) ? 'space' : 'word' }));
}

type SegmenterLike = {
  segment: (input: string) => Iterable<{ segment: string; isWordLike?: boolean }>;
};

function createSegmenter(locale: string): SegmenterLike | null {
  const IntlWithSegmenter = Intl as typeof Intl & {
    Segmenter?: new (locale: string, options: { granularity: 'word' }) => SegmenterLike;
  };
  if (!IntlWithSegmenter.Segmenter) return null;
  try {
    return new IntlWithSegmenter.Segmenter(locale, { granularity: 'word' });
  } catch {
    return null;
  }
}

/**
 * Делит текст на слова с учётом языка.
 * - en/ru/fr/de: по пробелам — пунктуация остаётся со словом («AI,» «24/7»).
 * - th/ja/zh: Intl.Segmenter (настоящие слова, а не символы); пунктуация и знаки
 *   приклеиваются к предыдущему слову, пробелы между фразами сохраняются.
 */
export function segmentWords(text: string, locale: string): TextSegment[] {
  if (!UNSPACED.has(primary(locale))) return splitBySpaces(text);

  const segmenter = createSegmenter(locale);
  if (!segmenter) return splitBySpaces(text);

  const result: TextSegment[] = [];
  for (const { segment, isWordLike } of segmenter.segment(text)) {
    if (/^\s+$/.test(segment)) {
      result.push({ text: segment, kind: 'space' });
      continue;
    }
    const previous = result[result.length - 1];
    // Латиница внутри CJK/тайского («AI», «Dijex», «24/7») и пунктуация — к предыдущему слову, если оно вплотную
    const glue = !isWordLike || /^[\p{P}\p{S}]+$/u.test(segment);
    if (glue && previous && previous.kind === 'word') {
      previous.text += segment;
    } else {
      result.push({ text: segment, kind: 'word' });
    }
  }
  return result;
}

/** Можно ли применять посимвольные эффекты (scramble, печать) — только для алфавитов с пробелами. */
export function supportsCharEffects(locale: string): boolean {
  return !UNSPACED.has(primary(locale));
}
