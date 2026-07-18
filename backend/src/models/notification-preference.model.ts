import { Schema, model, type HydratedDocument } from 'mongoose';

export interface NotificationPreference {
  userId: Schema.Types.ObjectId;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  agreementNotifications: boolean;
  taskNotifications: boolean;
  weatherAlerts: boolean;
  diseaseAlerts: boolean;
  expenseAlerts: boolean;
  incomeAlerts: boolean;
  adminMessages: boolean;
  marketing: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationPreferenceDocument = HydratedDocument<NotificationPreference>;

const notificationPreferenceSchema = new Schema<NotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
    agreementNotifications: { type: Boolean, default: true },
    taskNotifications: { type: Boolean, default: true },
    weatherAlerts: { type: Boolean, default: true },
    diseaseAlerts: { type: Boolean, default: true },
    expenseAlerts: { type: Boolean, default: true },
    incomeAlerts: { type: Boolean, default: true },
    adminMessages: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const NotificationPreferenceModel = model<NotificationPreference>('NotificationPreference', notificationPreferenceSchema);
