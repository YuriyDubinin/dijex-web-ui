import type { SolutionKey } from '../solutions';
import { AI_ORCHESTRATOR_PAGE } from './aiOrchestrator';
import { SUPPORT_AGENT_PAGE } from './supportAgent';
import { DIGITAL_PROCESSES_PAGE } from './digitalProcesses';
import type { SolutionPageDef } from './types';

export const SOLUTION_PAGES: Record<SolutionKey, SolutionPageDef> = {
  aiOrchestrator: AI_ORCHESTRATOR_PAGE,
  supportAgent: SUPPORT_AGENT_PAGE,
  digitalProcesses: DIGITAL_PROCESSES_PAGE,
};

export type { SolutionPageDef, SolutionPageText, SolutionSpecial } from './types';
