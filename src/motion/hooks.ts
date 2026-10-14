import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useScroll, useSpring, useVelocity, type MotionValue } from 'framer-motion';
import { SPRING_VALUE } from './tokens';

const FINE_POINTER = '(pointer: fine) and (hover: hover)';

/** Точный указатель с hover (мышь/трекпад). На тач-устройствах курсорные эффекты не нужны. */
export function usePointerFine(): boolean {
  const [fine, setFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(FINE_POINTER).matches === true,
  );

  useEffect(() => {
    const query = window.matchMedia?.(FINE_POINTER);
    if (!query) return undefined;
    const update = () => setFine(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return fine;
}

/** Виден ли документ (вкладка активна). */
export function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

/**
 * Элемент в viewport и вкладка активна — можно крутить бесконечные анимации.
 * rootMargin с запасом, чтобы анимация уже шла, когда элемент въезжает.
 */
export function useActiveInViewport(
  ref: RefObject<Element>,
  rootMargin = '120px 0px 120px 0px',
): boolean {
  const [inView, setInView] = useState(false);
  const visible = useDocumentVisible();

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView && visible;
}

/** Не чаще одного вызова за кадр. */
export function useRafThrottle<A extends unknown[]>(fn: (...args: A) => void) {
  const frame = useRef(0);
  const lastArgs = useRef<A>();
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return useCallback((...args: A) => {
    lastArgs.current = args;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (lastArgs.current) fnRef.current(...lastArgs.current);
    });
  }, []);
}

/** Сглаженная скорость скролла страницы (px/с). */
export function useScrollVelocity(): MotionValue<number> {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  return useSpring(velocity, SPRING_VALUE.soft);
}

/** Регистрация активных бесконечных циклов — для отладки (window.__motionDebug.activeLoops). */
type MotionDebug = { activeLoops: number; loops: Record<string, number> };

function debugStore(): MotionDebug | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null;
  const target = window as unknown as { __motionDebug?: MotionDebug };
  target.__motionDebug ??= { activeLoops: 0, loops: {} };
  return target.__motionDebug;
}

export function useLoopDebug(name: string, active: boolean) {
  useEffect(() => {
    const store = debugStore();
    if (!store || !active) return undefined;
    store.activeLoops += 1;
    store.loops[name] = (store.loops[name] ?? 0) + 1;
    return () => {
      store.activeLoops -= 1;
      store.loops[name] = (store.loops[name] ?? 1) - 1;
    };
  }, [name, active]);
}

/** Совпадение media query (с подпиской на изменения). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(query).matches === true,
  );
  useEffect(() => {
    const list = window.matchMedia?.(query);
    if (!list) return undefined;
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener?.('change', update);
    return () => list.removeEventListener?.('change', update);
  }, [query]);
  return matches;
}
