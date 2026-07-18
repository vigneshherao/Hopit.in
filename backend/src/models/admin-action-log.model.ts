import { Schema, model, type HydratedDocument } from 'mongoose';
import { ADMIN_ACTION_RESULTS } from '@/constants/admin.constants.js';

export interface AdminActionLog {
  adminId?: Schema.Types.ObjectId;
  adminProfileId?: Schema.Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: Schema.Types.ObjectId;
  permissionUsed?: string;
  result: (typeof ADMIN_ACTION_RESULTS)[number];
  reason?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  requestId?: string;
  ip?: string;
  device?: string;
  browser?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export type AdminActionLogDocument = HydratedDocument<AdminActionLog>;

const adminActionLogSchema = new Schema<AdminActionLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    adminProfileId: { type: Schema.Types.ObjectId, ref: 'AdminProfile', index: true },
    action: { type: String, required: true, trim: true, index: true },
    targetType: { type: String, required: true, trim: true, index: true },
    targetId: { type: Schema.Types.ObjectId, index: true },
    permissionUsed: { type: String, trim: true, index: true },
    result: { type: String, enum: ADMIN_ACTION_RESULTS, required: true, index: true },
    reason: { type: String, trim: true, maxlength: 1000 },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    requestId: { type: String, trim: true, index: true },
    ip: { type: String, trim: true },
    device: { type: String, trim: true },
    browser: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

adminActionLogSchema.index({ adminId: 1, createdAt: -1 });
adminActionLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
adminActionLogSchema.index({ action: 1, createdAt: -1 });
adminActionLogSchema.index({ result: 1, createdAt: -1 });
adminActionLogSchema.pre('updateOne', function preventUpdate() { throw new Error('Admin action logs are append-only.'); });
adminActionLogSchema.pre('deleteOne', function preventDelete() { throw new Error('Admin action logs are append-only.'); });

export const AdminActionLogModel = model<AdminActionLog>('AdminActionLog', adminActionLogSchema);
