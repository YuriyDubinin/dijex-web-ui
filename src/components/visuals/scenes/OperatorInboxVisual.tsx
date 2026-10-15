import { AnimatePresence, motion } from 'framer-motion';
import {
  Languages,
  Mail,
  MessageCircle,
  MessagesSquare,
  Send,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { ChannelMark } from '@/components/ui/ChannelMark';
import { useTranslation } from 'react-i18next';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { StatusPill } from '../parts/StatusPill';
import { StreamedText } from '../parts/StreamedText';
import { useVisualLoop } from '../useVisualLoop';

/** Диалоги в списке — данные (имена не переводятся). */
const CONVERSATIONS: readonly {
  name: string;
  initials: string;
  lang: string;
  channel: string;
  icon: LucideIcon;
  byOperator: boolean;
}[] = [
  {
    name: 'María G.',
    initials: 'MG',
    lang: 'ES',
    channel: 'WhatsApp',
    icon: MessageCircle,
    byOperator: false,
  },
  {
    name: 'Jonas W.',
    initials: 'JW',
    lang: 'DE',
    channel: 'Telegram',
    icon: Send,
    byOperator: false,
  },
  {
    name: 'Yuki T.',
    initials: 'YT',
    lang: 'JA',
    channel: 'LINE',
    icon: MessagesSquare,
    byOperator: false,
  },
  { name: 'Léa M.', initials: 'LM', lang: 'FR', channel: 'Email', icon: Mail, byOperator: true },
];

/** Реплики клиента и отправляемый перевод — на испанском, это данные. */
const CUSTOMER_ORIGINAL = '¡Hola! ¿Puedo cambiar la entrega al viernes?';
const REPLY_SPANISH = 'Claro, hemos cambiado su entrega al viernes.';

/** Шаги: сообщение на испанском → перевод → AI-резюме → оператор пишет → уходит перевод, диалог у оператора. */
const STEPS = [1300, 1300, 1700, 1800, 2200] as const;
const STEP = { original: 0, translated: 1, summary: 2, typing: 3, sent: 4 } as const;

/** Страница агента поддержки, «Каналы»: рабочее место оператора — перевод, резюме, ответ на языке клиента. */
export function OperatorInboxVisual() {
  const text = useContent('visuals', 'operatorInbox');
  const { i18n } = useTranslation();
  const { animated } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.sent });
  const translated = step >= STEP.translated;
  const handedOver = step >= STEP.sent;
  const fade = { duration: animated ? DURATION.base : 0, ease: EASE.outExpo };
  const spring = animated ? SPRING.soft : { duration: 0 };

  return (
    <div className="absolute inset-3 flex overflow-hidden rounded-2xl border border-border bg-bg-elevated/95 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]">
      {/* Список диалогов */}
      <div className="flex w-[164px] shrink-0 flex-col border-r border-border bg-bg-base/40">
        <span className="truncate border-b border-border px-3 py-2.5 text-[10.5px] font-semibold text-text-primary">
          {text.conversations}
        </span>
        {CONVERSATIONS.map((conversation, index) => {
          const operator = conversation.byOperator || (index === 0 && handedOver);
          return (
            <div
              key={conversation.name}
              className={cn(
                'relative flex items-center gap-2 px-2.5 py-2',
                index === 0 && 'bg-accent-primary/10',
              )}
            >
              {index === 0 ? (
                <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent-primary" />
              ) : null}
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-primary/40 to-accent-secondary/30 font-mono text-[8.5px] font-semibold text-text-primary">
                {conversation.initials}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-bg-elevated bg-bg-surface text-accent-secondary">
                  <ChannelMark name={conversation.channel} fallback={conversation.icon} size={8} />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10.5px] font-medium text-text-primary">
                  {conversation.name}
                </span>
                <span className="font-mono text-[8.5px] text-text-muted">{conversation.lang}</span>
              </span>
              <StatusPill
                tone={operator ? 'secondary' : 'primary'}
                dot={false}
                className="max-w-[58px] shrink-0 px-1.5 text-[8.5px]"
              >
                {operator ? text.operator : text.ai}
              </StatusPill>
            </div>
          );
        })}
      </div>

      {/* Открытый диалог */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-text-primary">
            María García
          </span>
          <span className="rounded-md border border-accent-primary/40 bg-accent-primary/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-accent-primary">
            ES
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={handedOver ? 'operator' : 'ai'}
              initial={animated ? { opacity: 0, scale: 0.8 } : false}
              animate={{ opacity: 1, scale: 1 }}
              exit={animated ? { opacity: 0, scale: 0.8 } : undefined}
              transition={{ duration: animated ? DURATION.fast : 0 }}
            >
              <StatusPill tone={handedOver ? 'secondary' : 'primary'} className="max-w-[90px]">
                {handedOver ? text.operator : text.ai}
              </StatusPill>
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-end gap-2.5 bg-bg-base/40 p-3">
          {/* Переключатель оригинал / перевод */}
          <div className="flex self-start rounded-lg bg-bg-surface p-0.5 text-[9.5px] font-medium">
            {[text.original, text.translation].map((label, index) => {
              const current = (index === 1) === translated;
              return (
                <span
                  key={label}
                  className={cn(
                    'relative max-w-[110px] truncate rounded-md px-2 py-0.5 transition-colors duration-300',
                    current ? 'text-text-primary' : 'text-text-muted',
                  )}
                >
                  <span
                    className={cn(
                      'absolute inset-0 rounded-md bg-accent-primary/25 transition-opacity duration-300',
                      current ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="relative inline-flex items-center gap-1">
                    {index === 1 ? <Languages size={9} /> : null}
                    {label}
                  </span>
                </span>
              );
            })}
          </div>
          <div className="relative max-w-[86%] self-start rounded-2xl rounded-tl-md border border-border bg-bg-surface px-3 py-2 text-[11px] leading-snug text-text-primary">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={translated ? 'translated' : 'original'}
                lang={translated ? i18n.language : 'es'}
                className="block"
                initial={animated ? { opacity: 0, filter: 'blur(4px)' } : false}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={animated ? { opacity: 0, filter: 'blur(4px)' } : undefined}
                transition={fade}
              >
                {translated ? text.customerMessage : CUSTOMER_ORIGINAL}
              </motion.span>
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false}>
            {step >= STEP.typing ? (
              <motion.div
                key={`reply-${cycle}`}
                className="flex max-w-[86%] flex-col items-end gap-1 self-end"
                initial={animated ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
              >
                <p
                  lang={i18n.language}
                  className="rounded-2xl rounded-br-md bg-accent-primary px-3 py-2 text-[11px] leading-snug text-white"
                >
                  <StreamedText
                    text={text.reply}
                    lang={i18n.language}
                    animated={animated}
                    wordDelay={0.07}
                  />
                </p>
                <AnimatePresence>
                  {handedOver ? (
                    <motion.span
                      className="flex max-w-full flex-col items-end text-right"
                      initial={animated ? { opacity: 0, y: 4 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={fade}
                    >
                      <span className="flex max-w-full items-center gap-1 text-[9px] text-accent-secondary">
                        <Languages size={9} className="shrink-0" />
                        <span className="truncate">{text.sendsAs}</span>
                      </span>
                      <span lang="es" className="line-clamp-2 text-[9.5px] italic text-text-muted">
                        {REPLY_SPANISH}
                      </span>
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Карточка клиента и AI-резюме */}
      <div className="flex w-[168px] shrink-0 flex-col gap-3 border-l border-border p-3">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient font-mono text-[12px] font-semibold text-white">
            MG
          </span>
          <span className="max-w-full truncate text-[11px] font-semibold text-text-primary">
            María García
          </span>
          <span className="font-mono text-[9px] text-text-muted">Madrid · ES</span>
          <StatusPill tone="muted" dot={false}>
            {text.customer}
          </StatusPill>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-xl border border-accent-glow/40 bg-accent-glow/10 p-2.5">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-accent-glow">
            <Sparkles size={11} className="shrink-0" />
            <span className="truncate">{text.summary}</span>
          </span>
          {text.summaryItems.map((item, index) => (
            <AnimatePresence key={item} initial={false}>
              {step >= STEP.summary ? (
                <motion.span
                  key={`${item}-${cycle}`}
                  lang={i18n.language}
                  className="flex items-start gap-1.5 text-[9.5px] leading-snug text-text-primary"
                  initial={animated ? { opacity: 0, x: -4 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ ...fade, delay: animated ? index * 0.35 : 0 }}
                >
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent-glow" />
                  <span className="line-clamp-2">
                    <StreamedText
                      text={item}
                      lang={i18n.language}
                      animated={animated}
                      delay={index * 0.35}
                    />
                  </span>
                </motion.span>
              ) : null}
            </AnimatePresence>
          ))}
        </div>
      </div>
    </div>
  );
}
