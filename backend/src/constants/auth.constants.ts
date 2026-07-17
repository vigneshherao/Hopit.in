export const USER_ROLES = ['owner', 'farmer', 'worker', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SELF_REGISTER_ROLES = ['owner', 'farmer', 'worker'] as const;
export type SelfRegisterRole = (typeof SELF_REGISTER_ROLES)[number];

export const LAND_AREA_UNITS = ['acre', 'hectare', 'cent'] as const;
export const SOIL_TYPES = [
  'red',
  'black',
  'alluvial',
  'laterite',
  'clay',
  'sandy',
  'loamy',
  'unknown',
] as const;
export const LEASE_TYPES = ['fixed-rent', 'revenue-share', 'both'] as const;
export const LAND_STATUSES = ['draft', 'available', 'occupied', 'inactive'] as const;
export const APPLICATION_STATUSES = [
  'pending',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn',
] as const;
export const ACTIVE_APPLICATION_STATUSES = ['pending', 'shortlisted', 'accepted'] as const;
export const WORKER_AVAILABILITY_STATUSES = ['available', 'busy', 'unavailable'] as const;
export const WORKER_BOOKING_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'cancelled',
  'completed',
] as const;
export const AI_HISTORY_FEATURES = [
  'chat',
  'crop-recommendation',
  'farm-plan',
  'profit-calculation',
  'disease-analysis',
] as const;

export const REFRESH_TOKEN_COOKIE_NAME = 'hopit_refresh_token';
