import { Schema, model, type HydratedDocument } from 'mongoose';
import { ADMIN_NOTE_VISIBILITIES } from '@/constants/admin.constants.js';

export interface AdminInternalNote {
  userId: Schema.Types.ObjectId;
  authorId: Schema.Types.ObjectId;
  content: string;
  visibility: (typeof ADMIN_NOTE_VISIBILITIES)[number];
  deletedAt?: Date;
  deletedBy?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminInternalNoteDocument = HydratedDocument<AdminInternalNote>;

const adminInternalNoteSchema = new Schema<AdminInternalNote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 3000 },
    visibility: { type: String, enum: ADMIN_NOTE_VISIBILITIES, default: 'support', index: true },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

adminInternalNoteSchema.index({ userId: 1, createdAt: -1 });

export const AdminInternalNoteModel = model<AdminInternalNote>('AdminInternalNote', adminInternalNoteSchema);
