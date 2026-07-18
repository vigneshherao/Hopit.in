import { Schema, model, type HydratedDocument } from 'mongoose';
import { SAVED_VIEW_RESOURCES } from '@/constants/admin.constants.js';

export interface AdminSavedView {
  adminId: Schema.Types.ObjectId;
  name: string;
  resourceType: (typeof SAVED_VIEW_RESOURCES)[number];
  filters: Record<string, unknown>;
  sort?: string;
  columns: string[];
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminSavedViewDocument = HydratedDocument<AdminSavedView>;

const adminSavedViewSchema = new Schema<AdminSavedView>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    resourceType: { type: String, enum: SAVED_VIEW_RESOURCES, required: true, index: true },
    filters: { type: Schema.Types.Mixed, default: {} },
    sort: { type: String, trim: true, maxlength: 120 },
    columns: [{ type: String, trim: true, maxlength: 80 }],
    isDefault: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

adminSavedViewSchema.index({ adminId: 1, resourceType: 1, name: 1 }, { unique: true });

export const AdminSavedViewModel = model<AdminSavedView>('AdminSavedView', adminSavedViewSchema);
