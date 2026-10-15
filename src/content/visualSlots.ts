/**
 * Визуальные места сайта. Статичных изображений на сайте нет: каждое место занимает «живая» сцена на коде
 * (src/components/visuals/scenes/). Ключ места — смысл («карточка оркестратора», «кейс RAG»), значение — сцена.
 * Пропорции и координаты сцены задаёт реестр визуалов (src/components/visuals/registry.ts).
 * alt сцены — common.json → visuals.<ключ места>.
 */

/** Ключи сцен — см. src/components/visuals/registry.ts. */
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
  | 'systemsMap'
  | 'globe'
  | 'newsFeed'
  | 'ragAssistant'
  | 'enterpriseSuite'
  | 'lostPacket'
  | 'requestSent'
  | 'brokenWire';

export const VISUAL_SLOTS = {
  pillarOrchestrator: 'orchestratorHub',
  pillarSupportAgent: 'multilingualChat',
  pillarDigitalProcesses: 'processFlow',
  processesInternalSystems: 'internalSystems',
  processesMessagingPlatform: 'messagingPlatform',
  processesClientPortal: 'clientPortal',
  processesWebApps: 'webApps',
  aboutGlobe: 'globe',
  caseNewsFeeder: 'newsFeed',
  caseAiAssistant: 'ragAssistant',
  caseEnterpriseSuite: 'enterpriseSuite',
  solutionOrchestratorHero: 'orchestratorPipeline',
  solutionOrchestratorConsole: 'observabilityConsole',
  solutionSupportHero: 'omnichannel',
  solutionSupportInbox: 'operatorInbox',
  solutionDigitalHero: 'systemsMap',
  notFound: 'lostPacket',
  requestSent: 'requestSent',
  routeError: 'brokenWire',
} as const satisfies Record<string, VisualKey>;

export type SlotKey = keyof typeof VISUAL_SLOTS;

export const SLOT_KEYS = Object.keys(VISUAL_SLOTS) as SlotKey[];
