export const NOTIFICATION_TYPES = [
  'system',
  'agreement',
  'application',
  'worker',
  'task',
  'reminder',
  'expense',
  'income',
  'weather',
  'disease',
  'monitoring',
  'admin',
  'security',
  'general',
] as const;

export const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const ACTIVITY_VISIBILITIES = ['private', 'farm-team', 'agreement', 'public', 'admin'] as const;
export const PRESENCE_STATUSES = ['online', 'offline', 'away', 'busy', 'invisible'] as const;

export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  NOTIFICATION_READ: 'notification-read',
  ACTIVITY_READ: 'activity-read',
  PRESENCE_UPDATE: 'presence-update',
  HEARTBEAT: 'heartbeat',
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_UPDATE: 'notification:update',
  NOTIFICATION_DELETE: 'notification:delete',
  ACTIVITY_NEW: 'activity:new',
  PRESENCE_UPDATED: 'presence:update',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  SYSTEM_BROADCAST: 'system:broadcast',
} as const;

export const SOCKET_HEARTBEAT_MS = 30_000;
export const SOCKET_INACTIVE_TIMEOUT_MS = 90_000;
