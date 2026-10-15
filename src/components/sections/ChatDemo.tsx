import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AgentAvatar } from '@/components/agent/AgentAvatar';
import { ChannelMark } from '@/components/ui/ChannelMark';
import { ICONS } from '@/components/ui/iconMap';
import { StreamedText } from '@/components/visuals/parts/StreamedText';
import { CHAT_SCENARIOS, type ChatMessage } from '@/content/home/support';
import { useContent } from '@/i18n/useContent';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';

const DELAY_FIRST = 500;
const DELAY_CUSTOMER = 1000;
const DELAY_BEFORE_TYPING = 450;
const DELAY_TYPING = 1400;
const DELAY_NEXT_SCENARIO = 3500;

/** Полная длительность сценария — для полоски автоплея. */
function scenarioDuration(messages: readonly ChatMessage[]) {
  return (
    DELAY_FIRST +
    messages.reduce(
      (total, message, index) =>
        total +
        (index === 0
          ? 0
          : message.from === 'agent'
            ? DELAY_BEFORE_TYPING + DELAY_TYPING
            : DELAY_CUSTOMER),
      0,
    ) +
    DELAY_NEXT_SCENARIO
  );
}

export type ChatActivity = { channel: string; key: number };

type Props = {
  className?: string;
  /** Каждое новое сообщение — сигнал «ядру» агента (вспышка и подсветка канала). */
  onActivity?: (activity: ChatActivity) => void;
};

function TypingIndicator({ label }: { label: string }) {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DURATION.fast }}
    >
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-accent-primary/30 bg-bg-surface px-4 py-3 shadow-[0_0_24px_-8px_rgb(var(--accent-primary)/0.6)]">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-text-secondary"
            style={{ animationDelay: `${dot * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-text-muted">{label}</span>
    </motion.div>
  );
}

/**
 * Демо-окно мессенджера: диалоги на разных языках проигрываются по одному сообщению, пока окно в viewport.
 * Наведение ставит автоплей на паузу. Реплики — данные (не переводятся), подписи интерфейса — из переводов.
 */
export function ChatDemo({ className, onActivity }: Props) {
  const { t, i18n } = useTranslation('home');
  const chat = useContent('home', 'support').chat;
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const [paused, setPaused] = useState(false);

  // Первым показываем диалог на языке, отличном от языка сайта, — так мультиязычность заметнее
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      CHAT_SCENARIOS.findIndex((scenario) => !i18n.language.startsWith(scenario.lang)),
    ),
  );
  const scenario = CHAT_SCENARIOS[index] ?? CHAT_SCENARIOS[0];
  const total = scenario?.messages.length ?? 0;
  const [shown, setShown] = useState(animated ? 0 : total);
  const [typing, setTyping] = useState(false);
  const visibleCount = animated ? shown : total;
  const running = inView && animated && !paused;

  useEffect(() => {
    if (!running || !scenario) return undefined;

    let timer: number;
    if (shown < total) {
      const next = scenario.messages[shown];
      if (next?.from === 'agent' && !typing) {
        timer = window.setTimeout(() => setTyping(true), DELAY_BEFORE_TYPING);
      } else if (typing) {
        timer = window.setTimeout(() => {
          setTyping(false);
          setShown((value) => value + 1);
        }, DELAY_TYPING);
      } else {
        timer = window.setTimeout(
          () => setShown((value) => value + 1),
          shown === 0 ? DELAY_FIRST : DELAY_CUSTOMER,
        );
      }
    } else {
      timer = window.setTimeout(() => {
        setIndex((value) => (value + 1) % CHAT_SCENARIOS.length);
        setShown(0);
      }, DELAY_NEXT_SCENARIO);
    }
    return () => window.clearTimeout(timer);
  }, [running, scenario, shown, total, typing]);

  // Сигнал «ядру» на каждое новое сообщение
  useEffect(() => {
    if (shown > 0 && scenario)
      onActivity?.({ channel: scenario.channel, key: index * 100 + shown });
  }, [shown, index, scenario, onActivity]);

  const selectScenario = (next: number) => {
    setIndex(next);
    setTyping(false);
    setShown(animated ? 0 : (CHAT_SCENARIOS[next]?.messages.length ?? 0));
  };

  if (!scenario) return null;

  const showHandoff = scenario.handoff && visibleCount >= total;
  const duration = scenarioDuration(scenario.messages);

  return (
    <div
      ref={rootRef}
      className={cn('relative', className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] bg-glow-indigo opacity-40 blur-3xl"
      />
      <div
        role="region"
        aria-label={chat.demoLabel}
        className="relative overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-glow"
      >
        {/* Шапка окна */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="relative">
            <AgentAvatar size={40} active={typing} />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg-elevated bg-success" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-small font-semibold text-text-primary">{chat.agentName}</p>
            <p className="text-xs text-success">{typing ? chat.typing : chat.status}</p>
          </div>
          <div className="flex items-center gap-2 [perspective:400px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={scenario.channel}
                initial={animated ? { rotateX: 90, opacity: 0 } : false}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={animated ? { rotateX: -90, opacity: 0 } : undefined}
                transition={{ duration: DURATION.fast }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-2.5 py-1 text-xs text-text-secondary"
              >
                <ChannelMark
                  name={scenario.channel}
                  fallback={ICONS[scenario.channelIcon]}
                  size={12}
                  tint="always"
                  className="text-accent-secondary"
                />
                {scenario.channel}
              </motion.span>
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={scenario.badge}
                initial={animated ? { y: -8, opacity: 0, filter: 'blur(4px)' } : false}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={animated ? { y: 8, opacity: 0, filter: 'blur(4px)' } : undefined}
                transition={{ duration: DURATION.fast }}
                title={chat.languageBadge}
                className="rounded-md border border-accent-primary/40 bg-accent-primary/15 px-2 py-1 font-mono text-xs font-semibold text-accent-primary"
              >
                {scenario.badge}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Сообщения */}
        <div className="relative min-h-[22rem] bg-bg-base/40 sm:min-h-[24rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={scenario.id}
              role="log"
              aria-live="off"
              className="absolute inset-0 flex flex-col justify-end gap-3 px-4 py-5"
              exit={animated ? { opacity: 0, y: -24, filter: 'blur(6px)' } : { opacity: 0 }}
              transition={{ duration: DURATION.base, ease: EASE.sharp }}
            >
              {scenario.messages.slice(0, visibleCount).map((message, messageIndex) => (
                <motion.div
                  key={messageIndex}
                  lang={scenario.lang}
                  initial={
                    animated ? { opacity: 0, y: 12, scale: 0.9, filter: 'blur(6px)' } : false
                  }
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  transition={SPRING.soft}
                  style={{ originX: message.from === 'customer' ? 1 : 0, originY: 1 }}
                  className={cn(
                    'max-w-[85%] whitespace-pre-line px-4 py-2.5 text-small leading-relaxed',
                    message.from === 'customer'
                      ? 'self-end rounded-2xl rounded-br-md bg-accent-primary text-white'
                      : 'self-start rounded-2xl rounded-bl-md border border-border bg-bg-surface text-text-primary',
                  )}
                >
                  {message.from === 'agent' ? (
                    <StreamedText text={message.text} lang={scenario.lang} animated={animated} />
                  ) : (
                    message.text
                  )}
                </motion.div>
              ))}

              <AnimatePresence>
                {typing ? <TypingIndicator key="typing" label={chat.typing} /> : null}
              </AnimatePresence>

              <AnimatePresence>
                {showHandoff ? (
                  <motion.div
                    initial={animated ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mx-auto flex items-center gap-2 overflow-hidden rounded-full border border-accent-secondary/30 bg-accent-secondary/10 py-1.5 pl-1.5 pr-3 text-xs text-accent-secondary"
                  >
                    {/* Оператор «подключается»: кольцо прорисовывается вокруг иконки */}
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <svg aria-hidden viewBox="0 0 24 24" className="absolute inset-0 -rotate-90">
                        <motion.circle
                          cx="12"
                          cy="12"
                          r="10.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          initial={animated ? { pathLength: 0 } : false}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: DURATION.reveal, ease: EASE.outExpo }}
                        />
                      </svg>
                      <UserCheck size={12} aria-hidden />
                    </span>
                    {chat.handoff}
                    {animated ? (
                      <motion.span
                        aria-hidden
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        initial={{ x: '-120%' }}
                        animate={{ x: '320%' }}
                        transition={{ duration: 0.9, delay: 0.3, ease: EASE.inOut }}
                      />
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Переключатель сценариев: у активного — полоска автоплея */}
        <div className="flex items-center justify-center gap-1 border-t border-border py-2">
          {CHAT_SCENARIOS.map((item, scenarioIndex) => {
            const current = scenarioIndex === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectScenario(scenarioIndex)}
                aria-label={t('support.chat.scenario', { n: scenarioIndex + 1 })}
                aria-current={current ? 'true' : undefined}
                className="flex h-8 min-w-6 items-center justify-center px-1.5"
              >
                <span
                  aria-hidden
                  className={cn(
                    'relative block h-1.5 overflow-hidden rounded-full bg-text-muted/40 transition-[width] duration-300',
                    current ? 'w-8' : 'w-1.5',
                  )}
                >
                  {current && animated ? (
                    <span
                      key={`${item.id}-${index}`}
                      className="absolute inset-0 origin-left animate-fill-bar bg-accent-primary"
                      style={{
                        animationDuration: `${duration}ms`,
                        animationPlayState: running ? 'running' : 'paused',
                      }}
                    />
                  ) : current ? (
                    <span className="absolute inset-0 bg-accent-primary" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
