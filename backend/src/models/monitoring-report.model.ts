import { Schema, model, type HydratedDocument } from 'mongoose';
import { MONITORING_REPORT_GENERATORS, MONITORING_REPORT_TYPES } from '@/constants/remote-monitoring.constants.js';

export interface MonitoringReport {
  farmPlanId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  title: string;
  reportType: (typeof MONITORING_REPORT_TYPES)[number];
  dateRange: { startDate: Date; endDate: Date };
  sceneIds: Schema.Types.ObjectId[];
  summary: string;
  overallHealthScore: number;
  healthyCoveragePercentage: number;
  stressedCoveragePercentage: number;
  criticalZoneCount: number;
  majorFindings: string[];
  recommendations: string[];
  generatedBy: (typeof MONITORING_REPORT_GENERATORS)[number];
  reportFileUrls: { pdf?: string; excel?: string; geojson?: string };
  createdAt?: Date;
}

export type MonitoringReportDocument = HydratedDocument<MonitoringReport>;

const monitoringReportSchema = new Schema<MonitoringReport>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    reportType: { type: String, enum: MONITORING_REPORT_TYPES, required: true, index: true },
    dateRange: { startDate: Date, endDate: Date },
    sceneIds: [{ type: Schema.Types.ObjectId, ref: 'RemoteSensingScene' }],
    summary: { type: String, required: true, trim: true, maxlength: 3000 },
    overallHealthScore: { type: Number, min: 0, max: 100, required: true },
    healthyCoveragePercentage: { type: Number, min: 0, max: 100, required: true },
    stressedCoveragePercentage: { type: Number, min: 0, max: 100, required: true },
    criticalZoneCount: { type: Number, min: 0, required: true },
    majorFindings: [{ type: String, trim: true }],
    recommendations: [{ type: String, trim: true }],
    generatedBy: { type: String, enum: MONITORING_REPORT_GENERATORS, default: 'system' },
    reportFileUrls: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const MonitoringReportModel = model<MonitoringReport>('MonitoringReport', monitoringReportSchema);

