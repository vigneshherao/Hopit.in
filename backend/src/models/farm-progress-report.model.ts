import { Schema, model, type HydratedDocument } from 'mongoose';
import { CROP_HEALTH_STATUSES } from '@/constants/worker.constants.js';

export interface FarmProgressReport {
  assignmentId: Schema.Types.ObjectId;
  landId: Schema.Types.ObjectId;
  managerId: Schema.Types.ObjectId;
  reportDate: Date;
  title: string;
  summary: string;
  activitiesCompleted: string[];
  issuesFound: string[];
  nextActions: string[];
  weatherNotes?: string;
  cropHealthStatus: string;
  progressPercentage: number;
  expensesRecorded: { category: string; description?: string; amount: number; receiptUrl?: string }[];
  media: { images: string[]; videos: string[] };
  ownerFeedback?: { message?: string; submittedAt?: Date };
  createdAt?: Date;
  updatedAt?: Date;
}

export type FarmProgressReportDocument = HydratedDocument<FarmProgressReport>;

const reportSchema = new Schema<FarmProgressReport>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'FarmManagementAssignment', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportDate: { type: Date, default: Date.now, index: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true, maxlength: 3000 },
    activitiesCompleted: [{ type: String, trim: true }],
    issuesFound: [{ type: String, trim: true }],
    nextActions: [{ type: String, trim: true }],
    weatherNotes: { type: String, trim: true },
    cropHealthStatus: { type: String, enum: CROP_HEALTH_STATUSES, default: 'not-applicable' },
    progressPercentage: { type: Number, required: true, min: 0, max: 100 },
    expensesRecorded: [
      {
        category: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        amount: { type: Number, required: true, min: 0 },
        receiptUrl: { type: String, trim: true },
      },
    ],
    media: {
      images: [{ type: String, trim: true }],
      videos: [{ type: String, trim: true }],
    },
    ownerFeedback: {
      message: { type: String, trim: true },
      submittedAt: { type: Date },
    },
  },
  { timestamps: true },
);

reportSchema.index({ assignmentId: 1, reportDate: -1 });
reportSchema.index({ managerId: 1, reportDate: -1 });

export const FarmProgressReportModel = model<FarmProgressReport>('FarmProgressReport', reportSchema);
