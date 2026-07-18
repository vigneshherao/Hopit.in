import { Schema, model, type HydratedDocument } from 'mongoose';
import {
  DOCUMENT_VERIFICATION_STATUSES,
  DURATION_TYPES,
  PROFESSIONAL_ROLES,
  VERIFICATION_STATUSES,
  WORKER_AVAILABILITY_STATUSES_EXTENDED,
  WORKER_DOCUMENT_TYPES,
  WORKER_SKILLS,
} from '@/constants/worker.constants.js';

export interface WorkerProfile {
  userId: Schema.Types.ObjectId;
  headline: string;
  bio: string;
  professionalRoles: string[];
  skills: string[];
  experienceYears: number;
  experienceDescription?: string;
  languages: string[];
  profileImage?: string;
  coverImage?: string;
  location?: {
    address?: string;
    village?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    pincode?: string;
    coordinates?: { type: 'Point'; coordinates: [number, number] };
  };
  availability: {
    status: string;
    availableFrom?: Date;
    preferredDurationTypes: string[];
    willingToRelocate: boolean;
    willingToStayOnFarm: boolean;
    maximumTravelDistanceKm?: number;
  };
  pricing: {
    dailyWage?: number;
    weeklyRate?: number;
    monthlySalary?: number;
    seasonalRate?: number;
    negotiable: boolean;
  };
  workPreferences: {
    preferredCrops: string[];
    preferredWorkTypes: string[];
    acceptsIndividualWork: boolean;
    acceptsTeamWork: boolean;
    acceptsFarmManagement: boolean;
    acceptsNightStay: boolean;
  };
  identityVerification: {
    status: string;
    verifiedAt?: Date;
    verifiedBy?: Schema.Types.ObjectId;
    rejectionReason?: string;
  };
  documents: {
    type: string;
    name: string;
    url: string;
    verificationStatus: string;
    uploadedAt: Date;
  }[];
  portfolio: {
    title: string;
    description?: string;
    images: string[];
    cropOrWorkType?: string;
    location?: string;
    completedAt?: Date;
  }[];
  rating: { average: number; count: number };
  completedJobs: number;
  profileViews: number;
  responseRate: number;
  isProfileComplete: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkerProfileDocument = HydratedDocument<WorkerProfile>;

const geoPointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      validate: {
        validator(value: number[]) {
          return value.length === 2 && value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90;
        },
        message: 'Coordinates must be [longitude, latitude].',
      },
    },
  },
  { _id: false },
);

const workerProfileSchema = new Schema<WorkerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    headline: { type: String, trim: true, minlength: 4, maxlength: 140 },
    bio: { type: String, trim: true, minlength: 20, maxlength: 2000 },
    professionalRoles: [{ type: String, enum: PROFESSIONAL_ROLES, required: true, index: true }],
    skills: [{ type: String, enum: WORKER_SKILLS, required: true, index: true }],
    experienceYears: { type: Number, default: 0, min: 0, max: 80 },
    experienceDescription: { type: String, trim: true, maxlength: 2000 },
    languages: [{ type: String, trim: true }],
    profileImage: { type: String, trim: true },
    coverImage: { type: String, trim: true },
    location: {
      address: { type: String, trim: true, select: false },
      village: { type: String, trim: true },
      city: { type: String, trim: true, index: true },
      district: { type: String, trim: true, index: true },
      state: { type: String, trim: true, index: true },
      country: { type: String, trim: true, default: 'India' },
      pincode: { type: String, trim: true, select: false },
      coordinates: geoPointSchema,
    },
    availability: {
      status: { type: String, enum: WORKER_AVAILABILITY_STATUSES_EXTENDED, default: 'available', index: true },
      availableFrom: { type: Date },
      preferredDurationTypes: [{ type: String, enum: DURATION_TYPES }],
      willingToRelocate: { type: Boolean, default: false },
      willingToStayOnFarm: { type: Boolean, default: false },
      maximumTravelDistanceKm: { type: Number, min: 0, max: 2000 },
    },
    pricing: {
      dailyWage: { type: Number, min: 0, index: true },
      weeklyRate: { type: Number, min: 0 },
      monthlySalary: { type: Number, min: 0, index: true },
      seasonalRate: { type: Number, min: 0 },
      negotiable: { type: Boolean, default: true },
    },
    workPreferences: {
      preferredCrops: [{ type: String, trim: true }],
      preferredWorkTypes: [{ type: String, enum: WORKER_SKILLS }],
      acceptsIndividualWork: { type: Boolean, default: true },
      acceptsTeamWork: { type: Boolean, default: false },
      acceptsFarmManagement: { type: Boolean, default: false, index: true },
      acceptsNightStay: { type: Boolean, default: false },
    },
    identityVerification: {
      status: { type: String, enum: VERIFICATION_STATUSES, default: 'not-submitted', index: true },
      verifiedAt: { type: Date },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      rejectionReason: { type: String, trim: true },
    },
    documents: [
      {
        type: { type: String, enum: WORKER_DOCUMENT_TYPES, required: true },
        name: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true, select: false },
        verificationStatus: { type: String, enum: DOCUMENT_VERIFICATION_STATUSES, default: 'pending' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    portfolio: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        images: [{ type: String, trim: true }],
        cropOrWorkType: { type: String, trim: true },
        location: { type: String, trim: true },
        completedAt: { type: Date },
      },
    ],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5, index: true },
      count: { type: Number, default: 0, min: 0 },
    },
    completedJobs: { type: Number, default: 0, min: 0 },
    profileViews: { type: Number, default: 0, min: 0 },
    responseRate: { type: Number, default: 100, min: 0, max: 100 },
    isProfileComplete: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

workerProfileSchema.pre('validate', function setCompletion(next) {
  this.isProfileComplete = Boolean(
    this.headline &&
      this.bio &&
      this.professionalRoles.length &&
      this.skills.length &&
      this.location?.city &&
      this.location?.district &&
      this.location?.state &&
      (this.pricing.dailyWage || this.pricing.monthlySalary || this.pricing.weeklyRate || this.pricing.seasonalRate),
  );
  next();
});

workerProfileSchema.index({ 'location.coordinates': '2dsphere' });
workerProfileSchema.index({ professionalRoles: 1, skills: 1, 'availability.status': 1 });
workerProfileSchema.index({ 'location.state': 1, 'location.district': 1, 'location.city': 1 });
workerProfileSchema.index({ 'pricing.dailyWage': 1, 'pricing.monthlySalary': 1 });
workerProfileSchema.index({ 'rating.average': -1, isFeatured: -1 });
workerProfileSchema.index({
  headline: 'text',
  bio: 'text',
  professionalRoles: 'text',
  skills: 'text',
  'location.city': 'text',
  'location.district': 'text',
  'location.state': 'text',
});

export const WorkerProfileModel = model<WorkerProfile>('WorkerProfile', workerProfileSchema);
