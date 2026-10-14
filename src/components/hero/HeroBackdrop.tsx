import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { HeroBackground } from '@/components/sections/HeroBackground';
import { useMotionTier } from '@/motion/tier';
import { DURATION } from '@/motion/tokens';

const HeroShader = lazy(() =>
  import('./HeroShader').then((module) => ({ default: module.HeroShader })),
);
const NeuralField = lazy(() =>
  import('./NeuralField').then((module) => ({ default: module.NeuralField })),
);

type Props = {
  scrollProgress?: MotionValue<number>;
  /** Спокойный режим для внутренних страниц. */
  calm?: boolean;
};

/** Ждём, пока браузер освободится после первой отрисовки — шейдер не мешает LCP. */
function useIdle(): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const schedule =
      window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = schedule(() => setIdle(true), { timeout: 1200 });
    return () => cancel(handle);
  }, []);
  return idle;
}

/**
 * Фон первого экрана: в full — WebGL-аврора + «нейросеть» поверх CSS-фолбэка (плавная подмена),
 * в lite/off — CSS-фон (орбы + меш-градиент).
 */
export function HeroBackdrop({ scrollProgress, calm = false }: Props) {
  const tier = useMotionTier();
  const idle = useIdle();
  const [shaderReady, setShaderReady] = useState(false);
  const full = tier === 'full';

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: full && shaderReady ? 0 : 1 }}
        transition={{ duration: DURATION.slow }}
      >
        <HeroBackground compact={calm} />
      </motion.div>

      {full && idle ? (
        <Suspense fallback={null}>
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: shaderReady ? 1 : 0 }}
            transition={{ duration: DURATION.cinematic }}
          >
            <HeroShader
              className="h-full w-full"
              scrollProgress={scrollProgress}
              intensity={calm ? 0.6 : 1}
              onReady={() => setShaderReady(true)}
            />
            <div className="absolute inset-0 bg-dot-grid opacity-60" />
            <NeuralField className="absolute inset-0 h-full w-full" calm={calm} />
            <div className="absolute inset-x-0 top-0 h-px bg-edge-glow" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg-base" />
          </motion.div>
        </Suspense>
      ) : null}
    </div>
  );
}
