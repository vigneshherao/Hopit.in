import { Schema, model, type HydratedDocument } from 'mongoose';

export interface SharedNote {
  conversationId: Schema.Types.ObjectId;
  title: string;
  content: string;
  createdBy: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SharedNoteDocument = HydratedDocument<SharedNote>;

const sharedNoteSchema = new Schema<SharedNote>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    content: { type: String, required: true, trim: true, maxlength: 12000 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    version: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true },
);

sharedNoteSchema.index({ conversationId: 1, updatedAt: -1 });
sharedNoteSchema.index({ title: 'text', content: 'text' });

export const SharedNoteModel = model<SharedNote>('SharedNote', sharedNoteSchema);
