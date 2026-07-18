import { Schema, model, type HydratedDocument } from 'mongoose';
import { FARM_JOB_HIRING_TYPES, FARM_JOB_PAYMENT_TYPES, FARM_JOB_STATUSES, FARM_JOB_WORK_TYPES, PROFESSIONAL_ROLES, WORKER_SKILLS } from '@/constants/worker.constants.js';

export interface FarmJob {
  postedBy: Schema.Types.ObjectId;
  landId?: Schema.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  professionalRolesRequired: string[];
  skillsRequired: string[];
  workType: string;
  hiringType: string;
  numberOfWorkersRequired: number;
  duration: { startDate?: Date; endDate?: Date; numberOfDays?: number; numberOfMonths?: number; flexible: boolean };
  schedule: { workingDays: string[]; startTime?: string; endTime?: string; accommodationProvided: boolean; foodProvided: boolean; transportProvided: boolean };
  location?: { address?: string; village?: string; city?: string; district?: string; state?: string; pincode?: string; coordinates?: { type: 'Point'; coordinates: [number, number] } };
  cropOrBusinessType?: string;
  responsibilities: string[];
  requirements: string[];
  compensation: { paymentType: string; amount?: number; minimumAmount?: number; maximumAmount?: number; currency: string };
  status: string;
  selectedApplicantIds: Schema.Types.ObjectId[];
  applicationCount: number;
  viewCount: number;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FarmJobDocument = HydratedDocument<FarmJob>;

const farmJobSchema = new Schema<FarmJob>(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    professionalRolesRequired: [{ type: String, enum: PROFESSIONAL_ROLES, required: true, index: true }],
    skillsRequired: [{ type: String, enum: WORKER_SKILLS, index: true }],
    workType: { type: String, enum: FARM_JOB_WORK_TYPES, required: true, index: true },
    hiringType: { type: String, enum: FARM_JOB_HIRING_TYPES, required: true, index: true },
    numberOfWorkersRequired: { type: Number, default: 1, min: 1 },
    duration: {
      startDate: { type: Date, index: true },
      endDate: { type: Date },
      numberOfDays: { type: Number, min: 1 },
      numberOfMonths: { type: Number, min: 1 },
      flexible: { type: Boolean, default: false },
    },
    schedule: {
      workingDays: [{ type: String, trim: true }],
      startTime: { type: String, trim: true },
      endTime: { type: String, trim: true },
      accommodationProvided: { type: Boolean, default: false, index: true },
      foodProvided: { type: Boolean, default: false, index: true },
      transportProvided: { type: Boolean, default: false, index: true },
    },
    location: {
      address: { type: String, trim: true },
      village: { type: String, trim: true },
      city: { type: String, trim: true, index: true },
      district: { type: String, trim: true, index: true },
      state: { type: String, trim: true, index: true },
      pincode: { type: String, trim: true },
      coordinates: {
        type: { type: String, enum: ['Point'], default: undefined },
        coordinates: {
          type: [Number],
          default: undefined,
          validate: {
            validator(value: number[] | undefined) {
              return !value || (value.length === 2 && value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90);
            },
            message: 'Coordinates must be [longitude, latitude].',
          },
        },
      },
    },
    cropOrBusinessType: { type: String, trim: true, index: true },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    compensation: {
      paymentType: { type: String, enum: FARM_JOB_PAYMENT_TYPES, required: true, index: true },
      amount: { type: Number, min: 0, index: true },
      minimumAmount: { type: Number, min: 0 },
      maximumAmount: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
    },
    status: { type: String, enum: FARM_JOB_STATUSES, default: 'draft', index: true },
    selectedApplicantIds: [{ type: Schema.Types.ObjectId, ref: 'WorkerJobApplication' }],
    applicationCount: { type: Number, default: 0, min: 0 },
    viewCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true },
);

farmJobSchema.pre('validate', function validateOpenJob(next) {
  const coordinates = this.location?.coordinates?.coordinates;
  if (this.location?.coordinates && (!Array.isArray(coordinates) || coordinates.length !== 2)) {
    this.location.coordinates = undefined;
  }
  if (!this.professionalRolesRequired.length) return next(new Error('At least one professional role is required.'));
  if (this.compensation.maximumAmount !== undefined && this.compensation.minimumAmount !== undefined && this.compensation.maximumAmount < this.compensation.minimumAmount) {
    return next(new Error('Maximum compensation cannot be less than minimum compensation.'));
  }
  if (this.status === 'open') {
    if (!this.description || !this.location?.city || !this.location?.district || !this.location?.state || !this.duration.startDate) {
      return next(new Error('Open jobs require description, location, and start date.'));
    }
    if (this.compensation.paymentType !== 'negotiable' && !this.compensation.amount && !this.compensation.minimumAmount) {
      return next(new Error('Open jobs require compensation details.'));
    }
  }
  next();
});

farmJobSchema.index({ 'location.coordinates': '2dsphere' });
farmJobSchema.index({ status: 1, createdAt: -1 });
farmJobSchema.index({ postedBy: 1, status: 1 });
farmJobSchema.index({ professionalRolesRequired: 1, workType: 1 });
farmJobSchema.index({ skillsRequired: 1, workType: 1 });
farmJobSchema.index({ title: 'text', description: 'text', professionalRolesRequired: 'text', skillsRequired: 'text', 'location.city': 'text', 'location.district': 'text', 'location.state': 'text' });

export const FarmJobModel = model<FarmJob>('FarmJob', farmJobSchema);
