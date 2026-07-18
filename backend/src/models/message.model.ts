import { Schema, model, type HydratedDocument } from 'mongoose';
import { MESSAGE_STATUSES, MESSAGE_TYPES } from '@/constants/chat.constants.js';

export interface Message {
  conversationId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  type: (typeof MESSAGE_TYPES)[number];
  text?: string;
  normalizedText?: string;
  attachments: Schema.Types.ObjectId[];
  locationId?: Schema.Types.ObjectId;
  replyToMessageId?: Schema.Types.ObjectId;
  forwardedFromMessageId?: Schema.Types.ObjectId;
  forwardedFromConversationId?: Schema.Types.ObjectId;
  clientMessageId?: string;
  metadata?: Record<string, unknown>;
  status: (typeof MESSAGE_STATUSES)[number];
  deletedForUserIds: Schema.Types.ObjectId[];
  editedAt?: Date;
  editVersion: number;
  deletedForEveryoneAt?: Date;
  deletedBy?: Schema.Types.ObjectId;
  isDeletedForEveryone: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MessageDocument = HydratedDocument<Message>;

const messageSchema = new Schema<Message>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: MESSAGE_TYPES, required: true, index: true },
    text: { type: String, trim: true, maxlength: 5000 },
    normalizedText: { type: String, trim: true, maxlength: 5000, index: true },
    attachments: [{ type: Schema.Types.ObjectId, ref: 'ChatAttachment' }],
    locationId: { type: Schema.Types.ObjectId, ref: 'ChatLocation' },
    replyToMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    forwardedFromMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    forwardedFromConversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    clientMessageId: { type: String, trim: true, sparse: true },
    metadata: { type: Schema.Types.Mixed },
    status: { type: String, enum: MESSAGE_STATUSES, default: 'sent', index: true },
    deletedForUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    editedAt: { type: Date },
    editVersion: { type: Number, default: 0, min: 0 },
    deletedForEveryoneAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeletedForEveryone: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, clientMessageId: 1 }, { unique: true, sparse: true });
messageSchema.index({ text: 'text', normalizedText: 'text' });

export const MessageModel = model<Message>('Message', messageSchema);
