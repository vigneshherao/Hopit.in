import { Schema, model, type HydratedDocument } from 'mongoose';
import { ACTIVE_APPLICATION_STATUSES, APPLICATION_STATUSES } from '@/constants/auth.constants.js';

export interface Application {
  landId: Schema.Types.ObjectId;
  farmerId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  message?: string;
  proposedMonthlyRent?: number;
  proposedFarmerRevenuePercentage?: number;
  status: (typeof APPLICATION_STATUSES)[number];
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ApplicationDocument = HydratedDocument<Application>;

const applicationSchema = new Schema<Application>(
  {
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, trim: true, maxlength: 1500 },
    proposedMonthlyRent: { type: Number, min: 0 },
    proposedFarmerRevenuePercentage: { type: Number, min: 0, max: 100 },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'pending', index: true },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

applicationSchema.index(
  { landId: 1, farmerId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: [...ACTIVE_APPLICATION_STATUSES] } },
  },
);

export const ApplicationModel = model<Application>('Application', applicationSchema);
