import { Schema, model, type HydratedDocument } from 'mongoose';

export interface UserStatusHistory {
  userId: Schema.Types.ObjectId;
  previousStatus?: string;
  newStatus: string;
  reason: string;
  changedBy: Schema.Types.ObjectId;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export type UserStatusHistoryDocument = HydratedDocument<UserStatusHistory>;

const userStatusHistorySchema = new Schema<UserStatusHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    previousStatus: { type: String, trim: true },
    newStatus: { type: String, required: true, trim: true, index: true },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: Date,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userStatusHistorySchema.index({ userId: 1, createdAt: -1 });
userStatusHistorySchema.pre('updateOne', function preventUpdate() { throw new Error('User status history is append-only.'); });
userStatusHistorySchema.pre('deleteOne', function preventDelete() { throw new Error('User status history is append-only.'); });

export const UserStatusHistoryModel = model<UserStatusHistory>('UserStatusHistory', userStatusHistorySchema);
