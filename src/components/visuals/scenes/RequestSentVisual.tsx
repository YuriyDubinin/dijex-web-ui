import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Sparkles } from 'lucide-react';
import { DrawCheck } from '@/motion/DrawCheck';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { Packet } from '../parts/Packet';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 480×360: карточка заявки слева сворачивается в пакет, пакет летит к ядру Dijex справа. */
const CORE = { x: 362, y: 172 } as const;
const FLIGHT = `M 150 196 C 220 196 230 120 290 140 S ${CORE.x - 52} ${CORE.y} ${CORE.x - 46} ${CORE.y}`;

/** Шаги: заявка → сворачивается → летит → ядро принимает, галочка. */
const STEPS = [1000, 600, 1100, 2000] as const;
const STEP = { form: 0, fold: 1, flight: 2, received: 3 } as const;

/** «Спасибо»: заявка превращается в пакет и долетает до команды. */
export function RequestSentVisual() {
  const { animated, full } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.received });
  const folded = step >= STEP.fold;
  const received = step === STEP.received;
  const spring = animated ? SPRING.soft : { duration: 0 };

  return (
    <div className="absolute inset-0">
      <div
        className="absolute rounded-full bg-glow-indigo opacity-80 blur-3xl"
        style={{ left: CORE.x - 130, top: CORE.y - 110, width: 260, height: 220 }}
      />

      <svg viewBox="0 0 480 360" className="absolute inset-0 h-full w-full overflow-visible">
        <path d={FLIGHT} fill="none" stroke="rgb(var(--border))" strokeDasharray="3 5" />
        <motion.path
          d={FLIGHT}
          fill="none"
          stroke="rgb(var(--accent-secondary))"
          strokeWidth={1.5}
          initial={false}
          animate={{
            pathLength: step >= STEP.flight ? 1 : 0,
            opacity: step >= STEP.flight ? 0.8 : 0,
          }}
          transition={{ duration: animated ? 1 : 0, ease: EASE.inOut }}
        />
      </svg>
      {step === STEP.flight ? (
        <Packet key={`fly-${cycle}`} d={FLIGHT} duration={1} size={10} />
      ) : null}

      {/* Карточка заявки: строки формы, затем сворачивается в конверт-пакет */}
      <motion.div
        className="absolute flex flex-col gap-2 overflow-hidden rounded-xl border border-border bg-bg-elevated p-3"
        style={{ left: 40, top: 120, width: 120, height: 152 }}
        initial={false}
        animate={folded ? { scale: 0.92, opacity: 0.3 } : { scale: 1, opacity: 1 }}
        transition={{ duration: animated ? DURATION.slow : 0, ease: EASE.inOut }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary/15 text-accent-primary">
          <Mail size={14} />
        </span>
        {[0.9, 0.7, 0.8].map((width, index) => (
          <span key={index} className="flex flex-col gap-1">
            <span className="h-1 w-1/3 rounded-full bg-text-muted/30" />
            <span
              className="h-4 rounded-md border border-border bg-bg-base/60"
              style={{ width: `${width * 100}%` }}
            />
          </span>
        ))}
        <span className="mt-auto h-5 rounded-md bg-accent-primary" />
      </motion.div>

      {/* Ядро команды */}
      <div
        className="absolute"
        style={{ left: CORE.x - 46, top: CORE.y - 46, width: 92, height: 92 }}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(var(--accent-secondary)/0.9),rgb(var(--accent-primary)/0.85)_45%,rgb(var(--accent-glow)/0.6)_75%,transparent_100%)] shadow-[0_0_70px_-10px_rgb(var(--accent-primary)/0.8)]',
            full && 'animate-breathe',
          )}
        />
        <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_20px_rgb(255_255_255/0.35)]" />
        <div className="absolute inset-0 flex items-center justify-center text-white/90">
          <Sparkles size={26} strokeWidth={1.5} />
        </div>
        <AnimatePresence>
          {received && animated ? (
            <motion.span
              key={`pulse-${cycle}`}
              className="absolute inset-0 rounded-full border-2 border-accent-secondary"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.9, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          ) : null}
        </AnimatePresence>
      </div>
      <span
        className="absolute -translate-x-1/2 font-display text-[13px] font-bold text-text-primary"
        style={{ left: CORE.x, top: CORE.y + 56 }}
      >
        Dijex
      </span>

      {/* Принято */}
      <AnimatePresence>
        {received ? (
          <motion.span
            key={`ok-${cycle}`}
            className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-success/60 bg-success/15 text-success shadow-[0_0_24px_-4px_rgb(var(--success)/0.8)]"
            style={{ left: CORE.x + 30, top: CORE.y - 66 }}
            initial={animated ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring}
          >
            <DrawCheck size={20} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
