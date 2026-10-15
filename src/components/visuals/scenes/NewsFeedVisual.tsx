import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Copy,
  Cpu,
  Languages,
  Newspaper,
  Radio,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CASES } from '@/content/home/cases';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { pick } from '../pick';
import { Packet } from '../parts/Packet';
import { RollingValue } from '../parts/RollingValue';
import { Sparkline } from '../parts/Sparkline';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 640×360: источники → AI-конвейер → торговые сигналы. */
type Ticker = 'CHPX' | 'EVMO' | 'BNKS' | 'OILX';

type Story = {
  lang: string;
  source: string;
  /** Заголовок на языке источника — данные, не переводятся (перевод — в visuals.newsFeed.headlines). */
  headline: string;
  rtl?: boolean;
  /** Дубль уже обработанной новости — склеивается на этапе dedupe. */
  duplicate?: boolean;
  ticker: Ticker;
  /** Тональность −1…+1. */
  sentiment: number;
  /** Реакция цены, %. */
  move: number;
};

const STORIES: readonly [Story, ...Story[]] = [
  {
    lang: 'EN',
    source: 'markets.wire',
    headline: 'Chipmaker raises full-year guidance on AI demand',
    ticker: 'CHPX',
    sentiment: 0.72,
    move: 2.4,
  },
  {
    lang: 'JA',
    source: 'asia.desk',
    headline: '半導体大手、AI需要で通期予想を上方修正',
    duplicate: true,
    ticker: 'CHPX',
    sentiment: 0.68,
    move: 0.4,
  },
  {
    lang: 'DE',
    source: 'eu.finanz',
    headline: 'Zentralbank signalisiert eine Zinspause',
    ticker: 'BNKS',
    sentiment: 0.12,
    move: -0.6,
  },
  {
    lang: 'ZH',
    source: 'cn.markets',
    headline: '电动车制造商三季度交付量创新高',
    ticker: 'EVMO',
    sentiment: 0.81,
    move: 3.1,
  },
  {
    lang: 'AR',
    source: 'gulf.energy',
    headline: 'ارتفاع أسعار النفط بعد قرار أوبك+',
    rtl: true,
    ticker: 'OILX',
    sentiment: -0.35,
    move: 1.8,
  },
];

const TICKERS: readonly { ticker: Ticker; base: number }[] = [
  { ticker: 'CHPX', base: 412.6 },
  { ticker: 'EVMO', base: 188.2 },
  { ticker: 'BNKS', base: 54.9 },
  { ticker: 'OILX', base: 81.3 },
];

/** Тональность рынка по кругу — для мини-графика индекса. */
const MOOD = [
  0.2, 0.35, 0.3, 0.5, 0.42, 0.61, 0.55, 0.7, 0.62, 0.74, 0.66, 0.79, 0.71, 0.58, 0.64, 0.52,
];

const STAGES = ['translate', 'dedupe', 'entities', 'sentiment'] as const;
/** Шаги: перевод → дедупликация → сущности → тональность → сигнал. */
const STEPS = [1000, 800, 900, 900, 1500] as const;
const STEP = { translate: 0, dedupe: 1, entities: 2, sentiment: 3, signal: 4 } as const;

const SOURCE_CARD_H = 56;
const WIRE_IN = 'M 196 92 C 204 92 204 92 212 92';
const WIRE_OUT = 'M 432 92 C 440 92 440 92 446 92';

/** Кейс «AI-фидер новостей»: новости на 20+ языках превращаются в сигналы для торговых решений. */
export function NewsFeedVisual() {
  const text = useContent('visuals', 'newsFeed');
  const cases = useContent('home', 'cases');
  const { i18n } = useTranslation();
  const format = useVisualFormat();
  const { animated } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.signal });
  const index = cycle % STORIES.length;
  const story = pick(STORIES, index);
  const translated = step >= STEP.dedupe;
  const languagesMetric = CASES.find((item) => item.key === 'newsFeeder')?.metrics[0]?.value ?? '';
  const fade = { duration: animated ? DURATION.base : 0, ease: EASE.outExpo };
  const spring = animated ? SPRING.soft : { duration: 0 };

  // Цена тикера = база × накопленные реакции всех уже обработанных новостей
  const priceOf = (ticker: Ticker) => {
    const base = TICKERS.find((item) => item.ticker === ticker)?.base ?? 0;
    let price = base;
    const processed = cycle + (step >= STEP.signal ? 1 : 0);
    for (let n = 0; n < processed; n += 1) {
      const item = pick(STORIES, n);
      if (item.ticker === ticker) price *= 1 + item.move / 100;
    }
    return price;
  };
  const moodWindow = Array.from({ length: 12 }, (_, n) => MOOD[(cycle + n) % MOOD.length] ?? 0);

  return (
    <div className="absolute inset-0">
      <div className="absolute left-48 top-10 h-64 w-72 rounded-full bg-glow-indigo opacity-70 blur-3xl" />

      <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full overflow-visible">
        <path d={WIRE_IN} stroke="rgb(var(--border))" fill="none" />
        <path d={WIRE_OUT} stroke="rgb(var(--border))" fill="none" />
      </svg>
      {step === STEP.translate ? <Packet key={`in-${cycle}`} d={WIRE_IN} duration={0.5} /> : null}
      {step === STEP.signal ? (
        <Packet key={`out-${cycle}`} d={WIRE_OUT} duration={0.5} tone="success" />
      ) : null}

      {/* Источники: лента едет вверх, текущая новость — сверху */}
      <div
        className="absolute flex flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated/95"
        style={{ left: 12, top: 12, width: 184, height: 336 }}
      >
        <span className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-[10.5px] font-semibold text-text-primary">
          <Newspaper size={12} className="text-accent-secondary" />
          <span className="truncate">{text.sources}</span>
          <span className="ml-auto flex items-center gap-1 font-mono text-[9px] text-success">
            <Radio size={10} />
            live
          </span>
        </span>
        <div className="relative flex-1">
          <AnimatePresence initial={false}>
            {[0, 1, 2, 3, 4].map((offset) => {
              const n = cycle + offset;
              const item = pick(STORIES, n);
              return (
                <motion.div
                  key={n}
                  className={cn(
                    'absolute inset-x-2 flex flex-col gap-1 rounded-lg border px-2 py-1.5',
                    offset === 0
                      ? 'border-accent-secondary/60 bg-accent-secondary/10'
                      : 'border-border/70 bg-bg-base/40',
                  )}
                  style={{ height: SOURCE_CARD_H - 6 }}
                  initial={animated ? { y: 5 * SOURCE_CARD_H, opacity: 0 } : false}
                  animate={{ y: 6 + offset * SOURCE_CARD_H, opacity: offset === 4 ? 0.5 : 1 }}
                  exit={animated ? { y: -SOURCE_CARD_H, opacity: 0 } : { opacity: 0 }}
                  transition={spring}
                >
                  <span className="flex items-center gap-1.5 font-mono text-[8.5px] text-text-muted">
                    <span className="rounded bg-accent-primary/20 px-1 font-semibold text-accent-primary">
                      {item.lang}
                    </span>
                    <span className="truncate">{item.source}</span>
                    <span className="ml-auto">{format.clock(n * 47).slice(0, 5)}</span>
                  </span>
                  <span
                    lang={item.lang.toLowerCase()}
                    dir={item.rtl ? 'rtl' : undefined}
                    className="line-clamp-1 text-[10.5px] leading-snug text-text-primary"
                  >
                    {item.headline}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* AI-конвейер */}
      <div
        className="absolute flex flex-col rounded-xl border border-accent-primary/40 bg-bg-elevated/95 shadow-[0_0_40px_-16px_rgb(var(--accent-primary)/0.8)]"
        style={{ left: 212, top: 12, width: 220, height: 336 }}
      >
        <span className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-[10.5px] font-semibold text-text-primary">
          <Cpu size={12} className="shrink-0 text-accent-primary" />
          <span className="truncate">{text.pipeline}</span>
          {/* Метрика кейса — из контента, не дублируется */}
          <span
            className="ml-auto flex shrink-0 items-center gap-1 rounded-md border border-accent-secondary/40 px-1.5 py-0.5 font-display text-[11px] font-bold text-accent-secondary"
            title={cases.items.newsFeeder.metrics.languages}
          >
            <Languages size={10} />
            {languagesMetric}
          </span>
        </span>
        <div className="flex flex-1 flex-col gap-2.5 p-3">
          <div className="relative min-h-[54px] rounded-lg border border-border bg-bg-base/50 px-2.5 py-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`${cycle}-${translated ? 't' : 'o'}`}
                lang={translated ? i18n.language : story.lang.toLowerCase()}
                dir={!translated && story.rtl ? 'rtl' : undefined}
                className="line-clamp-2 text-[11px] font-medium leading-snug text-text-primary"
                initial={animated ? { opacity: 0, filter: 'blur(4px)' } : false}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={animated ? { opacity: 0, filter: 'blur(4px)' } : undefined}
                transition={fade}
              >
                {translated ? text.headlines[index] : story.headline}
              </motion.p>
            </AnimatePresence>
          </div>

          {STAGES.map((stage, stageIndex) => {
            const done = step > stageIndex;
            const current = step === stageIndex;
            return (
              <div
                key={stage}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-1 transition-colors duration-300',
                  current && 'bg-accent-primary/15',
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                    done
                      ? 'border-success bg-success text-bg-base'
                      : current
                        ? 'border-accent-primary'
                        : 'border-border',
                  )}
                >
                  {done ? <Check size={9} strokeWidth={3} /> : null}
                </span>
                <span
                  className={cn(
                    'w-[62px] shrink-0 font-mono text-[9.5px]',
                    current || done ? 'text-text-primary' : 'text-text-muted',
                  )}
                >
                  {stage}
                </span>
                <span className="min-w-0 flex-1 truncate text-right text-[9.5px] text-text-secondary">
                  {stage === 'translate' && done
                    ? `${story.lang} → ${i18n.language.toUpperCase()}`
                    : null}
                  {stage === 'dedupe' && done ? (
                    story.duplicate ? (
                      <span className="inline-flex items-center gap-1 text-warning">
                        <Copy size={9} />
                        {text.merged}
                      </span>
                    ) : (
                      text.unique
                    )
                  ) : null}
                  {stage === 'entities' && done ? (
                    <span className="rounded bg-accent-secondary/15 px-1 font-mono text-accent-secondary">
                      ${story.ticker}
                    </span>
                  ) : null}
                  {stage === 'sentiment' && done ? format.decimal(story.sentiment) : null}
                </span>
              </div>
            );
          })}

          {/* Шкала тональности −1…+1 */}
          <div className="mt-auto">
            <span className="flex justify-between font-mono text-[8.5px] text-text-muted">
              <span>−1</span>
              <span className="truncate px-1">{text.sentiment}</span>
              <span>+1</span>
            </span>
            <span className="relative mt-1 block h-1.5 rounded-full bg-gradient-to-r from-danger/60 via-text-muted/30 to-success/60">
              <motion.span
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg-elevated bg-text-primary"
                style={{ left: 0 }}
                initial={false}
                animate={{ x: step >= STEP.sentiment ? ((story.sentiment + 1) / 2) * 196 : 98 }}
                transition={spring}
              />
            </span>
          </div>
        </div>
      </div>

      {/* Сигналы */}
      <div
        className="absolute flex flex-col rounded-xl border border-border bg-bg-base/95"
        style={{ left: 446, top: 12, width: 182, height: 336 }}
      >
        <span className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-[10.5px] font-semibold text-text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="truncate">{text.signals}</span>
        </span>
        <div className="flex flex-col gap-1 p-2">
          {TICKERS.map(({ ticker }) => {
            const active = ticker === story.ticker && step === STEP.signal;
            const up = story.move >= 0;
            return (
              <div
                key={ticker}
                className="relative flex items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5"
              >
                {active && animated ? (
                  <motion.span
                    key={`flash-${cycle}`}
                    className={cn('absolute inset-0', up ? 'bg-success/20' : 'bg-danger/20')}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0.25 }}
                    transition={{ duration: DURATION.cinematic, ease: EASE.outExpo }}
                  />
                ) : null}
                <span className="relative font-mono text-[10.5px] font-semibold text-text-primary">
                  {ticker}
                </span>
                <RollingValue
                  value={format.decimal(priceOf(ticker))}
                  className="relative ml-auto font-mono text-[10.5px] text-text-secondary"
                />
                <span
                  className={cn(
                    'relative w-3',
                    active ? (up ? 'text-success' : 'text-danger') : 'text-transparent',
                  )}
                >
                  {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-auto border-t border-border p-3">
          <span className="block truncate text-[9.5px] text-text-muted">{text.index}</span>
          <div className="mt-2">
            <Sparkline
              values={moodWindow}
              width={154}
              height={40}
              tone="success"
              tick={cycle}
              domain={[0, 1]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
