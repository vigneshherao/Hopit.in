export const FARM_PLAN_STATUSES = ['draft', 'active', 'paused', 'completed', 'cancelled'] as const;
export const FARM_PLAN_STAGES = [
  'planning',
  'land-preparation',
  'seed-selection',
  'sowing',
  'irrigation',
  'fertilizer',
  'pest-management',
  'growth-monitoring',
  'harvest',
  'post-harvest',
  'completed',
] as const;

export type FarmPlanStatus = (typeof FARM_PLAN_STATUSES)[number];
export type FarmPlanStage = (typeof FARM_PLAN_STAGES)[number];
