export const MODERATION_ENTITY_TYPES = ['land', 'worker-profile', 'farm-manager-profile', 'equipment-listing', 'future-marketplace'] as const;

export const LAND_MODERATION_STATUSES = [
  'draft',
  'pending-review',
  'under-verification',
  'needs-revision',
  'approved',
  'published',
  'rejected',
  'archived',
  'hidden',
  'removed',
  'escalated',
] as const;

export const MODERATION_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const MODERATION_DECISIONS = ['approve', 'reject', 'request-revision', 'escalate', 'archive', 'hide', 'remove'] as const;

export const MODERATION_CHECKLIST_ITEMS = [
  'owner-name',
  'location',
  'coordinates',
  'land-area',
  'survey-number',
  'ownership-documents',
  'crop-type',
  'photos',
  'price',
  'description',
  'water-availability',
  'electricity',
  'road-access',
] as const;

export const MODERATION_CHECKLIST_RESULTS = ['pass', 'fail', 'needs-review'] as const;

export const DOCUMENT_REVIEW_TYPES = [
  'ownership-certificate',
  'tax-receipt',
  'survey-document',
  'identity-proof',
  'lease-agreement',
  'supporting-document',
] as const;

export const DOCUMENT_SCAN_STATUSES = ['not-started', 'pending', 'clean', 'infected', 'failed'] as const;
export const DOCUMENT_OCR_STATUSES = ['not-started', 'pending', 'completed', 'failed'] as const;
export const DOCUMENT_REVIEW_STATUSES = ['pending', 'verified', 'rejected', 'needs-review'] as const;

export const MODERATION_ASSIGNMENT_METHODS = ['self', 'admin', 'auto-round-robin', 'auto-least-workload', 'department', 'location'] as const;

export const MODERATION_ESCALATION_LEVELS = ['moderator', 'senior-moderator', 'platform-admin', 'super-admin'] as const;

export const LISTING_FLAG_REASONS = [
  'duplicate-listing',
  'suspicious-price',
  'fake-images',
  'missing-documents',
  'invalid-location',
  'fraud-risk',
  'spam',
  'copyright',
  'other',
] as const;

export const LISTING_FLAG_SOURCES = ['automatic', 'manual'] as const;
export const LISTING_FLAG_STATUSES = ['open', 'reviewing', 'resolved', 'dismissed'] as const;

export const MODERATION_TIMELINE_EVENTS = [
  'submitted',
  'assigned',
  'review-started',
  'reviewed',
  'revision-requested',
  'updated',
  'approved',
  'published',
  'rejected',
  'archived',
  'hidden',
  'removed',
  'escalated',
] as const;

export const MODERATION_SORT_OPTIONS = ['newest', 'oldest', 'priority', 'submission-time', 'review-time'] as const;

export const MODERATION_SOCKET_EVENTS = {
  QUEUE_UPDATED: 'moderation:queue-updated',
  LISTING_ASSIGNED: 'moderation:listing-assigned',
  REVIEW_COMPLETED: 'moderation:review-completed',
  REVISION_SUBMITTED: 'moderation:revision-submitted',
} as const;
