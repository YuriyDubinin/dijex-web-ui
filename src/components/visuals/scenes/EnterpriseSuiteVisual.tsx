import { motion } from 'framer-motion';
import {
  ChartLine,
  Globe,
  KeyRound,
  LayoutDashboard,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useContent } from '@/i18n/useContent';
import { DURATION, EASE, SPRING, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { RollingValue } from '../parts/RollingValue';
import { useVisualLoop } from '../useVisualLoop';

/** Сцена 640×360: рабочее пространство — полоса SSO сверху, плитки приложений слева, дашборд справа. */
const TILE = 100;
const GAP = 10;
const GRID_X = 28;
const GRID_Y = 82;
const SSO_Y = 58;
const ANALYTICS = 2;

/** Порядок плиток = порядок подписей в visuals.enterpriseSuite.apps. */
const APP_ICONS: readonly LucideIcon[] = [
  LayoutDashboard,
  Warehouse,
  ChartLine,
  Users,
  Wallet,
  Globe,
];

/** Какие приложения доступны каждой роли (Админ / Менеджер / Сотрудник). */
const ACCESS: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5],
  [1, 2, 4, 5],
  [3, 5],
];

const BARS = [0.42, 0.58, 0.5, 0.71, 0.64, 0.86, 0.78] as const;
const KPI = [
  { value: 1.28, kind: 'money' },
  { value: 3412, kind: 'integer' },
  { value: 0.987, kind: 'percent' },
] as const;

const tilePosition = (index: number) => ({
  x: GRID_X + (index % 3) * (TILE + GAP),
  y: GRID_Y + Math.floor(index / 3) * (TILE + GAP),
});

/** Шаги: роль / установка → полоса SSO → линии доступа → дашборд аналитики → пауза. */
const STEPS = [1500, 900, 900, 2600, 900] as const;
const STEP = { install: 0, sso: 1, access: 2, dashboard: 3 } as const;

/** Кейс «Корпоративная экосистема»: админки, внутренние приложения и аналитика под единым входом. */
export function EnterpriseSuiteVisual() {
  const text = useContent('visuals', 'enterpriseSuite');
  const { t, i18n } = useTranslation('visuals');
  const format = useVisualFormat();
  const { animated } = useVisual();
  const { step, cycle } = useVisualLoop(STEPS, { poster: STEP.dashboard });
  const role = cycle % ACCESS.length;
  const allowed = ACCESS[role] ?? [];
  const accessShown = step >= STEP.access;
  const ssoShown = step >= STEP.sso || cycle > 0;
  const dashboardOpen = step === STEP.dashboard && allowed.includes(ANALYTICS);
  const spring = animated ? SPRING.soft : { duration: 0 };
  const money = new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  });
  const kpiValue = (kpi: (typeof KPI)[number]) =>
    kpi.kind === 'money'
      ? money.format(kpi.value * 1_000_000 * (1 + role * 0.04))
      : kpi.kind === 'percent'
        ? format.decimal(kpi.value * 100) + '%'
        : format.integer(kpi.value + role * 57);

  return (
    <div className="absolute inset-3 overflow-hidden rounded-2xl border border-border bg-bg-elevated/95 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]">
      {/* Полоса единого входа */}
      <motion.div
        className="absolute inset-x-0 top-0 flex items-center gap-2.5 border-b border-border bg-bg-base/60 px-4"
        style={{ height: 44 }}
        initial={false}
        animate={{ y: ssoShown ? 0 : -44, opacity: ssoShown ? 1 : 0 }}
        transition={spring}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-primary/15 text-accent-primary">
          <KeyRound size={13} />
        </span>
        <span className="min-w-0 truncate text-[11px] font-semibold text-text-primary">
          {text.sso}
        </span>
        <span className="ml-auto flex shrink-0 rounded-lg bg-bg-surface p-0.5 text-[9.5px]">
          {text.roles.map((label, index) => (
            <span
              key={label}
              className={cn(
                'relative max-w-[86px] truncate rounded-md px-2 py-0.5 transition-colors duration-300',
                index === role ? 'text-text-primary' : 'text-text-muted',
              )}
            >
              <span
                className={cn(
                  'absolute inset-0 rounded-md bg-accent-primary/25 transition-opacity duration-300',
                  index === role ? 'opacity-100' : 'opacity-0',
                )}
              />
              <span className="relative">{label}</span>
            </span>
          ))}
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-mono text-[9px] font-semibold text-white">
          AK
        </span>
      </motion.div>

      {/* Линии доступа от SSO к плиткам */}
      <svg viewBox="0 0 616 336" className="absolute inset-0 h-full w-full overflow-visible">
        {APP_ICONS.map((_, index) => {
          const { x, y } = tilePosition(index);
          const open = allowed.includes(index);
          return (
            <motion.path
              key={`${index}-${role}`}
              d={`M ${x + TILE / 2} ${SSO_Y - 14} L ${x + TILE / 2} ${y}`}
              fill="none"
              stroke={open ? 'rgb(var(--accent-secondary))' : 'rgb(var(--border))'}
              strokeWidth={1.25}
              strokeDasharray="2 4"
              initial={false}
              animate={{
                pathLength: accessShown ? 1 : 0,
                opacity: accessShown ? (open ? 0.8 : 0.4) : 0,
              }}
              transition={{
                duration: animated ? DURATION.slow : 0,
                ease: EASE.outExpo,
                delay: animated ? (index % 3) * 0.06 : 0,
              }}
            />
          );
        })}
        {/* Связь плитки «Аналитика» с раскрытым дашбордом */}
        <motion.path
          d={`M ${tilePosition(ANALYTICS).x + TILE} ${GRID_Y + TILE / 2} L 364 ${GRID_Y + TILE / 2}`}
          fill="none"
          stroke="rgb(var(--accent-secondary))"
          strokeWidth={1.5}
          initial={false}
          animate={{ pathLength: dashboardOpen ? 1 : 0, opacity: dashboardOpen ? 1 : 0 }}
          transition={{ duration: animated ? DURATION.base : 0 }}
        />
      </svg>

      {/* Плитки приложений: при первом показе «устанавливаются» по очереди */}
      {APP_ICONS.map((Icon, index) => {
        const { x, y } = tilePosition(index);
        const open = allowed.includes(index);
        const dimmed = accessShown && !open;
        return (
          <motion.div
            key={index}
            className={cn(
              'absolute flex flex-col justify-between rounded-xl border p-2.5 transition-[border-color,box-shadow,opacity] duration-500',
              index === ANALYTICS && dashboardOpen
                ? 'border-accent-secondary shadow-[0_0_28px_-6px_rgb(var(--accent-secondary)/0.8)]'
                : 'border-border',
              dimmed ? 'bg-bg-base/60 opacity-35' : 'bg-bg-surface',
            )}
            style={{ left: x, top: y, width: TILE, height: TILE }}
            initial={animated ? { opacity: 0, scale: 0.85 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: animated ? 0.15 + index * STAGGER.cards * 2 : 0 }}
          >
            <span className="flex items-center justify-between">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  dimmed
                    ? 'bg-text-muted/10 text-text-muted'
                    : 'bg-accent-primary/15 text-accent-primary',
                )}
              >
                <Icon size={15} />
              </span>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  dimmed ? 'bg-text-muted/40' : 'bg-success',
                )}
              />
            </span>
            <span className="line-clamp-2 text-[10.5px] font-medium leading-tight text-text-primary">
              {text.apps[index]}
            </span>
          </motion.div>
        );
      })}

      {/* Дашборд аналитики */}
      <motion.div
        className="absolute flex flex-col gap-2.5 rounded-xl border border-accent-secondary/50 bg-bg-base/90 p-3"
        style={{
          left: 364,
          top: GRID_Y,
          width: 228,
          height: TILE * 2 + GAP,
          transformOrigin: '0% 25%',
        }}
        initial={false}
        animate={dashboardOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={spring}
      >
        <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-text-primary">
          <ChartLine size={12} className="shrink-0 text-accent-secondary" />
          <span className="truncate">{text.apps[ANALYTICS]}</span>
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {KPI.map((kpi, index) => (
            <div
              key={kpi.kind}
              className="min-w-0 rounded-lg border border-border bg-bg-surface px-1.5 py-1"
            >
              <span className="block truncate text-[8.5px] text-text-muted">
                {text.kpis[index]}
              </span>
              <RollingValue
                value={kpiValue(kpi)}
                className="text-[11.5px] font-semibold text-text-primary"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1.5 rounded-lg border border-border bg-bg-surface p-2">
          {BARS.map((height, index) => (
            <motion.span
              key={index}
              className="flex-1 origin-bottom rounded-t bg-gradient-to-t from-accent-primary/60 to-accent-secondary"
              style={{ height: `${height * 100}%` }}
              initial={false}
              animate={{ scaleY: dashboardOpen ? 1 : 0.1 }}
              transition={{ ...spring, delay: animated && dashboardOpen ? 0.2 + index * 0.05 : 0 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Сколько приложений доступно роли */}
      <span
        className="absolute bottom-3 left-7 truncate font-mono text-[9.5px] text-text-muted"
        style={{ maxWidth: 320 }}
      >
        {t('enterpriseSuite.access', { count: allowed.length, total: APP_ICONS.length })}
      </span>
    </div>
  );
}
