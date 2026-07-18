import { Schema, model, type HydratedDocument } from 'mongoose';

export interface ImageryComparison {
  farmPlanId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  baselineSceneId: Schema.Types.ObjectId;
  comparisonSceneId: Schema.Types.ObjectId;
  baselineDate: Date;
  comparisonDate: Date;
  healthScoreChange: number;
  healthyCoverageChange: number;
  stressedCoverageChange: number;
  improvedAreaPercentage: number;
  declinedAreaPercentage: number;
  unchangedAreaPercentage: number;
  newRiskZones: Schema.Types.ObjectId[];
  resolvedRiskZones: Schema.Types.ObjectId[];
  summary: string;
  confidenceScore: number;
  isSimulated: boolean;
  createdAt?: Date;
}

export type ImageryComparisonDocument = HydratedDocument<ImageryComparison>;

const imageryComparisonSchema = new Schema<ImageryComparison>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    baselineSceneId: { type: Schema.Types.ObjectId, ref: 'RemoteSensingScene', required: true },
    comparisonSceneId: { type: Schema.Types.ObjectId, ref: 'RemoteSensingScene', required: true },
    baselineDate: { type: Date, required: true },
    comparisonDate: { type: Date, required: true },
    healthScoreChange: { type: Number, required: true },
    healthyCoverageChange: { type: Number, required: true },
    stressedCoverageChange: { type: Number, required: true },
    improvedAreaPercentage: { type: Number, min: 0, max: 100, required: true },
    declinedAreaPercentage: { type: Number, min: 0, max: 100, required: true },
    unchangedAreaPercentage: { type: Number, min: 0, max: 100, required: true },
    newRiskZones: [{ type: Schema.Types.ObjectId, ref: 'MonitoringZone' }],
    resolvedRiskZones: [{ type: Schema.Types.ObjectId, ref: 'MonitoringZone' }],
    summary: { type: String, required: true, trim: true, maxlength: 2500 },
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    isSimulated: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ImageryComparisonModel = model<ImageryComparison>('ImageryComparison', imageryComparisonSchema);

