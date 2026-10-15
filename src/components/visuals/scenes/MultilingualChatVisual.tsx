import { AnimatePresence, motion } from 'framer-motion';
import { Instagram, MessageCircle, Send, MessagesSquare, type LucideIcon } from 'lucide-react';
import { ChannelMark } from '@/components/ui/ChannelMark';
import { AgentAvatar } from '@/components/agent/AgentAvatar';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { pick } from '../pick';
import { RollingValue } from '../parts/RollingValue';
import { StreamedText } from '../parts/StreamedText';
import { TypingDots } from '../parts/TypingDots';
import { useVisualLoop } from '../useVisualLoop';

type Dialog = {
  badge: string;
  lang: string;
  channel: string;
  icon: LucideIcon;
  question: string;
  answer: string;
  /** Время ответа, секунды. */
  time: number;
};

/** Реплики — данные на языке клиента, не переводятся. Первым — японский (он же постер). */
const DIALOGS: readonly [Dialog, ...Dialog[]] = [
  {
    badge: 'JA',
    lang: 'ja',
    channel: 'LINE',
    icon: MessagesSquare,
    question: '明日の予約はできますか？',
    answer: 'はい、明日15時に空きがあります。予約しますか？',
    time: 1.1,
  },
  {
    badge: 'ES',
    lang: 'es',
    channel: 'WhatsApp',
    icon: MessageCircle,
    question: '¿Dónde está mi pedido?',
    answer: 'Su pedido #4821 ya está en camino. Llega mañana antes de las 14:00.',
    time: 0.9,
  },
  {
    badge: 'DE',
    lang: 'de',
    channel: 'Telegram',
    icon: Send,
    question: 'Haben Sie heute geöffnet?',
    answer: 'Ja, heute bis 20 Uhr. Soll ich einen Termin für Sie reservieren?',
    time: 0.8,
  },
  {
    badge: 'TH',
    lang: 'th',
    channel: 'Instagram',
    icon: Instagram,
    question: 'ส่งของถึงเมื่อไหร่คะ',
    answer: 'พัสดุของคุณจะถึงพรุ่งนี้ก่อนเที่ยงค่ะ',
    time: 0.7,
  },
];

/** Положение окна в стопке: 0 — переднее. */
const DEPTH = [
  { x: 28, y: 56, scale: 1, opacity: 1 },
  { x: 44, y: 34, scale: 0.93, opacity: 0.5 },
  { x: 60, y: 14, scale: 0.86, opacity: 0.25 },
] as const;

const WINDOWS = [0, 1, 2] as const;

/** Шаги: вопрос → агент печатает → ответ стримится → окна перетасовываются. */
const STEPS = [900, 1000, 2400, 700] as const;
const STEP = { question: 0, typing: 1, answer: 2, shuffle: 3 } as const;

/** «Агент поддержки» в карточке направления: один агент отвечает на любом языке, в любом канале. */
export function MultilingualChatVisual() {
  const text = useContent('visuals', 'multilingualChat');
  const format = useVisualFormat();
  const { animated, full } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.answer });
  const dialog = pick(DIALOGS, cycle);
  const front = cycle % WINDOWS.length;
  const resolved = 0.58 + (cycle % 4) / 100;
  const shuffle = full
    ? SPRING.soft
    : { duration: animated ? DURATION.slow : 0, ease: EASE.outExpo };

  return (
    <div className="absolute inset-0">
      <div className="absolute left-10 top-16 h-56 w-72 rounded-full bg-glow-cyan opacity-60 blur-2xl" />

      {WINDOWS.map((windowIndex) => {
        const depth = (windowIndex - front + WINDOWS.length) % WINDOWS.length;
        const placement = DEPTH[depth] ?? DEPTH[0];
        const shown = depth === 0 ? dialog : pick(DIALOGS, cycle + depth);
        return (
          <motion.div
            key={windowIndex}
            className="absolute left-0 top-0 flex h-[256px] w-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-[0_24px_60px_-30px_rgb(0_0_0/0.9)]"
            style={{ zIndex: WINDOWS.length - depth, transformOrigin: '50% 0%' }}
            initial={false}
            animate={placement}
            transition={shuffle}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-secondary/15 text-accent-secondary">
                <ChannelMark name={shown.channel} fallback={shown.icon} size={13} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-text-primary">
                {shown.channel}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={shown.badge}
                  className="rounded-md border border-accent-primary/40 bg-accent-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-primary"
                  initial={animated ? { y: -6, opacity: 0 } : false}
                  animate={{ y: 0, opacity: 1 }}
                  exit={animated ? { y: 6, opacity: 0 } : undefined}
                  transition={{ duration: animated ? DURATION.fast : 0 }}
                >
                  {shown.badge}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="relative flex flex-1 flex-col justify-end gap-2.5 bg-bg-base/40 p-3">
              {depth === 0 ? (
                <>
                  <motion.p
                    key={`q-${cycle}`}
                    lang={dialog.lang}
                    className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-accent-primary px-3 py-2 text-[12px] leading-snug text-white"
                    style={{ originX: 1, originY: 1 }}
                    initial={animated ? { opacity: 0, y: 10, scale: 0.9 } : false}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={animated ? SPRING.soft : { duration: 0 }}
                  >
                    {dialog.question}
                  </motion.p>
                  <AnimatePresence mode="wait" initial={false}>
                    {step === STEP.typing ? (
                      <motion.span
                        key="typing"
                        className="self-start rounded-2xl rounded-bl-md border border-accent-primary/30 bg-bg-surface px-3 py-2.5 text-text-secondary"
                        initial={animated ? { opacity: 0, y: 6 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: animated ? DURATION.fast : 0 }}
                      >
                        <TypingDots />
                      </motion.span>
                    ) : step >= STEP.answer ? (
                      <motion.div
                        key={`a-${cycle}`}
                        className="flex max-w-[88%] flex-col items-start gap-1 self-start"
                        initial={animated ? { opacity: 0, y: 8 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: animated ? DURATION.base : 0, ease: EASE.outExpo }}
                      >
                        <p
                          lang={dialog.lang}
                          className="rounded-2xl rounded-bl-md border border-border bg-bg-surface px-3 py-2 text-[12px] leading-snug text-text-primary"
                        >
                          <StreamedText
                            text={dialog.answer}
                            lang={dialog.lang}
                            animated={animated}
                          />
                        </p>
                        <span className="font-mono text-[9px] text-text-muted">
                          {text.reply} {format.seconds(dialog.time)}
                        </span>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  <span className="h-6 w-1/2 self-end rounded-xl bg-accent-primary/25" />
                  <span className="h-10 w-3/4 rounded-xl bg-text-muted/15" />
                </>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Доля обращений, решённых без оператора */}
      <div
        className="absolute flex w-[96px] flex-col gap-1 rounded-xl border border-border bg-bg-elevated/95 p-2.5"
        style={{ left: 372, top: 22 }}
      >
        <span className="line-clamp-2 text-[9.5px] leading-tight text-text-secondary">
          {text.resolved}
        </span>
        <RollingValue
          value={format.percent(resolved)}
          className="font-display text-[22px] font-bold leading-none text-success"
        />
        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-text-muted/20">
          <motion.span
            className="block h-full origin-left rounded-full bg-gradient-to-r from-accent-secondary to-success"
            initial={false}
            animate={{ scaleX: resolved }}
            transition={{ duration: animated ? DURATION.reveal : 0, ease: EASE.outExpo }}
          />
        </span>
      </div>

      <div className="absolute" style={{ left: 392, top: 262 }}>
        <span
          className={cn(
            'absolute -inset-2 rounded-full border border-accent-secondary/50 transition-opacity duration-300',
            step === STEP.typing ? 'opacity-100' : 'opacity-0',
          )}
        />
        <AgentAvatar size={48} active={step === STEP.typing} />
      </div>
    </div>
  );
}
