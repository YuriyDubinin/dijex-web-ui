import { motion } from 'framer-motion';
import type { ProcessTabKey } from '@/content/home/processes';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

/** Строка-скелет с бегущим бликом. */
function Line({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <span
      className={cn('relative block h-2 overflow-hidden rounded-full bg-text-muted/20', className)}
    >
      <span
        className="absolute inset-y-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent"
        style={{ animationDelay: `${delay}s` }}
      />
    </span>
  );
}

function Dashboard({ animated }: { animated: boolean }) {
  const bars = [42, 68, 55, 80, 62, 92, 74];
  return (
    <div className="grid h-full grid-cols-[1fr_2.2fr] gap-3">
      <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-bg-base/50 p-3">
        {[0, 1, 2, 3, 4].map((row) => (
          <Line
            key={row}
            className={row === 1 ? 'bg-accent-primary/40' : undefined}
            delay={row * 0.2}
          />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          {['bg-accent-primary/30', 'bg-accent-secondary/30', 'bg-accent-glow/30'].map(
            (tone, index) => (
              <div key={tone} className="rounded-xl border border-border/70 bg-bg-base/50 p-2.5">
                <Line className="w-1/2" delay={index * 0.3} />
                <span className={cn('mt-2 block h-4 w-2/3 rounded', tone)} />
              </div>
            ),
          )}
        </div>
        <div className="flex flex-1 items-end gap-2 rounded-xl border border-border/70 bg-bg-base/50 p-3">
          {bars.map((height, index) => (
            <motion.span
              key={index}
              className="flex-1 origin-bottom rounded-t bg-gradient-to-t from-accent-primary/50 to-accent-secondary/70"
              style={{ height: `${height}%` }}
              initial={animated ? { scaleY: 0 } : false}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION.slow,
                ease: EASE.outExpo,
                delay: 0.2 + index * 0.06,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Messenger({ animated }: { animated: boolean }) {
  const bubbles = [
    { side: 'left', width: 'w-2/3' },
    { side: 'right', width: 'w-1/2' },
    { side: 'left', width: 'w-3/4' },
    { side: 'right', width: 'w-2/5' },
  ] as const;
  return (
    <div className="grid h-full grid-cols-[1fr_2.2fr] gap-3">
      <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-bg-base/50 p-3">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span
              className={cn(
                'h-5 w-5 shrink-0 rounded-full',
                row === 0 ? 'bg-accent-secondary/50' : 'bg-text-muted/25',
              )}
            />
            <Line delay={row * 0.25} />
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-end gap-2 rounded-xl border border-border/70 bg-bg-base/50 p-3">
        {bubbles.map((bubble, index) => (
          <motion.span
            key={index}
            className={cn(
              'block h-6 rounded-xl',
              bubble.width,
              bubble.side === 'right'
                ? 'self-end bg-accent-primary/50'
                : 'self-start bg-text-muted/25',
            )}
            initial={animated ? { opacity: 0, y: 10, scale: 0.9 } : false}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.base, ease: EASE.outExpo, delay: 0.2 + index * 0.25 }}
          />
        ))}
      </div>
    </div>
  );
}

function Portal({ animated }: { animated: boolean }) {
  const rows = [0.85, 0.55, 1, 0.3];
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border/70 bg-bg-base/50 p-3">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-full bg-accent-primary/40" />
        <Line className="w-1/3" />
      </div>
      {rows.map((progress, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg border border-border/60 p-2">
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              progress === 1 ? 'bg-success' : 'bg-accent-secondary/70',
            )}
          />
          <Line className="w-1/4" delay={index * 0.2} />
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-text-muted/20">
            <motion.span
              className="absolute inset-y-0 left-0 origin-left rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
              style={{ width: `${progress * 100}%` }}
              initial={animated ? { scaleX: 0 } : false}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION.reveal,
                ease: EASE.outExpo,
                delay: 0.2 + index * 0.1,
              }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function WebApps() {
  return (
    <div className="flex h-full items-end gap-4">
      <div className="flex h-full flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-bg-base/50">
        <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-2">
          {['bg-danger/60', 'bg-warning/60', 'bg-success/60'].map((tone) => (
            <span key={tone} className={cn('h-2 w-2 rounded-full', tone)} />
          ))}
          <Line className="ml-3 w-1/3" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <span className="block h-12 rounded-lg bg-gradient-to-r from-accent-primary/40 via-accent-glow/30 to-accent-secondary/40" />
          <Line />
          <Line className="w-3/4" delay={0.3} />
          <div className="mt-auto grid grid-cols-3 gap-2">
            {[0, 1, 2].map((cell) => (
              <span key={cell} className="h-8 rounded-md bg-text-muted/15" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex h-[85%] w-[26%] flex-col gap-2 rounded-2xl border border-border/70 bg-bg-base/60 p-2">
        <span className="mx-auto h-1 w-6 rounded-full bg-text-muted/40" />
        <span className="block h-10 rounded-lg bg-accent-secondary/30" />
        <Line delay={0.2} />
        <Line className="w-2/3" delay={0.5} />
        <span className="mt-auto block h-6 rounded-lg bg-accent-primary/50" />
      </div>
    </div>
  );
}

/** «Живой» мокап интерфейса направления — показывается, пока нет иллюстрации. */
export function ProcessMockup({ kind }: { kind: ProcessTabKey }) {
  const tier = useMotionTier();
  const animated = tier !== 'off';
  return (
    <div aria-hidden className="absolute inset-0 p-5 md:p-7">
      {kind === 'internal' ? <Dashboard animated={animated} /> : null}
      {kind === 'messaging' ? <Messenger animated={animated} /> : null}
      {kind === 'portals' ? <Portal animated={animated} /> : null}
      {kind === 'apps' ? <WebApps /> : null}
    </div>
  );
}
