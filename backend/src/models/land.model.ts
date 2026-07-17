import { Schema, model, type HydratedDocument } from 'mongoose';
import {
  LAND_AREA_UNITS,
  LAND_STATUSES,
  LEASE_TYPES,
  SOIL_TYPES,
} from '@/constants/auth.constants.js';

export interface Land {
  ownerId: Schema.Types.ObjectId;
  title: string;
  description: string;
  location: {
    address: string;
    village?: string;
    city: string;
    district: string;
    state: string;
    country: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  };
  area: {
    value: number;
    unit: (typeof LAND_AREA_UNITS)[number];
  };
  soilType: (typeof SOIL_TYPES)[number];
  waterSources: string[];
  electricityAvailable: boolean;
  roadAccess: boolean;
  leaseType: (typeof LEASE_TYPES)[number];
  monthlyRent?: number;
  revenueShareOwnerPercentage?: number;
  images: string[];
  status: (typeof LAND_STATUSES)[number];
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LandDocument = HydratedDocument<Land>;

const landSchema = new Schema<Land>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 140 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    location: {
      address: { type: String, required: true, trim: true },
      village: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true, index: true },
      state: { type: String, required: true, trim: true, index: true },
      country: { type: String, required: true, trim: true, default: 'India' },
      pincode: { type: String, trim: true },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
    area: {
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: LAND_AREA_UNITS, required: true },
    },
    soilType: { type: String, enum: SOIL_TYPES, required: true, index: true },
    waterSources: [{ type: String, trim: true }],
    electricityAvailable: { type: Boolean, default: false },
    roadAccess: { type: Boolean, default: false },
    leaseType: { type: String, enum: LEASE_TYPES, required: true, index: true },
    monthlyRent: { type: Number, min: 0 },
    revenueShareOwnerPercentage: { type: Number, min: 0, max: 100 },
    images: [{ type: String, trim: true }],
    status: { type: String, enum: LAND_STATUSES, default: 'draft', index: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

landSchema.index({ ownerId: 1, status: 1 });
landSchema.index({ 'location.state': 1, 'location.district': 1 });

export const LandModel = model<Land>('Land', landSchema);
