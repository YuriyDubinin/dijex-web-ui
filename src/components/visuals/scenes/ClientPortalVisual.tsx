import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CheckCircle2, FileText, MessageCircle, Truck, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { StatusPill } from '../parts/StatusPill';
import { useVisualLoop } from '../useVisualLoop';

/** Шаги: заказ проходит этапы 1–4, на последнем всплывает уведомление; затем пауза. */
const STEPS = [900, 900, 900, 2000, 700] as const;
const LAST_STAGE = 3;
/** Прогресс загрузки третьего документа по шагам. */
const UPLOAD = [0.15, 0.45, 0.8, 1, 1] as const;
const DOC_SIZES = ['248 KB', '96 KB', '1.2 MB'] as const;
const TRACK_W = 300;

/** Вкладка «Клиентские порталы»: личный кабинет — заказ едет по этапам, документы, уведомления. */
export function ClientPortalVisual() {
  const text = useContent('visuals', 'clientPortal');
  const { t, i18n } = useTranslation('visuals');
  const { animated } = useVisual();
  const { step } = useVisualLoop(STEPS, { poster: 2 });
  const stage = Math.min(step, LAST_STAGE);
  const upload = UPLOAD[step] ?? 1;
  const spring = animated ? SPRING.soft : { duration: 0 };
  const balance = new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: 'USD',
  }).format(1240);

  return (
    <div className="absolute inset-3 flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated/95 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]">
      {/* Шапка кабинета */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-[12px] font-semibold text-white">
          {Array.from(text.name)[0]}
        </span>
        <span className="min-w-0 flex-1 truncate font-display text-[14px] font-semibold text-text-primary">
          {t('clientPortal.greeting', { name: text.name })}
        </span>
        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary">
          <Bell size={14} />
          <AnimatePresence>
            {step === LAST_STAGE ? (
              <motion.span
                className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-bg-elevated bg-success"
                initial={animated ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={animated ? SPRING.snappy : { duration: 0 }}
              />
            ) : null}
          </AnimatePresence>
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_200px] gap-3 p-3.5">
        <div className="flex min-w-0 flex-col gap-3">
          {/* Заказ с трекером */}
          <div className="rounded-xl border border-border bg-bg-surface/80 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-text-secondary">
                {text.order} <span className="font-mono text-text-primary">#5531</span>
              </span>
              <StatusPill tone={stage === LAST_STAGE ? 'success' : 'secondary'}>
                {text.stages[stage]}
              </StatusPill>
            </div>
            <div className="relative mx-auto mt-5" style={{ width: TRACK_W }}>
              <span className="absolute inset-x-0 top-[9px] h-0.5 rounded-full bg-text-muted/20" />
              <motion.span
                className="absolute inset-x-0 top-[9px] h-0.5 origin-left rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                initial={false}
                animate={{ scaleX: stage / LAST_STAGE }}
                transition={{ duration: animated ? DURATION.slow : 0, ease: EASE.outExpo }}
              />
              <motion.span
                className="absolute -top-[18px] flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-accent-secondary text-bg-base shadow-[0_0_16px_rgb(var(--accent-secondary)/0.8)]"
                style={{ left: 0 }}
                initial={false}
                animate={{ x: (stage / LAST_STAGE) * TRACK_W }}
                transition={spring}
              >
                <Truck size={12} />
              </motion.span>
              <div className="relative flex justify-between">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-5 w-5 rounded-full border-2 transition-colors duration-500',
                      index <= stage
                        ? 'border-accent-secondary bg-bg-elevated'
                        : 'border-text-muted/30 bg-bg-surface',
                    )}
                  >
                    {index < stage ? (
                      <Check size={10} strokeWidth={3} className="m-[3px] text-accent-secondary" />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
            <div className="-mx-2 mt-2 grid grid-cols-4">
              {text.stages.map((label, index) => (
                <span
                  key={label}
                  className={cn(
                    'line-clamp-2 px-0.5 text-center text-[9.5px] leading-tight transition-colors duration-500',
                    index <= stage ? 'text-text-primary' : 'text-text-muted',
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3">
            <div className="flex min-w-0 flex-col justify-between rounded-xl border border-border bg-bg-surface/80 p-3">
              <span className="flex items-center gap-1.5 truncate text-[10px] text-text-muted">
                <Wallet size={11} className="shrink-0" />
                {text.balance}
              </span>
              <span className="truncate font-display text-[18px] font-bold text-text-primary">
                {balance}
              </span>
              <span className="flex h-6 items-end gap-0.5">
                {[40, 65, 50, 80, 60, 95, 75].map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-sm bg-accent-primary/40"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </span>
            </div>
            <div className="flex min-w-0 flex-col justify-between rounded-xl border border-accent-primary/40 bg-accent-primary/10 p-3">
              <MessageCircle size={16} className="text-accent-primary" />
              <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-text-primary">
                {text.support}
              </span>
              <span className="flex -space-x-1.5">
                {['bg-accent-primary', 'bg-accent-secondary', 'bg-accent-glow'].map((tone) => (
                  <span
                    key={tone}
                    className={cn('h-4 w-4 rounded-full border border-bg-elevated', tone)}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* Документы */}
        <div className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-border bg-bg-surface/80 p-3">
          <span className="mb-1 truncate text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            {text.documents}
          </span>
          {text.docs.map((name, index) => {
            const uploading = index === 2;
            return (
              <div
                key={name}
                className="flex items-center gap-2 rounded-lg border border-border/70 bg-bg-base/40 p-2"
              >
                <span className="flex h-7 w-6 shrink-0 items-center justify-center rounded bg-danger/15 text-danger">
                  <FileText size={12} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10.5px] font-medium text-text-primary">
                    {name}.pdf
                  </span>
                  <span className="block font-mono text-[8.5px] text-text-muted">
                    {DOC_SIZES[index]}
                  </span>
                </span>
                {uploading && upload < 1 ? (
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 -rotate-90">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="none"
                      stroke="rgb(var(--border))"
                      strokeWidth="2"
                    />
                    <motion.circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="none"
                      stroke="rgb(var(--accent-secondary))"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={false}
                      animate={{ pathLength: upload }}
                      transition={{ duration: animated ? DURATION.slow : 0, ease: EASE.outExpo }}
                    />
                  </svg>
                ) : (
                  <CheckCircle2 size={15} className="shrink-0 text-success" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Уведомление */}
      <AnimatePresence>
        {step === LAST_STAGE ? (
          <motion.div
            className="absolute bottom-4 right-4 flex max-w-[220px] items-center gap-2 rounded-xl border border-success/40 bg-bg-base/95 px-3 py-2 shadow-[0_12px_40px_-12px_rgb(var(--success)/0.6)]"
            initial={animated ? { opacity: 0, y: 16, scale: 0.95 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={animated ? { opacity: 0, x: 24 } : { opacity: 0 }}
            transition={spring}
          >
            <CheckCircle2 size={16} className="shrink-0 text-success" />
            <span className="truncate text-[11px] font-medium text-text-primary">{text.toast}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
