import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { Packet } from '../parts/Packet';
import { WindowChrome } from '../parts/WindowChrome';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 640×400: окно браузера слева, телефон справа, между ними синхронизация. */
const BROWSER = { x: 16, y: 24, w: 380, h: 306 } as const;
const PHONE = { x: 456, y: 44, w: 148, h: 288 } as const;
const CTA = { x: 46, y: 170, w: 100, h: 28 } as const;
const CTA_CENTER = { x: CTA.x + CTA.w / 2, y: CTA.y + CTA.h / 2 } as const;
const CURSOR_REST = { x: 300, y: 290 } as const;
const SYNC_PATH = `M ${BROWSER.x + BROWSER.w} 170 C 426 170 430 196 ${PHONE.x} 196`;
const TECH = ['React', 'TypeScript', 'React Native', 'Swift'] as const;

/** Шаги: курсор идёт к кнопке → клик → пауза → телефон поворачивается → обратно. */
const STEPS = [1100, 450, 1400, 1600, 1600] as const;
const STEP = { move: 0, click: 1, hold: 2, rotate: 3 } as const;

function CursorArrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      className="drop-shadow-[0_2px_4px_rgb(0_0_0/0.6)]"
    >
      <path
        d="M2 1.5 L2 14.5 L5.6 11.2 L8.2 16.6 L10.6 15.5 L8 10.2 L13 10.2 Z"
        fill="white"
        stroke="rgb(var(--bg-base))"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Вкладка «Сайты и приложения»: один продукт в браузере и на телефоне, клик по CTA, адаптивность. */
export function WebAppsVisual() {
  const text = useContent('visuals', 'webApps');
  const { animated, full } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.hold });
  const atCta = step <= STEP.hold;
  const pressed = step === STEP.click;
  const rotated = step === STEP.rotate;
  const spring = animated ? SPRING.soft : { duration: 0 };

  return (
    <div className="absolute inset-0">
      <div className="absolute left-24 top-16 h-64 w-96 rounded-full bg-glow-indigo opacity-60 blur-3xl" />

      <svg viewBox="0 0 640 400" className="absolute inset-0 h-full w-full overflow-visible">
        <path
          d={SYNC_PATH}
          fill="none"
          stroke="rgb(var(--accent-secondary))"
          strokeOpacity={0.5}
          strokeDasharray="3 4"
        />
      </svg>
      <Packet d={SYNC_PATH} loop duration={1.6} />

      {/* Браузер */}
      <div
        className="absolute flex flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]"
        style={{ left: BROWSER.x, top: BROWSER.y, width: BROWSER.w, height: BROWSER.h }}
      >
        <WindowChrome url="company.com" />
        <div className="flex items-center gap-3 px-3.5 py-2">
          <span className="h-3 w-3 rounded bg-brand-gradient" />
          {text.nav.map((item) => (
            <span key={item} className="min-w-0 truncate text-[9.5px] text-text-muted">
              {item}
            </span>
          ))}
          <span className="ml-auto h-4 w-12 shrink-0 rounded-md border border-border" />
        </div>
      </div>

      {/* Hero лендинга */}
      <div
        className="absolute overflow-hidden rounded-lg bg-[linear-gradient(120deg,rgb(var(--accent-primary)/0.45),rgb(var(--accent-glow)/0.3)_50%,rgb(var(--accent-secondary)/0.35))]"
        style={{ left: 30, top: 92, width: 352, height: 118 }}
      >
        <span className="absolute left-4 top-4 h-2.5 w-48 rounded-full bg-white/70" />
        <span className="absolute left-4 top-9 h-2.5 w-36 rounded-full bg-white/70" />
        <span className="absolute left-4 top-[58px] h-1.5 w-56 rounded-full bg-white/35" />
        <span className="absolute -right-6 -top-10 h-32 w-32 rounded-full border border-white/20" />
        <span className="absolute -right-2 top-8 h-20 w-20 rounded-full border border-white/15" />
      </div>
      <motion.span
        className={cn(
          'absolute flex items-center justify-center overflow-hidden rounded-lg px-2 text-[10.5px] font-semibold text-white transition-shadow duration-300',
          step === STEP.hold
            ? 'bg-accent-secondary shadow-[0_0_24px_rgb(var(--accent-secondary)/0.8)]'
            : 'bg-bg-base',
        )}
        style={{ left: CTA.x, top: CTA.y, width: CTA.w, height: CTA.h }}
        initial={false}
        animate={{ scale: pressed ? 0.92 : 1 }}
        transition={animated ? SPRING.snappy : { duration: 0 }}
      >
        <span className="truncate">{text.cta}</span>
      </motion.span>
      {pressed && animated ? (
        <motion.span
          key={`ripple-${cycle}`}
          className="pointer-events-none absolute rounded-full border-2 border-accent-secondary"
          style={{ left: CTA_CENTER.x - 20, top: CTA_CENTER.y - 20, width: 40, height: 40 }}
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: DURATION.reveal, ease: EASE.outExpo }}
        />
      ) : null}

      {/* Карточки лендинга */}
      {[30, 150, 270].map((x, index) => (
        <div
          key={x}
          className="absolute flex flex-col gap-1.5 rounded-lg border border-border bg-bg-surface p-2.5"
          style={{ left: x, top: 222, width: 112, height: 96 }}
        >
          <span
            className={cn(
              'h-6 w-6 rounded-md',
              ['bg-accent-primary/40', 'bg-accent-secondary/40', 'bg-accent-glow/40'][index],
            )}
          />
          <span className="mt-1 h-1.5 w-4/5 rounded-full bg-text-muted/40" />
          <span className="h-1.5 w-3/5 rounded-full bg-text-muted/25" />
          <span className="h-1.5 w-2/3 rounded-full bg-text-muted/25" />
        </div>
      ))}

      {/* Курсор */}
      {full ? (
        <motion.span
          className="pointer-events-none absolute left-0 top-0"
          initial={false}
          animate={
            atCta
              ? { x: CTA_CENTER.x - 2, y: CTA_CENTER.y - 2 }
              : { x: CURSOR_REST.x, y: CURSOR_REST.y }
          }
          transition={{ duration: DURATION.cinematic * 0.8, ease: EASE.inOut }}
        >
          <motion.span
            className="block"
            animate={{ scale: pressed ? 0.85 : 1 }}
            transition={{ duration: DURATION.instant }}
          >
            <CursorArrow />
          </motion.span>
        </motion.span>
      ) : null}

      {/* Телефон: та же страница, мобильная раскладка, прокручивается */}
      <motion.div
        className="absolute overflow-hidden rounded-[26px] border-[3px] border-bg-surface bg-bg-base shadow-[0_0_0_1px_rgb(var(--border)),0_30px_60px_-30px_rgb(0_0_0/0.9)]"
        style={{ left: PHONE.x, top: PHONE.y, width: PHONE.w, height: PHONE.h }}
        initial={false}
        animate={rotated ? { rotate: -90, scale: 0.72 } : { rotate: 0, scale: 1 }}
        transition={animated ? { duration: DURATION.cinematic, ease: EASE.inOut } : { duration: 0 }}
      >
        <span className="absolute left-1/2 top-1.5 z-10 h-3.5 w-12 -translate-x-1/2 rounded-full bg-bg-surface" />
        <div
          className={cn('flex flex-col gap-2 px-2.5 pt-7', full && 'animate-device-scroll')}
          style={{ '--scroll-distance': '-38%' } as CSSProperties}
        >
          <div className="flex items-center justify-between">
            <span className="h-2.5 w-2.5 rounded bg-brand-gradient" />
            <span className="flex flex-col gap-0.5">
              <span className="h-0.5 w-3 rounded bg-text-muted" />
              <span className="h-0.5 w-3 rounded bg-text-muted" />
            </span>
          </div>
          <div className="flex h-24 flex-col justify-end gap-1.5 rounded-lg bg-[linear-gradient(150deg,rgb(var(--accent-primary)/0.5),rgb(var(--accent-secondary)/0.35))] p-2">
            <span className="h-1.5 w-4/5 rounded-full bg-white/70" />
            <span className="h-1.5 w-3/5 rounded-full bg-white/70" />
            <span
              className={cn(
                'mt-1 flex h-4 w-14 items-center justify-center truncate rounded px-1 text-[6.5px] font-semibold text-white',
                step === STEP.hold ? 'bg-accent-secondary' : 'bg-bg-base',
              )}
            >
              {text.cta}
            </span>
          </div>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-border bg-bg-surface p-2"
            >
              <span
                className={cn(
                  'h-6 w-6 shrink-0 rounded-md',
                  [
                    'bg-accent-primary/40',
                    'bg-accent-secondary/40',
                    'bg-accent-glow/40',
                    'bg-success/30',
                  ][index],
                )}
              />
              <span className="flex flex-1 flex-col gap-1">
                <span className="h-1 w-4/5 rounded-full bg-text-muted/40" />
                <span className="h-1 w-1/2 rounded-full bg-text-muted/25" />
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Технологии и статус синхронизации */}
      <div className="absolute flex gap-1.5" style={{ left: BROWSER.x, top: 346 }}>
        {TECH.map((item, index) => (
          <motion.span
            key={item}
            className="whitespace-nowrap rounded-full border border-border bg-bg-elevated px-2 py-0.5 font-mono text-[9.5px] text-text-secondary"
            initial={animated ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: animated ? 0.3 + index * STAGGER.cards : 0 }}
          >
            {item}
          </motion.span>
        ))}
      </div>
      <span
        className="absolute flex max-w-[150px] items-center gap-1.5 rounded-full border border-accent-secondary/40 bg-accent-secondary/10 px-2.5 py-0.5 text-[10px] text-accent-secondary"
        style={{ left: PHONE.x, top: 346 }}
      >
        <RefreshCw size={10} className={cn('shrink-0', full && 'animate-spin-slow')} />
        <span className="truncate">{text.sync}</span>
      </span>
    </div>
  );
}
