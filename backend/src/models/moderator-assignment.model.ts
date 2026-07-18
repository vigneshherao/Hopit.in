import { Schema, model, type HydratedDocument } from 'mongoose';
import { MODERATION_ASSIGNMENT_METHODS } from '@/constants/moderation.constants.js';

export interface ModeratorAssignment {
  moderationId: Schema.Types.ObjectId;
  landId: Schema.Types.ObjectId;
  moderatorId: Schema.Types.ObjectId;
  assignedBy?: Schema.Types.ObjectId;
  method: (typeof MODERATION_ASSIGNMENT_METHODS)[number];
  reason?: string;
  active: boolean;
  assignedAt: Date;
  unassignedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ModeratorAssignmentDocument = HydratedDocument<ModeratorAssignment>;

const moderatorAssignmentSchema = new Schema<ModeratorAssignment>(
  {
    moderationId: { type: Schema.Types.ObjectId, ref: 'LandModeration', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    moderatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    method: { type: String, enum: MODERATION_ASSIGNMENT_METHODS, default: 'admin', index: true },
    reason: { type: String, trim: true, maxlength: 1000 },
    active: { type: Boolean, default: true, index: true },
    assignedAt: { type: Date, default: Date.now },
    unassignedAt: Date,
  },
  { timestamps: true },
);

moderatorAssignmentSchema.index({ moderatorId: 1, active: 1, assignedAt: -1 });

export const ModeratorAssignmentModel = model<ModeratorAssignment>('ModeratorAssignment', moderatorAssignmentSchema);
