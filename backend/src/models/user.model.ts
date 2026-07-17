import bcrypt from 'bcryptjs';
import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import { USER_ROLES, type UserRole } from '@/constants/auth.constants.js';
import type { SafeUser, UserLocation } from '@/types/http.js';
import { indianPhoneRegex } from '@/utils/phone.js';

export interface User {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  avatar?: string;
  location?: UserLocation;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeUser(): SafeUser;
}

export type UserDocument = HydratedDocument<User, UserMethods>;

type UserModelType = Model<User, object, UserMethods>;

const locationSchema = new Schema<UserLocation>(
  {
    address: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    district: { type: String, trim: true, index: true },
    state: { type: String, trim: true, index: true },
    country: { type: String, trim: true, default: 'India' },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
  },
  { _id: false },
);

const userSchema = new Schema<User, UserModelType, UserMethods>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
      validate: {
        validator: (value: string | undefined) => !value || indianPhoneRegex.test(value),
        message: 'Phone must be a valid Indian mobile number.',
      },
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: USER_ROLES, required: true, index: true },
    avatar: { type: String, trim: true },
    location: locationSchema,
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const transformed = ret as Record<string, unknown> & { _id?: { toString(): string } };
        delete transformed.password;
        delete transformed.__v;
        transformed.id = transformed._id?.toString();
        delete transformed._id;
        return transformed;
      },
    },
  },
);

userSchema.index({ 'location.state': 1, 'location.district': 1, 'location.city': 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeUser = function toSafeUser(): SafeUser {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    avatar: this.avatar,
    location: this.location,
    isEmailVerified: this.isEmailVerified,
    isPhoneVerified: this.isPhoneVerified,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const UserModel = model<User, UserModelType>('User', userSchema);
