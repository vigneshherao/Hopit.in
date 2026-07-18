import { Schema, model, type HydratedDocument } from 'mongoose';
import { IMPERSONATION_STATUSES } from '@/constants/admin.constants.js';

export interface ImpersonationSession {
  adminId: Schema.Types.ObjectId;
  targetUserId: Schema.Types.ObjectId;
  reason: string;
  ticketReference?: string;
  status: (typeof IMPERSONATION_STATUSES)[number];
  startedAt: Date;
  expiresAt: Date;
  endedAt?: Date;
  endedBy?: Schema.Types.ObjectId;
  ip?: string;
  device?: string;
  createdAt?: Date;
}

export type ImpersonationSessionDocument = HydratedDocument<ImpersonationSession>;

const impersonationSessionSchema = new Schema<ImpersonationSession>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    ticketReference: { type: String, trim: true, maxlength: 120 },
    status: { type: String, enum: IMPERSONATION_STATUSES, default: 'active', index: true },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    endedAt: Date,
    endedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    ip: { type: String, trim: true },
    device: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

impersonationSessionSchema.index({ adminId: 1, status: 1 });
impersonationSessionSchema.index({ targetUserId: 1, status: 1 });

export const ImpersonationSessionModel = model<ImpersonationSession>('ImpersonationSession', impersonationSessionSchema);
