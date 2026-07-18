import { Schema, model, type HydratedDocument } from 'mongoose';
import { PRESENCE_STATUSES } from '@/constants/realtime.constants.js';

export interface UserPresence {
  userId: Schema.Types.ObjectId;
  status: (typeof PRESENCE_STATUSES)[number];
  lastSeen: Date;
  activeDevice?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserPresenceDocument = HydratedDocument<UserPresence>;

const userPresenceSchema = new Schema<UserPresence>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    status: { type: String, enum: PRESENCE_STATUSES, default: 'offline', index: true },
    lastSeen: { type: Date, default: Date.now, index: true },
    activeDevice: { type: String, trim: true, maxlength: 120 },
  },
  { timestamps: true },
);

export const UserPresenceModel = model<UserPresence>('UserPresence', userPresenceSchema);
