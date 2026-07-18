import { Schema, model, type HydratedDocument } from 'mongoose';

export interface UserSession {
  userId: Schema.Types.ObjectId;
  socketId: string;
  ip?: string;
  device?: string;
  browser?: string;
  platform?: string;
  connectedAt: Date;
  disconnectedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserSessionDocument = HydratedDocument<UserSession>;

const userSessionSchema = new Schema<UserSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    socketId: { type: String, required: true, unique: true, index: true },
    ip: { type: String, trim: true },
    device: { type: String, trim: true, maxlength: 120 },
    browser: { type: String, trim: true, maxlength: 120 },
    platform: { type: String, trim: true, maxlength: 120 },
    connectedAt: { type: Date, default: Date.now },
    disconnectedAt: { type: Date },
  },
  { timestamps: true },
);

userSessionSchema.index({ userId: 1, connectedAt: -1 });

export const UserSessionModel = model<UserSession>('UserSession', userSessionSchema);
