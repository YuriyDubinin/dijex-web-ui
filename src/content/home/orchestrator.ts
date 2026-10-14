import type { IconKey } from '@/components/ui/iconMap';
import type { Resources } from '@/i18n/resources';

type ColumnKey = keyof Resources['home']['orchestrator']['columns'];

/** Колонка схемы; ключи элементов совпадают с home.json → orchestrator.columns.<key>.items. */
export type DiagramColumn = {
  key: ColumnKey;
  items: readonly { key: string; icon: IconKey }[];
};

export const DIAGRAM_COLUMNS = [
  {
    key: 'inputs',
    items: [
      { key: 'messengers', icon: 'messageCircle' },
      { key: 'web', icon: 'globe' },
      { key: 'email', icon: 'mail' },
      { key: 'employees', icon: 'users' },
      { key: 'events', icon: 'code' },
    ],
  },
  {
    key: 'core',
    items: [
      { key: 'intent', icon: 'brain' },
      { key: 'routing', icon: 'route' },
      { key: 'memory', icon: 'database' },
      { key: 'tools', icon: 'wrench' },
      { key: 'guardrails', icon: 'shieldCheck' },
    ],
  },
  {
    key: 'agents',
    items: [
      { key: 'support', icon: 'headset' },
      { key: 'sales', icon: 'trendingUp' },
      { key: 'documents', icon: 'fileText' },
      { key: 'analytics', icon: 'chartLine' },
      { key: 'human', icon: 'userCheck' },
    ],
  },
  {
    key: 'systems',
    items: [
      { key: 'crm', icon: 'users' },
      { key: 'erp', icon: 'layers' },
      { key: 'helpdesk', icon: 'inbox' },
      { key: 'knowledge', icon: 'bookOpen' },
      { key: 'bi', icon: 'chartLine' },
    ],
  },
] as const satisfies readonly DiagramColumn[];

export const ORCHESTRATOR_FEATURES: readonly {
  key: keyof Resources['home']['orchestrator']['features'];
  icon: IconKey;
}[] = [
  { key: 'multiModel', icon: 'route' },
  { key: 'yourData', icon: 'bookOpen' },
  { key: 'actions', icon: 'wrench' },
  { key: 'humanInLoop', icon: 'userCheck' },
  { key: 'transparency', icon: 'eye' },
  { key: 'security', icon: 'shieldCheck' },
];

export const ORCHESTRATOR_EXAMPLES: readonly {
  key: keyof Resources['home']['orchestrator']['examples'];
  icon: IconKey;
}[] = [
  { key: 'inbound', icon: 'inbox' },
  { key: 'assistant', icon: 'users' },
  { key: 'documents', icon: 'fileText' },
];

/** Куда исполнители пишут данные — связи «исполнитель → система» на схеме. */
export const AGENT_SYSTEM_LINKS: Readonly<Record<string, readonly string[]>> = {
  support: ['crm', 'helpdesk', 'knowledge'],
  sales: ['crm'],
  documents: ['erp', 'knowledge'],
  analytics: ['bi'],
  human: ['helpdesk'],
};
