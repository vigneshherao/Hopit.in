import { Schema, model, type HydratedDocument } from 'mongoose';
import { NOTIFICATION_PRIORITIES } from '@/constants/realtime.constants.js';

export interface Notification {
  userId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  senderId?: Schema.Types.ObjectId;
  type: string;
  category?: string;
  title: string;
  message: string;
  priority: (typeof NOTIFICATION_PRIORITIES)[number];
  icon?: string;
  image?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationDocument = HydratedDocument<Notification>;

const notificationSchema = new Schema<Notification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true, trim: true, index: true },
    category: { type: String, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: { type: String, enum: NOTIFICATION_PRIORITIES, default: 'medium', index: true },
    icon: { type: String, trim: true },
    image: { type: String, trim: true },
    actionUrl: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ title: 'text', message: 'text', category: 'text', type: 'text' });

notificationSchema.pre('validate', function normalizeReceiver(next) {
  if (!this.receiverId) this.receiverId = this.userId;
  if (!this.userId) this.userId = this.receiverId;
  next();
});

export const NotificationModel = model<Notification>('Notification', notificationSchema);
