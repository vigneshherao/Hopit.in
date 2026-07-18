import { Schema, model, type HydratedDocument } from 'mongoose';
import { OBSERVATION_SEVERITIES, OBSERVATION_VERIFICATION_STATUSES, OBSERVED_CONDITIONS } from '@/constants/remote-monitoring.constants.js';

export interface FieldObservation {
  farmPlanId: Schema.Types.ObjectId;
  monitoringZoneId?: Schema.Types.ObjectId;
  taskId?: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  observationDate: Date;
  title: string;
  notes?: string;
  observedCondition: (typeof OBSERVED_CONDITIONS)[number];
  severity: (typeof OBSERVATION_SEVERITIES)[number];
  imageUrls: string[];
  coordinates?: { latitude: number; longitude: number };
  recommendedFollowUp?: string;
  verificationStatus: (typeof OBSERVATION_VERIFICATION_STATUSES)[number];
  createdAt?: Date;
  updatedAt?: Date;
}

export type FieldObservationDocument = HydratedDocument<FieldObservation>;

const fieldObservationSchema = new Schema<FieldObservation>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    monitoringZoneId: { type: Schema.Types.ObjectId, ref: 'MonitoringZone', index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'FarmTask', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    observationDate: { type: Date, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    notes: { type: String, trim: true, maxlength: 3000 },
    observedCondition: { type: String, enum: OBSERVED_CONDITIONS, required: true, index: true },
    severity: { type: String, enum: OBSERVATION_SEVERITIES, required: true, index: true },
    imageUrls: [{ type: String, trim: true }],
    coordinates: { type: Schema.Types.Mixed },
    recommendedFollowUp: { type: String, trim: true, maxlength: 1200 },
    verificationStatus: { type: String, enum: OBSERVATION_VERIFICATION_STATUSES, default: 'unverified', index: true },
  },
  { timestamps: true },
);

fieldObservationSchema.index({ farmPlanId: 1, observationDate: -1 });

export const FieldObservationModel = model<FieldObservation>('FieldObservation', fieldObservationSchema);

