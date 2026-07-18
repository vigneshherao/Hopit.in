import { z } from 'zod';
import {
  DOCUMENT_OCR_STATUSES,
  DOCUMENT_REVIEW_STATUSES,
  DOCUMENT_REVIEW_TYPES,
  DOCUMENT_SCAN_STATUSES,
  LAND_MODERATION_STATUSES,
  LISTING_FLAG_REASONS,
  LISTING_FLAG_SOURCES,
  MODERATION_ASSIGNMENT_METHODS,
  MODERATION_CHECKLIST_ITEMS,
  MODERATION_CHECKLIST_RESULTS,
  MODERATION_DECISIONS,
  MODERATION_ESCALATION_LEVELS,
  MODERATION_PRIORITIES,
  MODERATION_SORT_OPTIONS,
} from '@/constants/moderation.constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.');

export const moderationIdParamSchema = z.object({ moderationId: objectId });

export const moderationQueueQuerySchema = z.object({
  cursor: objectId.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(LAND_MODERATION_STATUSES).optional(),
  queue: z.enum(['pending', 'assigned', 'high-priority', 'escalated', 'rejected', 'revision', 'completed']).optional(),
  assignedModerator: objectId.optional(),
  priority: z.enum(MODERATION_PRIORITIES).optional(),
  district: z.string().trim().max(120).optional(),
  crop: z.string().trim().max(120).optional(),
  q: z.string().trim().max(160).optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
  updatedFrom: z.coerce.date().optional(),
  updatedTo: z.coerce.date().optional(),
  sort: z.enum(MODERATION_SORT_OPTIONS).default('newest'),
});

export const moderationAssignSchema = z.object({
  moderationId: objectId,
  moderatorId: objectId.optional(),
  method: z.enum(MODERATION_ASSIGNMENT_METHODS).default('admin'),
  reason: z.string().trim().max(1000).optional(),
}).refine((value) => value.method === 'self' || Boolean(value.moderatorId), {
  path: ['moderatorId'],
  message: 'Moderator is required unless self assigning.',
});

const checklistItemSchema = z.object({
  item: z.enum(MODERATION_CHECKLIST_ITEMS),
  result: z.enum(MODERATION_CHECKLIST_RESULTS),
  notes: z.string().trim().max(1000).optional(),
});

const documentReviewSchema = z.object({
  documentId: z.string().trim().max(120).optional(),
  type: z.enum(DOCUMENT_REVIEW_TYPES),
  name: z.string().trim().min(2).max(160),
  url: z.string().trim().url().optional(),
  virusScanStatus: z.enum(DOCUMENT_SCAN_STATUSES).default('not-started'),
  ocrStatus: z.enum(DOCUMENT_OCR_STATUSES).default('not-started'),
  ocrText: z.string().trim().max(5000).optional(),
  ocrConfidence: z.number().min(0).max(100).optional(),
  reviewStatus: z.enum(DOCUMENT_REVIEW_STATUSES).default('pending'),
  expiry: z.coerce.date().optional(),
  verificationResult: z.string().trim().max(1000).optional(),
});

export const moderationReviewSchema = z.object({
  moderationId: objectId,
  checklist: z.array(checklistItemSchema).min(1).max(30),
  documents: z.array(documentReviewSchema).max(30).default([]),
  notes: z.string().trim().max(3000).optional(),
  userVisibleNotes: z.string().trim().max(3000).optional(),
  attachments: z.array(z.string().trim().url()).max(20).default([]),
});

export const moderationDecisionSchema = moderationReviewSchema.extend({
  decision: z.enum(MODERATION_DECISIONS),
  reason: z.string().trim().min(5).max(1200),
});

export const moderationSimpleDecisionSchema = z.object({
  moderationId: objectId,
  reason: z.string().trim().min(5).max(1200),
  notes: z.string().trim().max(3000).optional(),
  userVisibleNotes: z.string().trim().max(3000).optional(),
});

export const moderationEscalateSchema = moderationSimpleDecisionSchema.extend({
  escalationLevel: z.enum(MODERATION_ESCALATION_LEVELS).default('senior-moderator'),
});

export const moderationFlagSchema = z.object({
  moderationId: objectId.optional(),
  landId: objectId,
  reason: z.enum(LISTING_FLAG_REASONS),
  source: z.enum(LISTING_FLAG_SOURCES).default('manual'),
  priority: z.enum(MODERATION_PRIORITIES).default('medium'),
  description: z.string().trim().max(2000).optional(),
});
