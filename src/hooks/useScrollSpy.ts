import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type UseScrollSpyOptions = {
  /** Высота фиксированного хедера, чтобы корректно посчитать активную секцию. */
  offset?: number;
  /** Минимальная доля секции в viewport для активации. */
  threshold?: number;
};

/**
 * Возвращает id секции, которая сейчас наиболее заметна в viewport.
 * Использует IntersectionObserver — без слушателей scroll. Пересобирается при смене страницы.
 */
export function useScrollSpy(
  ids: readonly string[],
  options: UseScrollSpyOptions = {},
): string | null {
  const { offset = 80, threshold = 0 } = options;
  const { pathname } = useLocation();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setActiveId(null);
    if (ids.length === 0) return undefined;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return undefined;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.intersectionRatio);
        }

        let bestId: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestId = id;
            bestRatio = ratio;
          }
        }

        setActiveId(bestRatio > 0 ? bestId : null);
      },
      {
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: threshold > 0 ? threshold : [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids, offset, threshold, pathname]);

  return activeId;
}
