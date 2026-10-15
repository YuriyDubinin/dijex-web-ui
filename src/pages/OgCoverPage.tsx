import { AgentCore } from '@/components/agent/AgentCore';
import { useContent } from '@/i18n/useContent';

/**
 * Превью ссылки (og:image) 1200×630 — рисуется кодом в стиле сайта и снимается скриптом
 * `npm run og:generate` в public/og/og-<lang>.png. Только dev, вне общей раскладки (без шапки и футера).
 * Открывать с ?motion=off — ядро в статичном «постерном» состоянии.
 */
export function OgCoverPage() {
  const hero = useContent('home', 'hero');

  return (
    <div
      data-og-cover
      className="relative overflow-hidden bg-bg-base"
      style={{ width: 1200, height: 630 }}
    >
      <div aria-hidden className="absolute inset-0 bg-hero-mesh" />
      <div aria-hidden className="absolute inset-0 bg-grid-pattern opacity-70" />
      <div
        aria-hidden
        className="absolute -right-24 top-10 h-[520px] w-[520px] rounded-full bg-glow-indigo blur-3xl"
      />

      <div className="absolute inset-y-0 left-0 flex w-[640px] flex-col justify-center gap-7 pl-20">
        <span className="font-display text-[34px] font-bold tracking-tight text-text-primary">
          Dijex
        </span>
        <span className="w-fit rounded-full border border-accent-primary/40 bg-accent-primary/10 px-4 py-1.5 text-[17px] text-accent-primary">
          {hero.badge}
        </span>
        <h1 className="text-balance font-display text-[58px] font-bold leading-[1.08] tracking-tight text-text-primary">
          {hero.title}
        </h1>
        <p className="line-clamp-3 text-[21px] leading-snug text-text-secondary">{hero.subtitle}</p>
      </div>

      <div className="absolute right-16 top-1/2 w-[440px] -translate-y-1/2">
        <AgentCore />
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1.5 bg-brand-gradient" />
    </div>
  );
}
