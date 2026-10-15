/**
 * Манифест изображений. Все файлы лежат в public/images/ — достаточно положить файл с нужным именем.
 * alt — ключ из common.json → images.
 *
 * Места с полем `visual` по умолчанию показывают «живой» визуал на коде (src/components/visuals/) —
 * файл им не нужен. Чтобы заменить визуал картинкой, положите файл и выставьте `fileProvided: true`.
 * Места без `visual` ждут файл; пока его нет, ImageSlot рисует заглушку (в dev — с именем файла и размером).
 */

/** Ключи «живых» визуалов — см. src/components/visuals/registry.ts. */
export type VisualKey =
  | 'orchestratorHub'
  | 'multilingualChat'
  | 'processFlow'
  | 'internalSystems'
  | 'messagingPlatform'
  | 'clientPortal'
  | 'webApps'
  | 'orchestratorPipeline'
  | 'observabilityConsole'
  | 'omnichannel'
  | 'operatorInbox'
  | 'systemsMap';

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  /** «Живой» визуал на этом месте. */
  visual?: VisualKey;
  /** Файл положен и должен показываться вместо визуала. */
  fileProvided?: boolean;
};

const IMAGE_DEFS = {
  pillarOrchestrator: {
    src: '/images/pillar-orchestrator.webp',
    width: 1200,
    height: 900,
    visual: 'orchestratorHub',
  },
  pillarSupportAgent: {
    src: '/images/pillar-support-agent.webp',
    width: 1200,
    height: 900,
    visual: 'multilingualChat',
  },
  pillarDigitalProcesses: {
    src: '/images/pillar-digital-processes.webp',
    width: 1200,
    height: 900,
    visual: 'processFlow',
  },
  processesInternalSystems: {
    src: '/images/processes-internal-systems.webp',
    width: 1600,
    height: 1000,
    visual: 'internalSystems',
  },
  processesMessagingPlatform: {
    src: '/images/processes-messaging-platform.webp',
    width: 1600,
    height: 1000,
    visual: 'messagingPlatform',
  },
  processesClientPortal: {
    src: '/images/processes-client-portal.webp',
    width: 1600,
    height: 1000,
    visual: 'clientPortal',
  },
  processesWebApps: {
    src: '/images/processes-web-apps.webp',
    width: 1600,
    height: 1000,
    visual: 'webApps',
  },
  aboutGlobe: { src: '/images/about-globe.webp', width: 1200, height: 900 },
  caseNewsFeeder: { src: '/images/case-news-feeder.webp', width: 1600, height: 900 },
  caseAiAssistant: { src: '/images/case-ai-assistant.webp', width: 1600, height: 900 },
  caseEnterpriseSuite: { src: '/images/case-enterprise-suite.webp', width: 1600, height: 900 },
  solutionOrchestratorHero: {
    src: '/images/solution-orchestrator-hero.webp',
    width: 1600,
    height: 1000,
    visual: 'orchestratorPipeline',
  },
  solutionOrchestratorConsole: {
    src: '/images/solution-orchestrator-console.webp',
    width: 1600,
    height: 1000,
    visual: 'observabilityConsole',
  },
  solutionSupportHero: {
    src: '/images/solution-support-hero.webp',
    width: 1600,
    height: 1000,
    visual: 'omnichannel',
  },
  solutionSupportInbox: {
    src: '/images/solution-support-inbox.webp',
    width: 1600,
    height: 1000,
    visual: 'operatorInbox',
  },
  solutionDigitalHero: {
    src: '/images/solution-digital-hero.webp',
    width: 1600,
    height: 1000,
    visual: 'systemsMap',
  },
} as const satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof IMAGE_DEFS;

export const IMAGES: Record<ImageKey, ImageAsset> = IMAGE_DEFS;

/** Визуал, который сейчас показывается на месте картинки (или null — показывать файл). */
export function liveVisualFor(key: ImageKey): VisualKey | null {
  const asset = IMAGES[key];
  return asset.visual && !asset.fileProvided ? asset.visual : null;
}

/** Логотипы каналов (SVG). Если файла нет — показывается иконка-заглушка и название. */
export const CHANNEL_LOGOS = {
  telegram: '/images/channel-telegram.svg',
  whatsapp: '/images/channel-whatsapp.svg',
  instagram: '/images/channel-instagram.svg',
  facebookMessenger: '/images/channel-facebook-messenger.svg',
  vk: '/images/channel-vk.svg',
  viber: '/images/channel-viber.svg',
  wechat: '/images/channel-wechat.svg',
  line: '/images/channel-line.svg',
} as const;

export type ChannelLogoKey = keyof typeof CHANNEL_LOGOS;

/** Прочие файлы манифеста — для проверки скриптом images:check. */
export const EXTRA_FILES = ['/images/og-cover.png', '/images/logo.svg'] as const;
