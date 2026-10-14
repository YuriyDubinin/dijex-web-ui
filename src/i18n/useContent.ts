import { useTranslation } from 'react-i18next';
import type { Namespace } from './config';
import type { Resources } from './resources';

type UntypedT = (key: string, options: { returnObjects: true }) => unknown;

/**
 * Возвращает поддерево переводов текущего языка целиком (например, все тексты секции).
 * Тип берётся из английского эталона: тест locales.test.ts гарантирует, что у всех локалей та же структура.
 */
export function useContent<N extends Namespace, K extends keyof Resources[N] & string>(
  namespace: N,
  key: K,
): Resources[N][K] {
  const { t } = useTranslation(namespace);
  // Типизированный t не принимает произвольный ключ-поддерево, а форма значения гарантирована тестом паритета локалей.
  const untypedT = t as unknown as UntypedT;
  return untypedT(key, { returnObjects: true }) as Resources[N][K];
}
