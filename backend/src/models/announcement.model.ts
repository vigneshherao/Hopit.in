import { Schema, model, type HydratedDocument } from 'mongoose';
import { ANNOUNCEMENT_PRIORITIES } from '@/constants/chat.constants.js';

export interface Announcement {
  conversationId: Schema.Types.ObjectId;
  title: string;
  message: string;
  priority: (typeof ANNOUNCEMENT_PRIORITIES)[number];
  createdBy: Schema.Types.ObjectId;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AnnouncementDocument = HydratedDocument<Announcement>;

const announcementSchema = new Schema<Announcement>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    priority: { type: String, enum: ANNOUNCEMENT_PRIORITIES, default: 'normal', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true },
);

announcementSchema.index({ conversationId: 1, createdAt: -1 });
announcementSchema.index({ title: 'text', message: 'text' });

export const AnnouncementModel = model<Announcement>('Announcement', announcementSchema);
