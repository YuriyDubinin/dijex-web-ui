import type { Resources } from '@/i18n/resources';
import type { SlotKey } from '../visualSlots';
import type { SolutionKey } from '../solutions';

type CaseItems = Resources['home']['cases']['items'];
export type CaseKey = keyof CaseItems;

export type CaseDef<K extends CaseKey = CaseKey> = {
  key: K;
  /** Визуальное место (сцена). */
  visual: SlotKey;
  /** Технологии — не переводятся. */
  tags: readonly string[];
  solutions: readonly SolutionKey[];
  metrics: readonly { key: string; value: string }[];
};

/*
 * Шаблон нового кейса (только реальные проекты):
 * 1. Добавить сцену кейса (src/components/visuals/scenes/), её ключ в VISUAL_SLOTS (src/content/visualSlots.ts)
 *    и объект сюда: key, visual, tags, solutions, metrics. Статичных картинок на сайте нет.
 * 2. Добавить тексты в locales/<lang>/home.json → cases.items.<key>:
 *    client, title, summary, challenge, solution, result, metrics.{<metricKey>: подпись}.
 */
export const CASES: readonly CaseDef[] = [
  {
    key: 'newsFeeder',
    visual: 'caseNewsFeeder',
    tags: ['Grok', 'Qwen', 'Go', 'PostgreSQL', 'Elasticsearch'],
    solutions: ['aiOrchestrator'],
    metrics: [{ key: 'languages', value: '20+' }],
  },
  {
    key: 'aiAssistant',
    visual: 'caseAiAssistant',
    tags: ['Next.js', 'LangChain', 'AI', 'pgvector'],
    solutions: ['supportAgent', 'aiOrchestrator'],
    metrics: [{ key: 'automated', value: '60%' }],
  },
  {
    key: 'enterpriseSuite',
    visual: 'caseEnterpriseSuite',
    tags: ['Go', 'React', 'PostgreSQL', 'Docker'],
    solutions: ['digitalProcesses'],
    metrics: [],
  },
];
