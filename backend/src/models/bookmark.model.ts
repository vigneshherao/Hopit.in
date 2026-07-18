import { Schema, model, type HydratedDocument } from 'mongoose';

export interface Bookmark {
  conversationId: Schema.Types.ObjectId;
  messageId?: Schema.Types.ObjectId;
  noteId?: Schema.Types.ObjectId;
  announcementId?: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  label?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BookmarkDocument = HydratedDocument<Bookmark>;

const bookmarkSchema = new Schema<Bookmark>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    noteId: { type: Schema.Types.ObjectId, ref: 'SharedNote' },
    announcementId: { type: Schema.Types.ObjectId, ref: 'Announcement' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, trim: true, maxlength: 120 },
  },
  { timestamps: true },
);

bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ userId: 1, messageId: 1 }, { unique: true, sparse: true });
bookmarkSchema.index({ userId: 1, noteId: 1 }, { unique: true, sparse: true });
bookmarkSchema.index({ userId: 1, announcementId: 1 }, { unique: true, sparse: true });

export const BookmarkModel = model<Bookmark>('Bookmark', bookmarkSchema);
