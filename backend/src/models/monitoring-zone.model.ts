import { Schema, model, type HydratedDocument } from 'mongoose';
import { ZONE_DETECTED_BY, ZONE_SEVERITIES, ZONE_STATUSES, ZONE_TYPES } from '@/constants/remote-monitoring.constants.js';

export interface MonitoringZone {
  farmPlanId: Schema.Types.ObjectId;
  sceneId?: Schema.Types.ObjectId;
  analysisId?: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  title: string;
  zoneType: (typeof ZONE_TYPES)[number];
  geometry: { type: 'Polygon'; coordinates: unknown[] };
  originalGeometry?: Record<string, unknown>;
  area: number;
  areaUnit: string;
  severity: (typeof ZONE_SEVERITIES)[number];
  confidenceScore: number;
  detectedBy: (typeof ZONE_DETECTED_BY)[number];
  description: string;
  possibleCauses: string[];
  recommendedActions: string[];
  status: (typeof ZONE_STATUSES)[number];
  assignedTaskId?: Schema.Types.ObjectId;
  assignedWorkerId?: Schema.Types.ObjectId;
  reviewedBy?: Schema.Types.ObjectId;
  reviewedAt?: Date;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MonitoringZoneDocument = HydratedDocument<MonitoringZone>;

const monitoringZoneSchema = new Schema<MonitoringZone>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    sceneId: { type: Schema.Types.ObjectId, ref: 'RemoteSensingScene', index: true },
    analysisId: { type: Schema.Types.ObjectId, ref: 'VegetationAnalysis', index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    zoneType: { type: String, enum: ZONE_TYPES, required: true, index: true },
    geometry: { type: { type: String, enum: ['Polygon'], default: 'Polygon' }, coordinates: { type: Schema.Types.Mixed, required: true } },
    originalGeometry: { type: Schema.Types.Mixed },
    area: { type: Number, required: true, min: 0 },
    areaUnit: { type: String, default: 'acre', trim: true },
    severity: { type: String, enum: ZONE_SEVERITIES, required: true, index: true },
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    detectedBy: { type: String, enum: ZONE_DETECTED_BY, required: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    possibleCauses: [{ type: String, trim: true }],
    recommendedActions: [{ type: String, trim: true }],
    status: { type: String, enum: ZONE_STATUSES, default: 'new', index: true },
    assignedTaskId: { type: Schema.Types.ObjectId, ref: 'FarmTask' },
    assignedWorkerId: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

monitoringZoneSchema.index({ geometry: '2dsphere' });
monitoringZoneSchema.index({ farmPlanId: 1, severity: 1, status: 1 });

export const MonitoringZoneModel = model<MonitoringZone>('MonitoringZone', monitoringZoneSchema);

