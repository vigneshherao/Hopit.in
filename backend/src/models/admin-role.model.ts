import { Schema, model, type HydratedDocument } from 'mongoose';
import { ADMIN_PERMISSION_CATALOG } from '@/constants/admin.constants.js';

export interface AdminRole {
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
  isActive: boolean;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminRoleDocument = HydratedDocument<AdminRole>;

const adminRoleSchema = new Schema<AdminRole>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    description: { type: String, trim: true, maxlength: 700 },
    permissions: [{ type: String, enum: ADMIN_PERMISSION_CATALOG, required: true }],
    isSystemRole: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

adminRoleSchema.index({ isActive: 1, slug: 1 });

export const AdminRoleModel = model<AdminRole>('AdminRole', adminRoleSchema);
