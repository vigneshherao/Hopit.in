export const FARM_TASK_CATEGORIES = [
  'Land Preparation',
  'Ploughing',
  'Rotavator',
  'Stone Removal',
  'Leveling',
  'Water Channel',
  'Drip Installation',
  'Seed Purchase',
  'Seed Treatment',
  'Nursery Preparation',
  'Sowing',
  'Transplanting',
  'Irrigation',
  'Fertilizer',
  'Organic Fertilizer',
  'Chemical Fertilizer',
  'Micronutrients',
  'Pesticide Spray',
  'Disease Monitoring',
  'Weeding',
  'Pruning',
  'Harvesting',
  'Packing',
  'Storage',
  'Transportation',
  'Sales',
  'Inspection',
  'Custom',
] as const;

export const FARM_TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const FARM_TASK_STATUSES = ['Pending', 'Scheduled', 'In Progress', 'Completed', 'Skipped', 'Cancelled', 'Delayed'] as const;
export const FARM_CALENDAR_REPEAT_TYPES = ['none', 'daily', 'weekly', 'monthly'] as const;

export type FarmTaskCategory = (typeof FARM_TASK_CATEGORIES)[number];
export type FarmTaskPriority = (typeof FARM_TASK_PRIORITIES)[number];
export type FarmTaskStatus = (typeof FARM_TASK_STATUSES)[number];
