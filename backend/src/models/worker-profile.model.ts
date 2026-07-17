import { Schema, model, type HydratedDocument } from 'mongoose';
import { WORKER_AVAILABILITY_STATUSES } from '@/constants/auth.constants.js';

export interface WorkerProfile {
  userId: Schema.Types.ObjectId;
  skills: string[];
  experienceYears: number;
  dailyWage: number;
  bio?: string;
  availabilityStatus: (typeof WORKER_AVAILABILITY_STATUSES)[number];
  serviceRadiusKm: number;
  ratingAverage: number;
  ratingCount: number;
  location?: {
    city?: string;
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkerProfileDocument = HydratedDocument<WorkerProfile>;

const workerProfileSchema = new Schema<WorkerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0, min: 0, max: 80 },
    dailyWage: { type: Number, default: 0, min: 0 },
    bio: { type: String, trim: true, maxlength: 1200 },
    availabilityStatus: {
      type: String,
      enum: WORKER_AVAILABILITY_STATUSES,
      default: 'available',
      index: true,
    },
    serviceRadiusKm: { type: Number, default: 25, min: 0, max: 500 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    location: {
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
  },
  { timestamps: true },
);

workerProfileSchema.index({ availabilityStatus: 1, dailyWage: 1 });
workerProfileSchema.index({ 'location.state': 1, 'location.district': 1, 'location.city': 1 });

export const WorkerProfileModel = model<WorkerProfile>('WorkerProfile', workerProfileSchema);
