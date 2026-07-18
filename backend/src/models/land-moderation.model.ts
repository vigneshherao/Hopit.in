import { Schema, model, type HydratedDocument } from 'mongoose';
import {
  DOCUMENT_OCR_STATUSES,
  DOCUMENT_REVIEW_STATUSES,
  DOCUMENT_REVIEW_TYPES,
  DOCUMENT_SCAN_STATUSES,
  LAND_MODERATION_STATUSES,
  MODERATION_CHECKLIST_ITEMS,
  MODERATION_CHECKLIST_RESULTS,
  MODERATION_ENTITY_TYPES,
  MODERATION_ESCALATION_LEVELS,
  MODERATION_PRIORITIES,
  MODERATION_TIMELINE_EVENTS,
} from '@/constants/moderation.constants.js';

export interface LandModeration {
  landId: Schema.Types.ObjectId;
  entityType: (typeof MODERATION_ENTITY_TYPES)[number];
  submittedBy: Schema.Types.ObjectId;
  assignedModerator?: Schema.Types.ObjectId;
  status: (typeof LAND_MODERATION_STATUSES)[number];
  priority: (typeof MODERATION_PRIORITIES)[number];
  reviewStartedAt?: Date;
  reviewCompletedAt?: Date;
  reviewDuration?: number;
  escalationLevel?: (typeof MODERATION_ESCALATION_LEVELS)[number];
  reviewerComments?: {
    internalNotes?: string;
    userVisibleNotes?: string;
  };
  checklist: {
    item: (typeof MODERATION_CHECKLIST_ITEMS)[number];
    result: (typeof MODERATION_CHECKLIST_RESULTS)[number];
    notes?: string;
  }[];
  documentReviews: {
    documentId?: string;
    type: (typeof DOCUMENT_REVIEW_TYPES)[number];
    name: string;
    url?: string;
    virusScanStatus: (typeof DOCUMENT_SCAN_STATUSES)[number];
    ocrStatus: (typeof DOCUMENT_OCR_STATUSES)[number];
    ocrText?: string;
    ocrConfidence?: number;
    reviewStatus: (typeof DOCUMENT_REVIEW_STATUSES)[number];
    expiry?: Date;
    verificationResult?: string;
    reviewerId?: Schema.Types.ObjectId;
    reviewedAt?: Date;
  }[];
  timeline: {
    event: (typeof MODERATION_TIMELINE_EVENTS)[number];
    actorId?: Schema.Types.ObjectId;
    message: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }[];
  currentVersion: number;
  flagsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LandModerationDocument = HydratedDocument<LandModeration>;

const landModerationSchema = new Schema<LandModeration>(
  {
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, unique: true, index: true },
    entityType: { type: String, enum: MODERATION_ENTITY_TYPES, default: 'land', index: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedModerator: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: LAND_MODERATION_STATUSES, default: 'pending-review', index: true },
    priority: { type: String, enum: MODERATION_PRIORITIES, default: 'medium', index: true },
    reviewStartedAt: Date,
    reviewCompletedAt: Date,
    reviewDuration: { type: Number, min: 0 },
    escalationLevel: { type: String, enum: MODERATION_ESCALATION_LEVELS, default: 'moderator', index: true },
    reviewerComments: {
      internalNotes: { type: String, trim: true, maxlength: 3000 },
      userVisibleNotes: { type: String, trim: true, maxlength: 3000 },
    },
    checklist: [
      {
        item: { type: String, enum: MODERATION_CHECKLIST_ITEMS, required: true },
        result: { type: String, enum: MODERATION_CHECKLIST_RESULTS, default: 'needs-review' },
        notes: { type: String, trim: true, maxlength: 1000 },
      },
    ],
    documentReviews: [
      {
        documentId: { type: String, trim: true },
        type: { type: String, enum: DOCUMENT_REVIEW_TYPES, required: true },
        name: { type: String, required: true, trim: true },
        url: { type: String, trim: true, select: false },
        virusScanStatus: { type: String, enum: DOCUMENT_SCAN_STATUSES, default: 'not-started' },
        ocrStatus: { type: String, enum: DOCUMENT_OCR_STATUSES, default: 'not-started' },
        ocrText: { type: String, trim: true, maxlength: 5000 },
        ocrConfidence: { type: Number, min: 0, max: 100 },
        reviewStatus: { type: String, enum: DOCUMENT_REVIEW_STATUSES, default: 'pending' },
        expiry: Date,
        verificationResult: { type: String, trim: true, maxlength: 1000 },
        reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: Date,
      },
    ],
    timeline: [
      {
        event: { type: String, enum: MODERATION_TIMELINE_EVENTS, required: true },
        actorId: { type: Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true, trim: true, maxlength: 1000 },
        metadata: { type: Schema.Types.Mixed },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    currentVersion: { type: Number, default: 1, min: 1 },
    flagsCount: { type: Number, default: 0, min: 0, index: true },
  },
  { timestamps: true },
);

landModerationSchema.index({ status: 1, priority: 1, updatedAt: -1 });
landModerationSchema.index({ assignedModerator: 1, status: 1, updatedAt: -1 });
landModerationSchema.index({ submittedBy: 1, status: 1 });

export const LandModerationModel = model<LandModeration>('LandModeration', landModerationSchema);
