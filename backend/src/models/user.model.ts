import { Schema, model } from 'mongoose';

export interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  role: 'land_owner' | 'farmer' | 'farm_worker';
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['land_owner', 'farmer', 'farm_worker'],
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>('User', userSchema);
