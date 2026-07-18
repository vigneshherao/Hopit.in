import { Schema, model, type HydratedDocument } from 'mongoose';
import { VERIFICATION_STATUSES, VERIFICATION_TYPES } from '@/constants/admin.constants.js';

export interface UserVerification {
  userId: Schema.Types.ObjectId;
  verificationType: (typeof VERIFICATION_TYPES)[number];
  status: (typeof VERIFICATION_STATUSES)[number];
  submittedDocuments: { documentType: string; attachmentId?: Schema.Types.ObjectId; submittedAt: Date }[];
  reviewNotes?: string;
  rejectionReason?: string;
  reviewedBy?: Schema.Types.ObjectId;
  reviewedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserVerificationDocument = HydratedDocument<UserVerification>;

const userVerificationSchema = new Schema<UserVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    verificationType: { type: String, enum: VERIFICATION_TYPES, required: true, index: true },
    status: { type: String, enum: VERIFICATION_STATUSES, default: 'not-submitted', index: true },
    submittedDocuments: [
      {
        documentType: { type: String, required: true, trim: true, maxlength: 120 },
        attachmentId: { type: Schema.Types.ObjectId },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    reviewNotes: { type: String, trim: true, maxlength: 2000 },
    rejectionReason: { type: String, trim: true, maxlength: 1000 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    reviewedAt: Date,
    expiresAt: Date,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, optimisticConcurrency: true },
);

userVerificationSchema.index({ userId: 1, verificationType: 1 }, { unique: true });
userVerificationSchema.index({ status: 1, verificationType: 1, createdAt: -1 });

export const UserVerificationModel = model<UserVerification>('UserVerification', userVerificationSchema);
