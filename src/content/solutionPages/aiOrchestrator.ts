import type { SolutionPageDef } from './types';

export const AI_ORCHESTRATOR_PAGE: SolutionPageDef = {
  key: 'aiOrchestrator',
  pains: [
    { key: 'scattered', icon: 'layers' },
    { key: 'hallucinations', icon: 'circleAlert' },
    { key: 'opaque', icon: 'eye' },
    { key: 'stops', icon: 'wrench' },
  ],
  steps: [
    { key: 'request', icon: 'inbox' },
    { key: 'understanding', icon: 'brain' },
    { key: 'routing', icon: 'route' },
    { key: 'action', icon: 'zap' },
    { key: 'control', icon: 'shieldCheck' },
    { key: 'result', icon: 'chartLine' },
  ],
  capabilities: [
    { key: 'routing', icon: 'route' },
    { key: 'multiAgent', icon: 'bot' },
    { key: 'rag', icon: 'bookOpen' },
    { key: 'tools', icon: 'wrench' },
    { key: 'memory', icon: 'database' },
    { key: 'human', icon: 'userCheck' },
    { key: 'guardrails', icon: 'shieldCheck' },
    { key: 'observability', icon: 'eye' },
    { key: 'cost', icon: 'chartLine' },
  ],
  useCases: [
    { key: 'inbound', icon: 'inbox' },
    { key: 'assistant', icon: 'users' },
    { key: 'documents', icon: 'fileText' },
    { key: 'sales', icon: 'trendingUp' },
    { key: 'analytics', icon: 'search' },
  ],
  // TODO: уточнить — подтверждённые метрики оркестратора; пока блок скрыт
  metrics: [],
  faq: ['chatbot', 'localOnly', 'cost', 'duration', 'mistakes'],
  special: {
    kind: 'deployment',
    models: ['OpenAI', 'Anthropic Claude', 'Qwen', 'Grok', 'Llama', 'Mistral'],
    consoleImage: 'solutionOrchestratorConsole',
  },
};
