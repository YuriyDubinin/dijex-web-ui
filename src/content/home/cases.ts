import type { Resources } from '@/i18n/resources';
import type { ImageKey } from '../images';
import type { SolutionKey } from '../solutions';

type CaseItems = Resources['home']['cases']['items'];
export type CaseKey = keyof CaseItems;

export type CaseDef<K extends CaseKey = CaseKey> = {
  key: K;
  image: ImageKey;
  /** Технологии — не переводятся. */
  tags: readonly string[];
  solutions: readonly SolutionKey[];
  metrics: readonly { key: string; value: string }[];
};

/*
 * Шаблон нового кейса (только реальные проекты):
 * 1. Добавить объект сюда: key, image (и файл в public/images/), tags, solutions, metrics.
 * 2. Добавить тексты в locales/<lang>/home.json → cases.items.<key>:
 *    client, title, summary, challenge, solution, result, metrics.{<metricKey>: подпись}.
 */
export const CASES: readonly CaseDef[] = [
  {
    key: 'newsFeeder',
    image: 'caseNewsFeeder',
    tags: ['Grok', 'Qwen', 'Go', 'PostgreSQL', 'Elasticsearch'],
    solutions: ['aiOrchestrator'],
    metrics: [{ key: 'languages', value: '20+' }],
  },
  {
    key: 'aiAssistant',
    image: 'caseAiAssistant',
    tags: ['Next.js', 'LangChain', 'AI', 'pgvector'],
    solutions: ['supportAgent', 'aiOrchestrator'],
    metrics: [{ key: 'automated', value: '60%' }],
  },
  {
    key: 'enterpriseSuite',
    image: 'caseEnterpriseSuite',
    tags: ['Go', 'React', 'PostgreSQL', 'Docker'],
    solutions: ['digitalProcesses'],
    metrics: [],
  },
];
