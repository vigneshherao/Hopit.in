import { Schema, model, type HydratedDocument } from 'mongoose';

export interface DiseaseTimeline {
  farmPlanId?: Schema.Types.ObjectId;
  analysisId: Schema.Types.ObjectId;
  status: string;
  healthScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DiseaseTimelineDocument = HydratedDocument<DiseaseTimeline>;

const diseaseTimelineSchema = new Schema<DiseaseTimeline>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', index: true },
    analysisId: { type: Schema.Types.ObjectId, ref: 'DiseaseAnalysis', required: true, index: true },
    status: { type: String, required: true, trim: true },
    healthScore: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true },
);

diseaseTimelineSchema.index({ farmPlanId: 1, createdAt: -1 });

export const DiseaseTimelineModel = model<DiseaseTimeline>('DiseaseTimeline', diseaseTimelineSchema);

