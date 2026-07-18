import { Schema, model, type HydratedDocument } from 'mongoose';

export interface LoginHistory {
  userId?: Schema.Types.ObjectId;
  email?: string;
  success: boolean;
  failureReasonCategory?: string;
  device?: string;
  browser?: string;
  platform?: string;
  ip?: string;
  approximateLocation?: string;
  riskFlags: string[];
  createdAt?: Date;
}

export type LoginHistoryDocument = HydratedDocument<LoginHistory>;

const loginHistorySchema = new Schema<LoginHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    success: { type: Boolean, required: true, index: true },
    failureReasonCategory: { type: String, trim: true, maxlength: 120 },
    device: { type: String, trim: true },
    browser: { type: String, trim: true },
    platform: { type: String, trim: true },
    ip: { type: String, trim: true },
    approximateLocation: { type: String, trim: true },
    riskFlags: [{ type: String, trim: true }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

loginHistorySchema.index({ userId: 1, createdAt: -1 });
loginHistorySchema.index({ success: 1, createdAt: -1 });
loginHistorySchema.index({ riskFlags: 1, createdAt: -1 });

export const LoginHistoryModel = model<LoginHistory>('LoginHistory', loginHistorySchema);
