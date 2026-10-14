/**
 * Манифест изображений. Все файлы лежат в public/images/ — достаточно положить файл с нужным именем.
 * Пока файла нет, ImageSlot рисует заглушку (в dev — с именем файла и размером).
 * alt — ключ из common.json → images.
 */
export type ImageAsset = {
  src: string;
  width: number;
  height: number;
};

export const IMAGES = {
  pillarOrchestrator: { src: '/images/pillar-orchestrator.webp', width: 1200, height: 900 },
  pillarSupportAgent: { src: '/images/pillar-support-agent.webp', width: 1200, height: 900 },
  pillarDigitalProcesses: {
    src: '/images/pillar-digital-processes.webp',
    width: 1200,
    height: 900,
  },
  processesInternalSystems: {
    src: '/images/processes-internal-systems.webp',
    width: 1600,
    height: 1000,
  },
  processesMessagingPlatform: {
    src: '/images/processes-messaging-platform.webp',
    width: 1600,
    height: 1000,
  },
  processesClientPortal: { src: '/images/processes-client-portal.webp', width: 1600, height: 1000 },
  processesWebApps: { src: '/images/processes-web-apps.webp', width: 1600, height: 1000 },
  aboutGlobe: { src: '/images/about-globe.webp', width: 1200, height: 900 },
  caseNewsFeeder: { src: '/images/case-news-feeder.webp', width: 1600, height: 900 },
  caseAiAssistant: { src: '/images/case-ai-assistant.webp', width: 1600, height: 900 },
  caseEnterpriseSuite: { src: '/images/case-enterprise-suite.webp', width: 1600, height: 900 },
  solutionOrchestratorHero: {
    src: '/images/solution-orchestrator-hero.webp',
    width: 1600,
    height: 1000,
  },
  solutionOrchestratorConsole: {
    src: '/images/solution-orchestrator-console.webp',
    width: 1600,
    height: 1000,
  },
  solutionSupportHero: { src: '/images/solution-support-hero.webp', width: 1600, height: 1000 },
  solutionSupportInbox: { src: '/images/solution-support-inbox.webp', width: 1600, height: 1000 },
  solutionDigitalHero: { src: '/images/solution-digital-hero.webp', width: 1600, height: 1000 },
} as const satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof IMAGES;

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
