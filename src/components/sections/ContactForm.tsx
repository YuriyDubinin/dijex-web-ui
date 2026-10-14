import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Section } from '@/components/layout/Section';
import { FadeIn } from '@/components/motion/FadeIn';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { INTEREST_OPTIONS, isContactRouteState, type SubjectKey } from '@/content/contact';
import { feedbackSchema, type FeedbackErrorKey, type FeedbackInput } from '@/schemas/feedback';
import { submitFeedback, ApiError } from '@/lib/api';
import { supportsCharEffects } from '@/motion/segment';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';
import { SubmitButton, type SubmitPhase } from './SubmitButton';
import { SuccessBurst } from './SuccessBurst';

const FIELD_NAMES = ['name', 'email', 'phone', 'subject', 'message'] as const;

function isFieldName(value: string): value is (typeof FIELD_NAMES)[number] {
  return (FIELD_NAMES as readonly string[]).includes(value);
}

function SuccessCard({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation('form');
  const animated = useMotionTier() !== 'off';

  return (
    <motion.div
      initial={animated ? { opacity: 0, rotateY: -90 } : false}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
      style={{ transformPerspective: 1200 }}
      className="flex flex-col items-center gap-6 rounded-2xl border border-success/30 bg-bg-surface/60 px-8 py-12 text-center backdrop-blur-sm"
    >
      <SuccessBurst />
      <div>
        <h3 className="font-display text-h3 font-semibold text-text-primary">
          {t('success.title')}
        </h3>
        <p className="mt-2 text-body text-text-secondary">{t('success.body')}</p>
      </div>
      <Button variant="ghost" onClick={onReset}>
        {t('success.reset')}
      </Button>
    </motion.div>
  );
}

export function ContactForm() {
  const { t, i18n } = useTranslation('form');
  const location = useLocation();
  const { show: showToast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [phase, setPhase] = useState<SubmitPhase>('idle');
  const tier = useMotionTier();
  const animated = tier !== 'off';
  const typingTimer = useRef<number>();
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  /** Текст темы, который последним подставил чип или CTA. Ручной ввод пользователя не перезаписываем. */
  const appliedSubjectRef = useRef('');

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  });

  useEffect(() => () => window.clearInterval(typingTimer.current), []);

  /**
   * Подставляет тему. С чипов — «впечатывает» по буквам за ~300 мс (для алфавитов с пробелами),
   * из CTA и для th/ja/zh — сразу.
   */
  const applySubject = (key: SubjectKey | null, force = false, typewriter = false) => {
    const current = getValues('subject') ?? '';
    const canOverwrite = force || current === '' || current === appliedSubjectRef.current;
    setSelectedSubject(key);
    if (!canOverwrite) return;
    const label = key ? t(`subjects.${key}`) : '';
    appliedSubjectRef.current = label;
    window.clearInterval(typingTimer.current);

    if (!typewriter || !animated || !label || !supportsCharEffects(i18n.language)) {
      setValue('subject', label, { shouldValidate: true, shouldDirty: true });
      return;
    }
    const chars = Array.from(label);
    let count = 0;
    const step = Math.max(12, Math.round(300 / chars.length));
    typingTimer.current = window.setInterval(() => {
      count += 1;
      const done = count >= chars.length;
      setValue('subject', chars.slice(0, count).join(''), {
        shouldValidate: done,
        shouldDirty: true,
      });
      if (done) window.clearInterval(typingTimer.current);
    }, step);
  };

  // Тема из CTA другой страницы или секции (router state)
  useEffect(() => {
    if (isContactRouteState(location.state)) {
      applySubject(location.state.subjectKey, true);
      setShowSuccess(false);
    }
    // applySubject стабилен по смыслу; реагируем только на новую навигацию
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // При смене языка переводим тему, если её подставили мы, а не пользователь
  useEffect(() => {
    if (selectedSubject && getValues('subject') === appliedSubjectRef.current) {
      const label = t(`subjects.${selectedSubject}`);
      appliedSubjectRef.current = label;
      setValue('subject', label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  /** Сообщение ошибки: ключ схемы переводится, текст с сервера (422) выводится как есть. */
  const errorText = (message: string | undefined) => {
    if (!message) return undefined;
    return i18n.exists(`errors.${message}`, { ns: 'form' })
      ? t(`errors.${message as FeedbackErrorKey}`)
      : message;
  };

  /** Успех: кнопка превращается в галочку, затем карточка формы «переворачивается» в карточку успеха. */
  const completeSuccess = () => {
    if (!animated) {
      setShowSuccess(true);
      return;
    }
    setPhase('success');
    window.setTimeout(() => setShowSuccess(true), 650);
  };

  const onSubmit = async (data: FeedbackInput) => {
    if (honeypotRef.current?.value) {
      setShowSuccess(true);
      return;
    }

    setPhase('submitting');
    try {
      await submitFeedback(data);
      completeSuccess();
    } catch (err) {
      setPhase('idle');
      if (err instanceof ApiError && err.status === 422 && err.payload?.details) {
        err.payload.details.forEach((detail) => {
          if (isFieldName(detail.field)) setError(detail.field, { message: detail.message });
        });
        return;
      }
      showToast(t('toastError'), 'error');
    }
  };

  const handleReset = () => {
    setShowSuccess(false);
    setPhase('idle');
    setSelectedSubject(null);
    appliedSubjectRef.current = '';
    reset();
  };

  const describedBy = (field: (typeof FIELD_NAMES)[number]) =>
    errors[field] ? `${field}-error` : undefined;

  return (
    <Section id="contact" labelledBy="contact-title" divider>
      <SectionHeader
        titleId="contact-title"
        eyebrow={t('section.eyebrow')}
        title={t('section.title')}
        lead={t('section.lead')}
      />

      <FadeIn className="mx-auto mt-10 max-w-2xl">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <SuccessCard key="success" onReset={handleReset} />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={animated ? { opacity: 0, rotateY: 90 } : { opacity: 0 }}
              transition={{ duration: DURATION.base, ease: EASE.sharp }}
              style={{ transformPerspective: 1200 }}
            >
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-5 rounded-2xl border border-border bg-bg-surface/40 p-6 backdrop-blur-sm sm:p-8"
              >
                {/* Honeypot — скрыт от людей */}
                <input
                  ref={honeypotRef}
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="hidden"
                />

                <fieldset>
                  <legend className="text-small font-medium text-text-secondary">
                    {t('interest.label')}
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((key) => (
                      <Chip
                        key={key}
                        selected={selectedSubject === key}
                        onClick={() =>
                          applySubject(selectedSubject === key ? null : key, false, true)
                        }
                      >
                        {t(`subjects.${key}`)}
                      </Chip>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label={t('fields.name.label')}
                    htmlFor="name"
                    error={errorText(errors.name?.message)}
                    required
                  >
                    <Input
                      id="name"
                      type="text"
                      placeholder={t('fields.name.placeholder')}
                      hasError={!!errors.name}
                      aria-describedby={describedBy('name')}
                      aria-required
                      autoComplete="name"
                      {...register('name')}
                    />
                  </Field>

                  <Field
                    label={t('fields.email.label')}
                    htmlFor="email"
                    error={errorText(errors.email?.message)}
                    required
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('fields.email.placeholder')}
                      hasError={!!errors.email}
                      aria-describedby={describedBy('email')}
                      aria-required
                      autoComplete="email"
                      {...register('email')}
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label={t('fields.phone.label')}
                    htmlFor="phone"
                    error={errorText(errors.phone?.message)}
                  >
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t('fields.phone.placeholder')}
                      hasError={!!errors.phone}
                      aria-describedby={describedBy('phone')}
                      autoComplete="tel"
                      {...register('phone')}
                    />
                  </Field>

                  <Field
                    label={t('fields.subject.label')}
                    htmlFor="subject"
                    error={errorText(errors.subject?.message)}
                  >
                    <Input
                      id="subject"
                      type="text"
                      placeholder={t('fields.subject.placeholder')}
                      hasError={!!errors.subject}
                      aria-describedby={describedBy('subject')}
                      {...register('subject')}
                    />
                  </Field>
                </div>

                <Field
                  label={t('fields.message.label')}
                  htmlFor="message"
                  error={errorText(errors.message?.message)}
                  required
                >
                  <Textarea
                    id="message"
                    placeholder={t('fields.message.placeholder')}
                    hasError={!!errors.message}
                    aria-describedby={describedBy('message')}
                    aria-required
                    {...register('message')}
                  />
                </Field>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <SubmitButton
                    phase={isSubmitting && phase === 'idle' ? 'submitting' : phase}
                    disabled={!isValid || isSubmitting || phase !== 'idle'}
                    label={t('submit')}
                    submittingLabel={t('submitting')}
                  />

                  <p className="text-center text-small text-text-muted">
                    {t('privacyNotice')}{' '}
                    <Link
                      viewTransition
                      to="/privacy"
                      className="text-text-secondary underline underline-offset-2 transition-colors hover:text-text-primary"
                    >
                      {t('privacyLink')}
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </FadeIn>
    </Section>
  );
}
