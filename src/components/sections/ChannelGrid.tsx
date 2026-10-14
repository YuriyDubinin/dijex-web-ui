import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { CHANNEL_LOGOS } from '@/content/images';
import { CHANNEL_GROUPS, type ChannelItem } from '@/content/home/support';
import { useContent } from '@/i18n/useContent';
import { SpotlightGroup } from '@/motion/Spotlight';
import { useMotionTier } from '@/motion/tier';
import { DURATION, EASE, STAGGER } from '@/motion/tokens';
import { cn } from '@/lib/cn';

/** Имя канала на орбитах AgentCore для «общих» каналов. */
const GENERIC_CORE_NAME: Record<string, string> = {
  webWidget: 'Web',
  sdk: 'App',
  email: 'Email',
  api: 'API',
};

const channelCoreName = (item: ChannelItem) =>
  item.kind === 'brand' ? item.name : (GENERIC_CORE_NAME[item.key] ?? item.key);

const groupVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE.outExpo,
      staggerChildren: STAGGER.items,
      delayChildren: 0.15,
    },
  },
};
const pillVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION.base, ease: EASE.outExpo } },
};

/** Логотип канала из public/images; пока файла нет — иконка lucide. Индикатор «пингует» при появлении. */
function ChannelPill({
  item,
  label,
  onHover,
  animated,
}: {
  item: ChannelItem;
  label: string;
  onHover?: (channel: string | null) => void;
  animated: boolean;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = item.kind === 'brand' && !logoFailed;

  return (
    <motion.li
      variants={animated ? pillVariants : undefined}
      onPointerEnter={() => onHover?.(channelCoreName(item))}
      onPointerLeave={() => onHover?.(null)}
      className="group relative inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-border bg-bg-base/40 px-3 py-2 text-small text-text-secondary transition-colors hover:border-accent-secondary/50 hover:text-text-primary"
    >
      {showLogo ? (
        <img
          src={CHANNEL_LOGOS[item.logo]}
          alt=""
          width={18}
          height={18}
          loading="lazy"
          onError={() => setLogoFailed(true)}
          className="h-[18px] w-[18px] shrink-0"
        />
      ) : (
        <Icon name={item.icon} size={16} className="shrink-0 text-accent-secondary" />
      )}
      {label}
      {animated ? (
        <motion.span
          aria-hidden
          className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent-secondary"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: {
              scale: [0, 1.6, 1],
              opacity: [0, 1, 0],
              transition: { duration: 0.9, delay: 0.2 },
            },
          }}
        />
      ) : null}
    </motion.li>
  );
}

type Props = {
  /** Наведение на канал — подсветка его узла на «ядре» агента. */
  onHoverChannel?: (channel: string | null) => void;
};

/** Каналы агента поддержки: мессенджеры / соцсети / сайт и приложения. Пинги по очереди при появлении. */
export function ChannelGrid({ onHoverChannel }: Props) {
  const channels = useContent('home', 'support').channels;
  const tier = useMotionTier();
  const animated = tier !== 'off';

  return (
    <div>
      <SpotlightGroup className="grid gap-5 md:grid-cols-3">
        {CHANNEL_GROUPS.map((group, groupIndex) => (
          <motion.div
            key={group.key}
            data-spotlight
            variants={animated ? groupVariants : undefined}
            initial={animated ? 'hidden' : false}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: groupIndex * STAGGER.cards }}
            className="spotlight spotlight-cyan rounded-2xl border border-border bg-bg-surface/60 p-5 backdrop-blur-sm"
          >
            <h4 className="caps-label text-text-muted">{channels.groups[group.key]}</h4>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <ChannelPill
                  key={item.kind === 'brand' ? item.name : item.key}
                  item={item}
                  label={item.kind === 'brand' ? item.name : channels.items[item.key]}
                  onHover={onHoverChannel}
                  animated={animated}
                />
              ))}
            </ul>
          </motion.div>
        ))}
      </SpotlightGroup>
      <p className="group mt-5 flex items-center justify-center gap-2 text-center text-small text-text-secondary">
        <motion.span
          className="inline-flex"
          initial={animated ? { rotate: -180, opacity: 0 } : false}
          whileInView={{ rotate: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.reveal, ease: EASE.outExpo }}
        >
          <Icon name="repeat" size={16} className={cn('shrink-0 text-accent-primary')} />
        </motion.span>
        {channels.omni}
      </p>
    </div>
  );
}
