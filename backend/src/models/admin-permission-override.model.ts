import { Schema, model, type HydratedDocument } from 'mongoose';
import { ADMIN_PERMISSION_CATALOG } from '@/constants/admin.constants.js';

export interface AdminPermissionOverride {
  adminProfileId: Schema.Types.ObjectId;
  allow: string[];
  deny: string[];
  reason: string;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminPermissionOverrideDocument = HydratedDocument<AdminPermissionOverride>;

const adminPermissionOverrideSchema = new Schema<AdminPermissionOverride>(
  {
    adminProfileId: { type: Schema.Types.ObjectId, ref: 'AdminProfile', required: true, unique: true, index: true },
    allow: [{ type: String, enum: ADMIN_PERMISSION_CATALOG }],
    deny: [{ type: String, enum: ADMIN_PERMISSION_CATALOG }],
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const AdminPermissionOverrideModel = model<AdminPermissionOverride>('AdminPermissionOverride', adminPermissionOverrideSchema);
