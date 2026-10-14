/* eslint-disable react-refresh/only-export-components -- провайдер и хук интро намеренно рядом */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getBaseTier, getMotionOverride } from './tier';

const INTRO_KEY = 'dijex.intro';
/** Страховка: хореография hero стартует не позже этого времени, даже если интро зависло. */
const INTRO_FAILSAFE_MS = 1100;
/** Сколько ждём шрифты перед разбиением текста на слова. */
const FONTS_TIMEOUT_MS = 300;

type IntroState = {
  /** Интро бренда сейчас показывается. */
  playing: boolean;
  /** Можно запускать хореографию первого экрана. */
  ready: boolean;
  finish: () => void;
};

const IntroContext = createContext<IntroState>({ playing: false, ready: true, finish: () => {} });

function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  const tier = getMotionOverride() ?? getBaseTier();
  if (tier !== 'full') return false;
  try {
    return window.sessionStorage.getItem(INTRO_KEY) !== '1';
  } catch {
    return false;
  }
}

function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, FONTS_TIMEOUT_MS)),
  ]);
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(shouldPlayIntro);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void waitForFonts().then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(() => setPlaying(false), INTRO_FAILSAFE_MS);
    return () => window.clearTimeout(timer);
  }, [playing]);

  const finish = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // без sessionStorage интро покажется снова — не критично
    }
    setPlaying(false);
  }, []);

  const value = useMemo(
    () => ({ playing, ready: !playing && fontsReady, finish }),
    [playing, fontsReady, finish],
  );

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro(): IntroState {
  return useContext(IntroContext);
}
