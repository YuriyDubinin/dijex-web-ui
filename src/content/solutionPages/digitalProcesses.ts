import type { SolutionPageDef } from './types';

export const DIGITAL_PROCESSES_PAGE: SolutionPageDef = {
  key: 'digitalProcesses',
  pains: [
    { key: 'spreadsheets', icon: 'fileText' },
    { key: 'people', icon: 'users' },
    { key: 'calls', icon: 'bell' },
    { key: 'disconnected', icon: 'plug' },
  ],
  steps: [
    { key: 'audit', icon: 'search' },
    { key: 'map', icon: 'route' },
    { key: 'mvp', icon: 'zap' },
    { key: 'integrations', icon: 'plug' },
    { key: 'growth', icon: 'trendingUp' },
  ],
  capabilities: [
    { key: 'process', icon: 'workflow' },
    { key: 'integrations', icon: 'plug' },
    { key: 'roles', icon: 'keyRound' },
    { key: 'analytics', icon: 'chartLine' },
    { key: 'architecture', icon: 'layers' },
    { key: 'support', icon: 'wrench' },
  ],
  useCases: [
    { key: 'fleet', icon: 'truck' },
    { key: 'approvals', icon: 'workflow' },
    { key: 'b2bPortal', icon: 'circleUser' },
    { key: 'corporateChat', icon: 'messageCircle' },
  ],
  // TODO: уточнить — подтверждённые метрики; пока блок скрыт
  metrics: [],
  faq: ['oneModule', 'existing', 'code', 'support', 'price'],
  special: {
    kind: 'directions',
    directions: ['internal', 'messaging', 'portals', 'apps'],
    aiBoost: [
      { key: 'search', icon: 'search' },
      { key: 'autofill', icon: 'fileText' },
      { key: 'notifications', icon: 'bell' },
      { key: 'assistant', icon: 'bot' },
    ],
  },
};
