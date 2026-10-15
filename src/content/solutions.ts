import type { IconKey } from '@/components/ui/iconMap';
import type { SlotKey } from './visualSlots';
import type { SubjectKey } from './contact';

export type SolutionKey = 'aiOrchestrator' | 'supportAgent' | 'digitalProcesses';

export type SolutionSlug = 'ai-orchestrator' | 'support-agent' | 'digital-processes';

export type SolutionDef = {
  key: SolutionKey;
  slug: SolutionSlug;
  path: `/solutions/${SolutionSlug}`;
  icon: IconKey;
  /** Якорь секции на главной. */
  anchor: string;
  cardVisual: SlotKey;
  heroVisual: SlotKey;
  /** Тема заявки, которую предзаполняет CTA страницы. */
  subjectKey: SubjectKey;
};

export const SOLUTIONS: readonly SolutionDef[] = [
  {
    key: 'aiOrchestrator',
    slug: 'ai-orchestrator',
    path: '/solutions/ai-orchestrator',
    icon: 'network',
    anchor: '#orchestrator',
    cardVisual: 'pillarOrchestrator',
    heroVisual: 'solutionOrchestratorHero',
    subjectKey: 'aiOrchestrator',
  },
  {
    key: 'supportAgent',
    slug: 'support-agent',
    path: '/solutions/support-agent',
    icon: 'headset',
    anchor: '#support',
    cardVisual: 'pillarSupportAgent',
    heroVisual: 'solutionSupportHero',
    subjectKey: 'supportAgent',
  },
  {
    key: 'digitalProcesses',
    slug: 'digital-processes',
    path: '/solutions/digital-processes',
    icon: 'layoutDashboard',
    anchor: '#processes',
    cardVisual: 'pillarDigitalProcesses',
    heroVisual: 'solutionDigitalHero',
    subjectKey: 'digitalProcesses',
  },
];

export function getSolutionBySlug(slug: string | undefined): SolutionDef | undefined {
  return SOLUTIONS.find((solution) => solution.slug === slug);
}
