import type { Resources } from '@/i18n/resources';

/** Ключи тем заявки — form.json → subjects. Выбранная тема пишется в поле subject. */
export type SubjectKey = keyof Resources['form']['subjects'];

/** Темы, доступные чипами в форме (порядок отображения). Остальные темы приходят только из CTA. */
export const INTEREST_OPTIONS: readonly SubjectKey[] = [
  'aiOrchestrator',
  'supportAgent',
  'internalSystems',
  'messagingPlatform',
  'clientPortal',
  'websiteOrApp',
  'notSure',
];

/** State, который CTA передают в роутер при переходе к форме. */
export type ContactRouteState = { subjectKey: SubjectKey };

export function isContactRouteState(value: unknown): value is ContactRouteState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'subjectKey' in value &&
    typeof (value as { subjectKey: unknown }).subjectKey === 'string'
  );
}
