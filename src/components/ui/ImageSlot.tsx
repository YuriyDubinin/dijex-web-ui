import { useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IMAGES, type ImageKey } from '@/content/images';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE } from '@/motion/tokens';
import { cn } from '@/lib/cn';

type Props = {
  image: ImageKey;
  /** Картинка в первом экране: грузится сразу и с высоким приоритетом. */
  priority?: boolean;
  fit?: 'contain' | 'cover';
  glow?: 'indigo' | 'cyan' | 'none';
  /** Внутренний отступ — для иллюстраций, которые не должны касаться рамки. */
  padded?: boolean;
  /** Параллакс картинки внутри рамки при скролле (только full). */
  parallax?: boolean;
  /** Что показать, пока файла нет (вместо стандартной заглушки), — например, «живой» мокап. */
  fallback?: ReactNode;
  className?: string;
  imgClassName?: string;
};

type Status = 'loading' | 'loaded' | 'error';

const fileName = (src: string) => src.split('/').pop() ?? src;

/**
 * Рамка под изображение из манифеста:
 * - пока грузится — шиммер-скелетон;
 * - загрузилась — проявление маской снизу вверх с лёгким зумом и размытием;
 * - параллакс внутри рамки и «дыхание» свечения за ней (full);
 * - файла нет — нейтральная заглушка со сканирующими линиями (в dev — имя файла и размер).
 */
export function ImageSlot({
  image,
  priority = false,
  fit = 'contain',
  glow = 'indigo',
  padded = true,
  parallax = true,
  fallback,
  className,
  imgClassName,
}: Props) {
  const { t } = useTranslation();
  const tier = useMotionTier();
  const frameRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const asset = IMAGES[image];
  const alt = t(`images.${image}`);
  const full = tier === 'full';
  const animated = tier !== 'off';

  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-24, 24]);
  const useParallax = full && parallax;

  return (
    <div className={cn('relative', className)}>
      {glow !== 'none' ? (
        <div
          aria-hidden
          className={cn(
            'absolute -inset-4 rounded-3xl blur-2xl',
            glow === 'cyan' ? 'bg-glow-cyan opacity-20' : 'bg-glow-indigo opacity-30',
            full && 'animate-glow-breathe',
          )}
        />
      ) : null}
      <div
        ref={frameRef}
        className="relative overflow-hidden rounded-2xl border border-border bg-bg-surface/60 backdrop-blur-sm"
        style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
      >
        <div aria-hidden className="absolute inset-0 bg-grid-pattern" />

        {status === 'loading' && animated ? (
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          </div>
        ) : null}

        {status === 'error' && fallback ? (
          fallback
        ) : status === 'error' ? (
          <ImagePlaceholder
            src={asset.src}
            width={asset.width}
            height={asset.height}
            alt={alt}
            animated={animated}
          />
        ) : (
          <motion.div
            className="absolute inset-0"
            style={useParallax ? { y: parallaxY, scale: 1.08 } : undefined}
          >
            <motion.img
              src={asset.src}
              alt={alt}
              width={asset.width}
              height={asset.height}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              // React 18 знает только атрибут в нижнем регистре (fetchPriority появился в React 19)
              {...(priority ? { fetchpriority: 'high' } : {})}
              ref={(node: HTMLImageElement | null) => {
                // Картинка из кэша могла загрузиться раньше, чем React повесил onLoad
                if (node?.complete && status === 'loading') {
                  setStatus(node.naturalWidth > 0 ? 'loaded' : 'error');
                }
              }}
              onLoad={() => setStatus('loaded')}
              onError={() => setStatus('error')}
              className={cn(
                'relative h-full w-full',
                fit === 'cover' ? 'object-cover' : 'object-contain',
                padded && fit === 'contain' && 'p-6 md:p-8',
                imgClassName,
              )}
              initial={false}
              animate={
                status === 'loaded'
                  ? { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, filter: 'blur(0px)', opacity: 1 }
                  : animated
                    ? {
                        clipPath: 'inset(0% 0% 100% 0%)',
                        scale: 1.06,
                        filter: 'blur(8px)',
                        opacity: 0,
                      }
                    : { opacity: 0 }
              }
              transition={
                animated ? { duration: DURATION.cinematic, ease: EASE.outExpo } : { duration: 0 }
              }
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ImagePlaceholder({
  src,
  width,
  height,
  alt,
  animated,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  animated: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      role="img"
      aria-label={alt}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden p-4 text-center"
    >
      <div aria-hidden className="absolute inset-0 bg-glow-indigo opacity-20" />
      {/* Сканирующие линии — «система ждёт данные» */}
      <div aria-hidden className="absolute inset-0 opacity-60">
        {[0, 1, 2].map((line) => (
          <div
            key={line}
            className={cn(
              'absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-secondary/40 to-transparent',
              animated && 'animate-flow-y',
            )}
            style={{
              top: `${25 + line * 25}%`,
              animationDelay: `${line * 0.8}s`,
              animationDuration: '3.2s',
            }}
          />
        ))}
      </div>
      {import.meta.env.DEV ? (
        <div className="relative flex max-w-full flex-col items-center gap-2 rounded-xl border border-dashed border-accent-primary/40 bg-bg-base/70 px-4 py-3">
          <ImageIcon size={22} aria-hidden className="text-accent-primary" />
          <code className="break-all font-mono text-xs text-text-primary">{fileName(src)}</code>
          <span className="font-mono text-xs text-text-muted">
            {width}×{height}
          </span>
        </div>
      ) : (
        <span className="sr-only">{t('imageSlot.placeholder')}</span>
      )}
    </div>
  );
}
