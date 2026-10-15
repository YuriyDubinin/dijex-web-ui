import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/** Числа внутри визуалов — только через Intl, по языку сайта (de: «0,4 s», fr: «0,002 $US»…). */
export function useVisualFormat() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useMemo(() => {
    const seconds = new Intl.NumberFormat(lang, {
      style: 'unit',
      unit: 'second',
      unitDisplay: 'narrow',
      maximumFractionDigits: 1,
    });
    const milliseconds = new Intl.NumberFormat(lang, {
      style: 'unit',
      unit: 'millisecond',
      unitDisplay: 'narrow',
      maximumFractionDigits: 0,
    });
    const minutes = new Intl.NumberFormat(lang, {
      style: 'unit',
      unit: 'minute',
      unitDisplay: 'narrow',
      maximumFractionDigits: 0,
    });
    const weekday = new Intl.DateTimeFormat(lang, { weekday: 'short', timeZone: 'UTC' });
    const usd = new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 3,
      maximumFractionDigits: 4,
    });
    const percent = new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 0 });
    const signedPercent = new Intl.NumberFormat(lang, {
      style: 'percent',
      maximumFractionDigits: 0,
      signDisplay: 'exceptZero',
    });
    const decimal = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 });
    const integer = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 });
    const time = new Intl.DateTimeFormat(lang, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });

    return {
      lang,
      seconds: (value: number) => seconds.format(value),
      ms: (value: number) => milliseconds.format(value),
      minutes: (value: number) => minutes.format(value),
      /** Короткое имя дня недели: 0 — понедельник. */
      weekday: (index: number) => weekday.format(new Date(Date.UTC(2026, 0, 5 + index))),
      usd: (value: number) => usd.format(value),
      /** 0.92 → «92 %» (по правилам языка). */
      percent: (value: number) => percent.format(value),
      signedPercent: (value: number) => signedPercent.format(value),
      decimal: (value: number) => decimal.format(value),
      integer: (value: number) => integer.format(value),
      /** Время для логов: фиксированный «демо-день», смещение в секундах. */
      clock: (offsetSeconds: number) =>
        time.format(new Date(Date.UTC(2026, 0, 1, 9, 41, 0) + offsetSeconds * 1000)),
    };
  }, [lang]);
}
