import type { SolutionPageDef } from './types';

export const SUPPORT_AGENT_PAGE: SolutionPageDef = {
  key: 'supportAgent',
  pains: [
    { key: 'night', icon: 'clock' },
    { key: 'channels', icon: 'messagesSquare' },
    { key: 'languages', icon: 'languages' },
    { key: 'repetitive', icon: 'repeat' },
  ],
  steps: [
    { key: 'message', icon: 'messageCircle' },
    { key: 'detect', icon: 'languages' },
    { key: 'find', icon: 'search' },
    { key: 'act', icon: 'zap' },
    { key: 'handoff', icon: 'userCheck' },
    { key: 'analytics', icon: 'chartLine' },
  ],
  capabilities: [
    { key: 'always', icon: 'clock' },
    { key: 'languages', icon: 'languages' },
    { key: 'translation', icon: 'globe' },
    { key: 'inbox', icon: 'messagesSquare' },
    { key: 'handoff', icon: 'userCheck' },
    { key: 'actions', icon: 'zap' },
    { key: 'brand', icon: 'sparkles' },
    { key: 'media', icon: 'smartphone' },
    { key: 'proactive', icon: 'bell' },
  ],
  useCases: [
    { key: 'ecommerce', icon: 'shoppingBag' },
    { key: 'clinic', icon: 'stethoscope' },
    { key: 'hotel', icon: 'plane' },
    { key: 'fintech', icon: 'landmark' },
    { key: 'education', icon: 'graduationCap' },
    { key: 'b2b', icon: 'factory' },
  ],
  // TODO: уточнить — 60% из кейса AI-ассистента, «< 5 с» не подтверждено
  metrics: [
    { key: 'automated', value: 60 },
    { key: 'always', value: 24 },
    { key: 'reply', value: 5 },
  ],
  faq: ['knowledge', 'unhappy', 'oneChannel', 'brand', 'effect'],
  special: {
    kind: 'channels',
    inboxImage: 'solutionSupportInbox',
    // TODO: уточнить — реальные сроки запуска
    timeline: ['week1', 'week2', 'week3', 'next'],
  },
};
