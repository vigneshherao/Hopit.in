import { Schema, model, type HydratedDocument } from 'mongoose';

export interface AdminNotificationPreference {
  adminId: Schema.Types.ObjectId;
  digestFrequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  channels: string[];
  categories: Record<string, boolean>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminNotificationPreferenceDocument = HydratedDocument<AdminNotificationPreference>;

const adminNotificationPreferenceSchema = new Schema<AdminNotificationPreference>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    digestFrequency: { type: String, enum: ['instant', 'hourly', 'daily', 'weekly'], default: 'instant' },
    channels: [{ type: String, enum: ['in-app', 'email', 'push'], default: 'in-app' }],
    categories: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const AdminNotificationPreferenceModel = model<AdminNotificationPreference>('AdminNotificationPreference', adminNotificationPreferenceSchema);
