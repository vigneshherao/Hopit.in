import { Schema, model, type HydratedDocument } from 'mongoose';
import { CHAT_ATTACHMENT_PROCESSING_STATUSES, CHAT_ATTACHMENT_SCAN_STATUSES, CHAT_ATTACHMENT_TYPES } from '@/constants/chat.constants.js';

export interface ChatAttachment {
  conversationId: Schema.Types.ObjectId;
  messageId?: Schema.Types.ObjectId;
  uploadedBy: Schema.Types.ObjectId;
  type: (typeof CHAT_ATTACHMENT_TYPES)[number];
  originalFileName: string;
  sanitizedFileName: string;
  mimeType: string;
  sizeBytes: number;
  fileUrl: string;
  thumbnailUrl?: string;
  waveformUrl?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  checksum: string;
  scanStatus: (typeof CHAT_ATTACHMENT_SCAN_STATUSES)[number];
  processingStatus: (typeof CHAT_ATTACHMENT_PROCESSING_STATUSES)[number];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ChatAttachmentDocument = HydratedDocument<ChatAttachment>;

const chatAttachmentSchema = new Schema<ChatAttachment>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: CHAT_ATTACHMENT_TYPES, required: true, index: true },
    originalFileName: { type: String, required: true, trim: true },
    sanitizedFileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    sizeBytes: { type: Number, required: true, min: 1 },
    fileUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, trim: true },
    waveformUrl: { type: String, trim: true },
    durationSeconds: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    checksum: { type: String, required: true, trim: true, index: true },
    scanStatus: { type: String, enum: CHAT_ATTACHMENT_SCAN_STATUSES, default: 'clean', index: true },
    processingStatus: { type: String, enum: CHAT_ATTACHMENT_PROCESSING_STATUSES, default: 'completed', index: true },
  },
  { timestamps: true },
);

chatAttachmentSchema.index({ conversationId: 1, checksum: 1 });

export const ChatAttachmentModel = model<ChatAttachment>('ChatAttachment', chatAttachmentSchema);
