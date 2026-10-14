/* eslint-disable react-refresh/only-export-components -- Provider and hook are intentionally co-located */
import { createContext, useCallback, useContext, useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DURATION, SPRING } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type ToastVariant = 'success' | 'error';

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-bg-elevated text-success',
  error: 'border-danger/30 bg-bg-elevated text-danger',
};

const AUTO_DISMISS_MS = 5000;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { t } = useTranslation();
  const Icon = ICONS[toast.variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96, transition: { duration: DURATION.fast } }}
      transition={SPRING.soft}
      role="alert"
      aria-live="polite"
      className={cn(
        'relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-lg',
        VARIANT_CLASSES[toast.variant],
      )}
    >
      <Icon size={18} aria-hidden className="mt-0.5 shrink-0" />
      <p className="flex-1 text-small text-text-primary">{toast.message}</p>
      {/* Таймер до автоскрытия */}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-current opacity-60"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
      />
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label={t('toast.dismiss')}
        className="shrink-0 rounded text-text-muted hover:text-text-primary transition-colors"
      >
        <X size={16} aria-hidden />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const baseId = useId();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'error') => {
      const id = `${baseId}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [baseId, dismiss],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {createPortal(
        <div
          aria-label={t('toast.region')}
          className="pointer-events-none fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2 sm:right-6"
        >
          <AnimatePresence mode="sync">
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <ToastItem toast={toast} onDismiss={dismiss} />
              </div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
