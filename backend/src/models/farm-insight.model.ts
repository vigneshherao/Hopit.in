import { Schema, model, type HydratedDocument } from 'mongoose';
import { ASSISTANT_INSIGHT_CATEGORIES, ASSISTANT_INSIGHT_STATUSES, ASSISTANT_PRIORITIES } from '@/constants/assistant.constants.js';

export interface FarmInsight {
  farmPlanId: Schema.Types.ObjectId;
  title: string;
  category: (typeof ASSISTANT_INSIGHT_CATEGORIES)[number];
  priority: (typeof ASSISTANT_PRIORITIES)[number];
  description: string;
  recommendation: string;
  confidenceScore: number;
  status: (typeof ASSISTANT_INSIGHT_STATUSES)[number];
  createdAt?: Date;
  updatedAt?: Date;
}

export type FarmInsightDocument = HydratedDocument<FarmInsight>;

const farmInsightSchema = new Schema<FarmInsight>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    category: { type: String, enum: ASSISTANT_INSIGHT_CATEGORIES, required: true, index: true },
    priority: { type: String, enum: ASSISTANT_PRIORITIES, required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    recommendation: { type: String, required: true, trim: true, maxlength: 1200 },
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    status: { type: String, enum: ASSISTANT_INSIGHT_STATUSES, default: 'open', index: true },
  },
  { timestamps: true },
);

farmInsightSchema.index({ farmPlanId: 1, priority: 1, status: 1 });

export const FarmInsightModel = model<FarmInsight>('FarmInsight', farmInsightSchema);

