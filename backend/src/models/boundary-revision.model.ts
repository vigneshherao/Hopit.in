import { Schema, model, type HydratedDocument } from 'mongoose';

export interface BoundaryRevision {
  boundaryId: Schema.Types.ObjectId;
  farmPlanId: Schema.Types.ObjectId;
  previousGeometry: Record<string, unknown>;
  updatedGeometry: Record<string, unknown>;
  previousArea: number;
  updatedArea: number;
  changedBy: Schema.Types.ObjectId;
  reason?: string;
  createdAt?: Date;
}

export type BoundaryRevisionDocument = HydratedDocument<BoundaryRevision>;

const boundaryRevisionSchema = new Schema<BoundaryRevision>(
  {
    boundaryId: { type: Schema.Types.ObjectId, ref: 'FarmBoundary', required: true, index: true },
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    previousGeometry: { type: Schema.Types.Mixed, required: true },
    updatedGeometry: { type: Schema.Types.Mixed, required: true },
    previousArea: { type: Number, required: true, min: 0 },
    updatedArea: { type: Number, required: true, min: 0 },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const BoundaryRevisionModel = model<BoundaryRevision>('BoundaryRevision', boundaryRevisionSchema);

