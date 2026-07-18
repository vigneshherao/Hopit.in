export const PROFESSIONAL_ROLES = [
  'farm-manager',
  'farm-supervisor',
  'general-farm-worker',
  'seasonal-worker',
  'tractor-driver',
  'harvester-operator',
  'irrigation-specialist',
  'soil-specialist',
  'organic-farming-expert',
  'crop-consultant',
  'horticulture-expert',
  'dairy-worker',
  'poultry-worker',
  'fish-farming-worker',
  'coconut-specialist',
  'arecanut-specialist',
  'pepper-specialist',
  'coffee-specialist',
  'banana-specialist',
  'security-guard',
  'farm-caretaker',
  'warehouse-worker',
  'transport-driver',
  'drone-operator',
  'other',
] as const;

export const WORKER_SKILLS = [
  'land-preparation',
  'sowing',
  'transplanting',
  'weeding',
  'fertilizer-application',
  'pesticide-spraying',
  'irrigation',
  'drip-irrigation',
  'harvesting',
  'packing',
  'grading',
  'tractor-operation',
  'machine-operation',
  'disease-identification',
  'organic-farming',
  'greenhouse-farming',
  'hydroponics',
  'farm-accounting',
  'worker-management',
  'inventory-management',
  'crop-planning',
  'farm-security',
  'livestock-care',
  'dairy-management',
  'poultry-management',
  'aquaculture',
  'drone-monitoring',
  'reporting',
] as const;

export const WORKER_AVAILABILITY_STATUSES_EXTENDED = ['available', 'busy', 'partially-available', 'unavailable'] as const;
export const DURATION_TYPES = ['daily', 'weekly', 'monthly', 'seasonal', 'long-term', 'contract'] as const;
export const VERIFICATION_STATUSES = ['not-submitted', 'pending', 'verified', 'rejected'] as const;
export const WORKER_DOCUMENT_TYPES = ['identity-proof', 'address-proof', 'experience-certificate', 'driving-license', 'equipment-license', 'other'] as const;
export const DOCUMENT_VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'] as const;
export const TEAM_MEMBER_STATUSES = ['invited', 'active', 'inactive'] as const;

export const FARM_JOB_WORK_TYPES = ['one-time', 'daily', 'weekly', 'seasonal', 'monthly', 'long-term', 'farm-management', 'contract'] as const;
export const FARM_JOB_HIRING_TYPES = ['individual', 'multiple-workers', 'team', 'farm-manager', 'service-provider'] as const;
export const FARM_JOB_PAYMENT_TYPES = ['daily', 'weekly', 'monthly', 'fixed-contract', 'negotiable'] as const;
export const FARM_JOB_STATUSES = ['draft', 'open', 'paused', 'filled', 'in-progress', 'completed', 'cancelled', 'expired'] as const;

export const WORKER_JOB_APPLICATION_TYPES = ['individual', 'team'] as const;
export const WORKER_JOB_APPLICATION_STATUSES = ['submitted', 'under-review', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'cancelled'] as const;
export const ACTIVE_WORKER_JOB_APPLICATION_STATUSES = ['submitted', 'under-review', 'shortlisted', 'accepted'] as const;

export const WORKER_BOOKING_TYPES = ['individual', 'team', 'farm-manager', 'service-provider'] as const;
export const WORKER_BOOKING_PAYMENT_TYPES = ['daily', 'weekly', 'monthly', 'fixed-contract'] as const;
export const WORKER_BOOKING_STATUSES_EXTENDED = ['pending-confirmation', 'confirmed', 'in-progress', 'paused', 'completed', 'cancelled', 'disputed'] as const;

export const FARM_MANAGEMENT_REPORTING_FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly'] as const;
export const FARM_MANAGEMENT_STATUSES = ['pending', 'active', 'paused', 'completed', 'cancelled'] as const;
export const CROP_HEALTH_STATUSES = ['excellent', 'good', 'attention-required', 'critical', 'not-applicable'] as const;

export type ProfessionalRole = (typeof PROFESSIONAL_ROLES)[number];
export type WorkerSkill = (typeof WORKER_SKILLS)[number];
export type FarmJobStatus = (typeof FARM_JOB_STATUSES)[number];
export type WorkerJobApplicationStatus = (typeof WORKER_JOB_APPLICATION_STATUSES)[number];
export type WorkerBookingStatusExtended = (typeof WORKER_BOOKING_STATUSES_EXTENDED)[number];
