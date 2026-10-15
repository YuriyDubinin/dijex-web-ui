import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, MessageCircle, Search, Send, Sparkles, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { StreamedText } from '../parts/StreamedText';
import { useVisualTicker } from '../useVisualLoop';

type Channel = 'WhatsApp' | 'Telegram' | 'Email';

const CHANNEL_ICON: Record<Channel, LucideIcon> = {
  WhatsApp: MessageCircle,
  Telegram: Send,
  Email: Mail,
};

/** Контакты — данные (имена не переводятся). */
const CONTACTS: readonly { name: string; initials: string; channel: Channel }[] = [
  { name: 'Anna K.', initials: 'AK', channel: 'WhatsApp' },
  { name: 'Marco R.', initials: 'MR', channel: 'Telegram' },
  { name: 'Li Wei', initials: 'LW', channel: 'Email' },
  { name: 'Sara M.', initials: 'SM', channel: 'WhatsApp' },
  { name: 'Tom B.', initials: 'TB', channel: 'Telegram' },
];

const FILTERS: readonly (Channel | 'all')[] = ['all', 'WhatsApp', 'Telegram', 'Email'];

/** В какой диалог приходит очередное сообщение (диалог поднимается наверх списка). */
const ARRIVALS = [3, 1, 4, 2, 1, 3, 2, 4, 1, 3] as const;
const ROW_H = 50;
/** Фазы сценария открытого диалога (по тику). */
const DIALOG_PHASES = 7;

function listState(tick: number) {
  const order = CONTACTS.map((_, index) => index);
  const unread = CONTACTS.map(() => 0);
  const count = tick % ARRIVALS.length;
  for (let index = 0; index < count; index += 1) {
    const contact = ARRIVALS[index] ?? 1;
    order.splice(order.indexOf(contact), 1);
    order.unshift(contact);
    unread[contact] = Math.min(9, (unread[contact] ?? 0) + 1);
  }
  return { order, unread, latest: count > 0 ? (ARRIVALS[count - 1] ?? null) : null };
}

/** Вкладка «Платформы сообщений»: единый inbox — диалоги из всех каналов, AI-подсказка ответа. */
export function MessagingPlatformVisual() {
  const text = useContent('visuals', 'messagingPlatform');
  const { i18n } = useTranslation();
  const { animated, interactive } = useVisual();
  const tick = useVisualTicker(1800);
  const [chipHovered, setChipHovered] = useState(false);
  const { order, unread, latest } = useMemo(() => listState(tick), [tick]);
  const filter = FILTERS[Math.floor(tick / 5) % FILTERS.length] ?? 'all';
  const phase = (tick + 5) % DIALOG_PHASES;
  const round = Math.floor((tick + 5) / DIALOG_PHASES);
  const shownMessages = Math.min(3, phase + 1);
  const suggestion = phase >= 3;
  const expanded = phase >= 4 || chipHovered;
  const spring = animated ? SPRING.soft : { duration: 0 };
  const bubble = (from: 'customer' | 'operator') =>
    from === 'customer'
      ? 'self-start rounded-2xl rounded-bl-md border border-border bg-bg-surface text-text-primary'
      : 'self-end rounded-2xl rounded-br-md bg-accent-primary text-white';

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated/95 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]">
      {/* Фильтры каналов */}
      <div className="flex items-center gap-3 border-b border-border px-3 py-2">
        <div className="flex min-w-0 gap-0.5 rounded-lg bg-bg-base/60 p-0.5">
          {FILTERS.map((item) => {
            const current = item === filter;
            return (
              <span
                key={item}
                className={cn(
                  'relative truncate rounded-md px-2.5 py-1 text-[10.5px] font-medium transition-colors duration-300',
                  current ? 'text-text-primary' : 'text-text-muted',
                )}
              >
                <span
                  className={cn(
                    'absolute inset-0 rounded-md bg-accent-primary/25 transition-opacity duration-300',
                    current ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="relative">{item === 'all' ? text.all : item}</span>
              </span>
            );
          })}
        </div>
        <span className="ml-auto flex min-w-0 items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-[10px] text-text-muted">
          <Search size={11} className="shrink-0" />
          <span className="truncate">{text.search}</span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Список диалогов */}
        <div className="relative w-[212px] shrink-0 border-r border-border">
          {CONTACTS.map((contact, index) => {
            const position = order.indexOf(index);
            const Icon = CHANNEL_ICON[contact.channel];
            const matches = filter === 'all' || filter === contact.channel;
            const count = index === 0 ? 0 : (unread[index] ?? 0);
            return (
              <motion.div
                key={contact.name}
                className={cn(
                  'absolute inset-x-0 top-0 flex items-center gap-2.5 px-3',
                  index === 0 && 'bg-accent-primary/10',
                )}
                style={{ height: ROW_H }}
                initial={false}
                animate={{ y: position * ROW_H, opacity: matches ? 1 : 0.35 }}
                transition={spring}
              >
                {index === 0 ? (
                  <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent-primary" />
                ) : null}
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-primary/40 to-accent-secondary/30 font-mono text-[9.5px] font-semibold text-text-primary">
                  {contact.initials}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-bg-elevated bg-bg-surface text-accent-secondary">
                    <Icon size={8} />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold text-text-primary">
                    {contact.name}
                  </span>
                  <span className="block truncate text-[10px] text-text-muted">
                    {text.previews[index]}
                  </span>
                </span>
                <AnimatePresence>
                  {count > 0 ? (
                    <motion.span
                      key={`${index}-${count}`}
                      className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-secondary px-1 font-mono text-[9px] font-bold text-bg-base"
                      initial={animated ? { scale: 0.4 } : false}
                      animate={{ scale: latest === index ? [1.35, 1] : 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: animated ? DURATION.base : 0, ease: EASE.outExpo }}
                    >
                      {count}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Открытый диалог */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2.5 border-b border-border px-3 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-primary/40 to-accent-secondary/30 font-mono text-[9px] font-semibold text-text-primary">
              AK
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-semibold text-text-primary">
                Anna K.
              </span>
              <span className="flex items-center gap-1 text-[9.5px] text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {text.online}
              </span>
            </span>
            <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[9.5px] text-text-secondary">
              <MessageCircle size={10} className="text-accent-secondary" />
              WhatsApp
            </span>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col justify-end gap-2 bg-bg-base/40 p-3"
            lang={i18n.language}
          >
            {text.messages.slice(0, shownMessages).map((message, index) => (
              <motion.p
                key={`${index}-${round}`}
                className={cn(
                  'max-w-[80%] px-3 py-1.5 text-[11px] leading-snug',
                  bubble(index === 1 ? 'operator' : 'customer'),
                )}
                style={{ originY: 1, originX: index === 1 ? 1 : 0 }}
                initial={animated ? { opacity: 0, y: 8, scale: 0.92 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={spring}
              >
                {message}
              </motion.p>
            ))}
          </div>

          {/* AI-подсказка над полем ввода */}
          <div className="flex flex-col gap-2 border-t border-border p-2.5">
            <AnimatePresence initial={false}>
              {suggestion ? (
                <motion.div
                  key="suggestion"
                  className={cn(
                    'overflow-hidden rounded-xl border border-accent-glow/40 bg-accent-glow/10',
                    interactive && 'cursor-default',
                  )}
                  initial={animated ? { opacity: 0, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: animated ? DURATION.base : 0 }}
                  onPointerEnter={interactive ? () => setChipHovered(true) : undefined}
                  onPointerLeave={interactive ? () => setChipHovered(false) : undefined}
                >
                  <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-accent-glow">
                    <Sparkles size={11} />
                    {text.aiSuggestion}
                  </span>
                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.p
                        key="draft"
                        lang={i18n.language}
                        className="px-2.5 pb-2 text-[10.5px] leading-snug text-text-primary"
                        initial={animated ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: animated ? DURATION.fast : 0 }}
                      >
                        <StreamedText
                          text={text.draft}
                          lang={i18n.language}
                          animated={animated}
                          wordDelay={0.06}
                        />
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-base/60 px-2.5 py-1.5">
              <span className="h-1.5 flex-1 rounded-full bg-text-muted/15" />
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-primary text-white">
                <Send size={10} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
