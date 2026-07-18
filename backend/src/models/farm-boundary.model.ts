import { Schema, model, type HydratedDocument } from 'mongoose';
import { BOUNDARY_SOURCES, BOUNDARY_VERIFICATION_STATUSES } from '@/constants/remote-monitoring.constants.js';

export interface FarmBoundary {
  farmPlanId: Schema.Types.ObjectId;
  landId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: unknown[] };
  center: { type: 'Point'; coordinates: [number, number] };
  calculatedArea: number;
  areaUnit: string;
  source: (typeof BOUNDARY_SOURCES)[number];
  verificationStatus: (typeof BOUNDARY_VERIFICATION_STATUSES)[number];
  verifiedBy?: Schema.Types.ObjectId;
  verifiedAt?: Date;
  version: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FarmBoundaryDocument = HydratedDocument<FarmBoundary>;

const farmBoundarySchema = new Schema<FarmBoundary>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    geometry: {
      type: { type: String, enum: ['Polygon', 'MultiPolygon'], required: true },
      coordinates: { type: Schema.Types.Mixed, required: true },
    },
    center: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    calculatedArea: { type: Number, required: true, min: 0 },
    areaUnit: { type: String, default: 'acre', trim: true },
    source: { type: String, enum: BOUNDARY_SOURCES, required: true },
    verificationStatus: { type: String, enum: BOUNDARY_VERIFICATION_STATUSES, default: 'unverified', index: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    version: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

farmBoundarySchema.index({ geometry: '2dsphere' });
farmBoundarySchema.index({ center: '2dsphere' });
farmBoundarySchema.index({ farmPlanId: 1, isActive: 1 });

export const FarmBoundaryModel = model<FarmBoundary>('FarmBoundary', farmBoundarySchema);

