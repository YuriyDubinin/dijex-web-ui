import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  FileCode,
  FileText,
  Library,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AgentAvatar } from '@/components/agent/AgentAvatar';
import { CASES } from '@/content/home/cases';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { pick } from '../pick';
import { StreamedText } from '../parts/StreamedText';
import { TypingDots } from '../parts/TypingDots';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 640×360: чат продукта слева, база знаний в центре, источники ответа справа. */
const KB = { x: 226, y: 12, w: 244, h: 336 } as const;
const DOC_W = 68;
const DOC_H = 62;
const DOC_GAP = 8;
const GRID_X = KB.x + 12;
const GRID_Y = KB.y + 64;

/** Тип каждого из 9 документов базы (названия — visuals.ragAssistant.docs). */
const DOC_TYPES: readonly { icon: LucideIcon; label: string }[] = [
  { icon: FileText, label: 'PDF' },
  { icon: FileText, label: 'PDF' },
  { icon: BookOpen, label: 'WIKI' },
  { icon: FileText, label: 'DOC' },
  { icon: FileCode, label: 'API' },
  { icon: BookOpen, label: 'WIKI' },
  { icon: BookOpen, label: 'WIKI' },
  { icon: FileText, label: 'DOC' },
  { icon: FileText, label: 'PDF' },
];

/** Для каждого вопроса — три ближайших документа и их близость (косинусная, демо). */
type Retrieval = readonly (readonly [number, number])[];
const RETRIEVALS: readonly [Retrieval, ...Retrieval[]] = [
  [
    [8, 0.91],
    [0, 0.87],
    [1, 0.74],
  ],
  [
    [6, 0.93],
    [4, 0.81],
    [7, 0.69],
  ],
  [
    [2, 0.95],
    [7, 0.78],
    [0, 0.71],
  ],
];

/** «Облако эмбеддингов» — фиксированные точки за сеткой документов. */
const CLOUD = Array.from({ length: 34 }, (_, n) => ({
  x: KB.x + 16 + ((n * 67) % (KB.w - 32)),
  y: GRID_Y + 6 + ((n * 41) % (DOC_H * 3 + DOC_GAP * 2 - 12)),
}));

const docPosition = (index: number) => ({
  x: GRID_X + (index % 3) * (DOC_W + DOC_GAP),
  y: GRID_Y + Math.floor(index / 3) * (DOC_H + DOC_GAP),
});

/** Шаги: вопрос → скан базы → отбор трёх документов → ответ стримится → пауза со сносками. */
const STEPS = [900, 1300, 1100, 2200, 1600] as const;
const STEP = { question: 0, scan: 1, select: 2, answer: 3, hold: 4 } as const;

/** Кейс «AI-ассистент поддержки»: ответы по базе знаний клиента (RAG) прямо в чате продукта. */
export function RagAssistantVisual() {
  const text = useContent('visuals', 'ragAssistant');
  const cases = useContent('home', 'cases');
  const { i18n } = useTranslation();
  const format = useVisualFormat();
  const { animated, interactive } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.hold });
  const [hovered, setHovered] = useState<number | null>(null);
  const index = cycle % RETRIEVALS.length;
  const retrieval = pick(RETRIEVALS, index);
  const chosen = retrieval.map(([doc]) => doc);
  const selected = step >= STEP.select;
  const automated = CASES.find((item) => item.key === 'aiAssistant')?.metrics[0]?.value ?? '';
  const automatedShare = Number.parseFloat(automated) / 100 || 0;
  const spring = animated ? SPRING.soft : { duration: 0 };
  const fade = { duration: animated ? DURATION.base : 0, ease: EASE.outExpo };
  // Подсветка источника: наведённая сноска или по очереди в паузе
  const focusedSource = hovered ?? (step === STEP.hold ? cycle % 3 : null);
  const queryPoint = { x: KB.x + KB.w / 2, y: KB.y + 44 };

  return (
    <div className="absolute inset-0">
      <div className="absolute left-56 top-16 h-60 w-60 rounded-full bg-glow-cyan opacity-70 blur-3xl" />

      {/* Чат продукта */}
      <div
        className="absolute flex flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated/95"
        style={{ left: 12, top: 12, width: 200, height: 336 }}
      >
        <span className="flex items-center gap-2 border-b border-border px-3 py-2">
          <AgentAvatar size={22} active={step === STEP.answer} />
          <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold text-text-primary">
            {text.assistant}
          </span>
          <MessageSquare size={12} className="shrink-0 text-text-muted" />
        </span>
        <div
          className="flex flex-1 flex-col justify-end gap-2 bg-bg-base/40 p-2.5"
          lang={i18n.language}
        >
          <motion.p
            key={`q-${cycle}`}
            className="max-w-[88%] self-end rounded-2xl rounded-br-md bg-accent-primary px-2.5 py-1.5 text-[10.5px] leading-snug text-white"
            initial={animated ? { opacity: 0, y: 8, scale: 0.92 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring}
          >
            {text.questions[index]}
          </motion.p>
          <AnimatePresence mode="wait" initial={false}>
            {step >= STEP.answer ? (
              <motion.div
                key={`a-${cycle}`}
                className="flex max-w-[94%] flex-col gap-1.5 self-start"
                initial={animated ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={fade}
              >
                <p className="rounded-2xl rounded-bl-md border border-border bg-bg-surface px-2.5 py-1.5 text-[10.5px] leading-snug text-text-primary">
                  <StreamedText
                    text={text.answers[index] ?? ''}
                    lang={i18n.language}
                    animated={animated}
                    wordDelay={0.05}
                  />
                </p>
                <span className="flex gap-1">
                  {chosen.map((doc, source) => (
                    <span
                      key={doc}
                      className={cn(
                        'cursor-default rounded-md border px-1.5 py-0.5 font-mono text-[9px] transition-colors duration-300',
                        focusedSource === source
                          ? 'border-accent-secondary bg-accent-secondary/20 text-accent-secondary'
                          : 'border-border text-text-muted',
                      )}
                      onPointerEnter={interactive ? () => setHovered(source) : undefined}
                      onPointerLeave={interactive ? () => setHovered(null) : undefined}
                    >
                      [{source + 1}]
                    </span>
                  ))}
                </span>
              </motion.div>
            ) : step >= STEP.scan ? (
              <motion.span
                key="typing"
                className="self-start rounded-2xl rounded-bl-md border border-accent-primary/30 bg-bg-surface px-3 py-2 text-text-secondary"
                initial={animated ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              >
                <TypingDots />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* База знаний */}
      <div
        className="absolute overflow-hidden rounded-xl border border-border bg-bg-elevated/90"
        style={{ left: KB.x, top: KB.y, width: KB.w, height: KB.h }}
      >
        <span className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-[10.5px] font-semibold text-text-primary">
          <Library size={12} className="shrink-0 text-accent-secondary" />
          <span className="truncate">{text.knowledgeBase}</span>
          <span className="ml-auto shrink-0 font-mono text-[9px] font-normal text-text-muted">
            {format.integer(1284)} docs
          </span>
        </span>
      </div>

      {/* Облако эмбеддингов и связи вопроса с ближайшими документами */}
      <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full overflow-visible">
        {CLOUD.map((point, n) => (
          <circle
            key={n}
            cx={point.x}
            cy={point.y}
            r={1.4}
            fill="rgb(var(--accent-primary))"
            opacity={0.35}
          />
        ))}
        {chosen.map((doc, source) => {
          const { x, y } = docPosition(doc);
          return (
            <motion.path
              key={`${cycle}-${doc}`}
              d={`M ${queryPoint.x} ${queryPoint.y} L ${x + DOC_W / 2} ${y + DOC_H / 2}`}
              fill="none"
              stroke="rgb(var(--accent-secondary))"
              strokeWidth={1.25}
              strokeDasharray="3 3"
              initial={false}
              animate={{ pathLength: selected ? 1 : 0, opacity: selected ? 0.8 : 0 }}
              transition={{
                duration: animated ? DURATION.slow : 0,
                ease: EASE.outExpo,
                delay: animated && selected ? source * 0.12 : 0,
              }}
            />
          );
        })}
        <circle
          cx={queryPoint.x}
          cy={queryPoint.y}
          r={4}
          fill="rgb(var(--accent-secondary))"
          opacity={step >= STEP.scan ? 1 : 0.3}
        />
      </svg>

      {/* Документы */}
      {DOC_TYPES.map((type, doc) => {
        const { x, y } = docPosition(doc);
        const rank = chosen.indexOf(doc);
        const isChosen = selected && rank >= 0;
        const Icon = type.icon;
        const score = retrieval[rank]?.[1];
        return (
          <motion.div
            key={doc}
            className={cn(
              'absolute flex flex-col gap-1 rounded-lg border p-1.5 transition-[border-color,box-shadow,opacity] duration-500',
              isChosen
                ? focusedSource === rank
                  ? 'border-accent-secondary bg-bg-elevated shadow-[0_0_24px_-6px_rgb(var(--accent-secondary)/0.9)]'
                  : 'border-accent-secondary/60 bg-bg-elevated'
                : 'border-border bg-bg-base/80',
              selected && !isChosen && 'opacity-40',
            )}
            style={{ left: x, top: y, width: DOC_W, height: DOC_H }}
            initial={false}
            animate={{ y: isChosen ? -4 : 0 }}
            transition={spring}
          >
            <span className="flex items-center gap-1 font-mono text-[7.5px] text-text-muted">
              <Icon size={10} className={isChosen ? 'text-accent-secondary' : undefined} />
              {type.label}
              {isChosen && score !== undefined ? (
                <span className="ml-auto rounded bg-accent-secondary/20 px-0.5 font-semibold text-accent-secondary">
                  {format.decimal(score)}
                </span>
              ) : null}
            </span>
            <span className="line-clamp-2 text-[8.5px] leading-tight text-text-primary">
              {text.docs[doc]}
            </span>
            <span className="mt-auto flex flex-col gap-0.5">
              <span
                className={cn(
                  'h-0.5 rounded-full transition-colors duration-500',
                  isChosen ? 'bg-accent-secondary' : 'bg-text-muted/25',
                )}
              />
              <span className="h-0.5 w-3/4 rounded-full bg-text-muted/25" />
            </span>
          </motion.div>
        );
      })}

      {/* Луч сканирования */}
      {step === STEP.scan && animated ? (
        <motion.span
          key={`scan-${cycle}`}
          className="pointer-events-none absolute h-6 bg-gradient-to-b from-transparent via-accent-secondary/30 to-transparent"
          style={{ left: KB.x + 1, width: KB.w - 2, top: GRID_Y - 12 }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: DOC_H * 3 + DOC_GAP * 2, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.2, ease: EASE.inOut }}
        />
      ) : null}

      {/* Источники и метрика кейса */}
      <div
        className="absolute flex flex-col gap-2 rounded-xl border border-border bg-bg-elevated/95 p-2.5"
        style={{ left: 484, top: 12, width: 144, height: 336 }}
      >
        <span className="truncate text-[10.5px] font-semibold text-text-primary">
          {text.sources}
        </span>
        {chosen.map((doc, source) => (
          <motion.div
            key={`${cycle}-${doc}`}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors duration-300',
              focusedSource === source && selected
                ? 'border-accent-secondary/70 bg-accent-secondary/10'
                : 'border-border',
            )}
            initial={false}
            animate={{ opacity: selected ? 1 : 0.25 }}
            transition={{ ...fade, delay: animated && selected ? source * 0.12 : 0 }}
          >
            <span className="font-mono text-[9px] text-accent-secondary">[{source + 1}]</span>
            <span className="min-w-0 flex-1 truncate text-[9.5px] text-text-primary">
              {text.docs[doc]}
            </span>
          </motion.div>
        ))}
        <div className="mt-auto rounded-lg border border-success/30 bg-success/10 p-2">
          <span className="font-display text-[20px] font-bold leading-none text-success">
            {automated}
          </span>
          <span className="mt-1 line-clamp-2 block text-[9px] leading-tight text-text-secondary">
            {cases.items.aiAssistant.metrics.automated}
          </span>
          <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-text-muted/20">
            <motion.span
              className="block h-full origin-left rounded-full bg-gradient-to-r from-accent-secondary to-success"
              initial={animated ? { scaleX: 0 } : false}
              animate={{ scaleX: automatedShare }}
              transition={{
                duration: animated ? DURATION.cinematic : 0,
                ease: EASE.outExpo,
                delay: animated ? 0.4 : 0,
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
