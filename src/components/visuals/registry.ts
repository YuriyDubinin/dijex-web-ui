import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { VisualKey } from '@/content/images';

type Loader = () => Promise<{ default: ComponentType }>;

type VisualDef = {
  load: Loader;
  /** Сцена рисуется в этих координатах и масштабируется под рамку (пропорции = пропорции места). */
  width: number;
  height: number;
};

/** Сцены 4:3 (карточки направлений) и 16:10 (вкладки, страницы решений). */
const CARD = { width: 480, height: 360 } as const;
const WIDE = { width: 640, height: 400 } as const;

const named =
  <M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M & string): Loader =>
  () =>
    load().then((module) => ({ default: module[name] as ComponentType }));

/** Каждый визуал — отдельный чанк: грузится, только когда место под картинку приближается к экрану. */
export const VISUALS: Record<VisualKey, VisualDef> = {
  orchestratorHub: {
    ...CARD,
    load: named(() => import('./scenes/OrchestratorHubVisual'), 'OrchestratorHubVisual'),
  },
  multilingualChat: {
    ...CARD,
    load: named(() => import('./scenes/MultilingualChatVisual'), 'MultilingualChatVisual'),
  },
  processFlow: {
    ...CARD,
    load: named(() => import('./scenes/ProcessFlowVisual'), 'ProcessFlowVisual'),
  },
  internalSystems: {
    ...WIDE,
    load: named(() => import('./scenes/InternalSystemsVisual'), 'InternalSystemsVisual'),
  },
  messagingPlatform: {
    ...WIDE,
    load: named(() => import('./scenes/MessagingPlatformVisual'), 'MessagingPlatformVisual'),
  },
  clientPortal: {
    ...WIDE,
    load: named(() => import('./scenes/ClientPortalVisual'), 'ClientPortalVisual'),
  },
  webApps: {
    ...WIDE,
    load: named(() => import('./scenes/WebAppsVisual'), 'WebAppsVisual'),
  },
  orchestratorPipeline: {
    ...WIDE,
    load: named(() => import('./scenes/OrchestratorPipelineVisual'), 'OrchestratorPipelineVisual'),
  },
  observabilityConsole: {
    ...WIDE,
    load: named(() => import('./scenes/ObservabilityConsoleVisual'), 'ObservabilityConsoleVisual'),
  },
  omnichannel: {
    ...WIDE,
    load: named(() => import('./scenes/OmnichannelVisual'), 'OmnichannelVisual'),
  },
  operatorInbox: {
    ...WIDE,
    load: named(() => import('./scenes/OperatorInboxVisual'), 'OperatorInboxVisual'),
  },
  systemsMap: {
    ...WIDE,
    load: named(() => import('./scenes/SystemsMapVisual'), 'SystemsMapVisual'),
  },
};

const components = new Map<VisualKey, LazyExoticComponent<ComponentType>>();

export function getVisualComponent(key: VisualKey): LazyExoticComponent<ComponentType> {
  let component = components.get(key);
  if (!component) {
    component = lazy(VISUALS[key].load);
    components.set(key, component);
  }
  return component;
}

/** Заранее подгрузить чанк визуала (например, при наведении на вкладку). */
export function preloadVisual(key: VisualKey): void {
  void VISUALS[key].load().catch(() => undefined);
}
