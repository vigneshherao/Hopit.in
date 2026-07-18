import { Schema, model, type HydratedDocument } from 'mongoose';
import { ADMIN_PROFILE_STATUSES } from '@/constants/admin.constants.js';

export interface AdminProfile {
  userId: Schema.Types.ObjectId;
  adminCode: string;
  displayName: string;
  roleIds: Schema.Types.ObjectId[];
  status: (typeof ADMIN_PROFILE_STATUSES)[number];
  department?: string;
  jobTitle?: string;
  permissionsVersion: number;
  lastAdminLoginAt?: Date;
  activatedAt?: Date;
  deactivatedAt?: Date;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminProfileDocument = HydratedDocument<AdminProfile>;

const adminProfileSchema = new Schema<AdminProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    adminCode: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    displayName: { type: String, required: true, trim: true, maxlength: 120 },
    roleIds: [{ type: Schema.Types.ObjectId, ref: 'AdminRole', required: true }],
    status: { type: String, enum: ADMIN_PROFILE_STATUSES, default: 'invited', index: true },
    department: { type: String, trim: true, maxlength: 120 },
    jobTitle: { type: String, trim: true, maxlength: 120 },
    permissionsVersion: { type: Number, default: 1, min: 1 },
    lastAdminLoginAt: Date,
    activatedAt: Date,
    deactivatedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

adminProfileSchema.index({ status: 1, updatedAt: -1 });

export const AdminProfileModel = model<AdminProfile>('AdminProfile', adminProfileSchema);
