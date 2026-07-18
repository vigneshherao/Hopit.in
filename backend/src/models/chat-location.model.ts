import { Schema, model, type HydratedDocument } from 'mongoose';

export interface ChatLocation {
  conversationId: Schema.Types.ObjectId;
  messageId?: Schema.Types.ObjectId;
  sharedBy: Schema.Types.ObjectId;
  latitude: number;
  longitude: number;
  label?: string;
  address?: string;
  accuracyMeters?: number;
  sharedAt: Date;
  createdAt?: Date;
}

export type ChatLocationDocument = HydratedDocument<ChatLocation>;

const chatLocationSchema = new Schema<ChatLocation>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', index: true },
    sharedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    label: { type: String, trim: true, maxlength: 120 },
    address: { type: String, trim: true, maxlength: 300 },
    accuracyMeters: { type: Number, min: 0 },
    sharedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

chatLocationSchema.index({ conversationId: 1, createdAt: -1 });

export const ChatLocationModel = model<ChatLocation>('ChatLocation', chatLocationSchema);
