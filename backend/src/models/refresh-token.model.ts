import { Schema, model, type HydratedDocument } from 'mongoose';

export interface RefreshToken {
  userId: Schema.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdByIp?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

const refreshTokenSchema = new Schema<RefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: { type: Date },
    createdByIp: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

export const RefreshTokenModel = model<RefreshToken>('RefreshToken', refreshTokenSchema);
