import { Schema, model, type HydratedDocument } from 'mongoose';
import { DISEASE_RECOMMENDATION_CATEGORIES, DISEASE_RECOMMENDATION_PRIORITIES } from '@/constants/disease.constants.js';

export interface DiseaseRecommendation {
  analysisId: Schema.Types.ObjectId;
  title: string;
  description: string;
  priority: (typeof DISEASE_RECOMMENDATION_PRIORITIES)[number];
  category: (typeof DISEASE_RECOMMENDATION_CATEGORIES)[number];
  estimatedCost?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DiseaseRecommendationDocument = HydratedDocument<DiseaseRecommendation>;

const diseaseRecommendationSchema = new Schema<DiseaseRecommendation>(
  {
    analysisId: { type: Schema.Types.ObjectId, ref: 'DiseaseAnalysis', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    priority: { type: String, enum: DISEASE_RECOMMENDATION_PRIORITIES, required: true, index: true },
    category: { type: String, enum: DISEASE_RECOMMENDATION_CATEGORIES, required: true, index: true },
    estimatedCost: { type: Number, min: 0 },
  },
  { timestamps: true },
);

export const DiseaseRecommendationModel = model<DiseaseRecommendation>('DiseaseRecommendation', diseaseRecommendationSchema);

