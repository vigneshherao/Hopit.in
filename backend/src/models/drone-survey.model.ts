import { Schema, model, type HydratedDocument } from 'mongoose';
import { DRONE_SURVEY_STATUSES } from '@/constants/remote-monitoring.constants.js';

export interface DroneSurvey {
  farmPlanId: Schema.Types.ObjectId;
  landId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  title: string;
  surveyDate: Date;
  operatorName?: string;
  droneModel?: string;
  cameraModel?: string;
  altitudeMeters?: number;
  groundSampleDistanceCm?: number;
  imageCount: number;
  coveragePercentage: number;
  flightNotes?: string;
  weatherDuringSurvey?: { temperature?: number; humidity?: number; windSpeed?: number; condition?: string };
  status: (typeof DRONE_SURVEY_STATUSES)[number];
  sceneId?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DroneSurveyDocument = HydratedDocument<DroneSurvey>;

const droneSurveySchema = new Schema<DroneSurvey>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    surveyDate: { type: Date, required: true, index: true },
    operatorName: { type: String, trim: true },
    droneModel: { type: String, trim: true },
    cameraModel: { type: String, trim: true },
    altitudeMeters: { type: Number, min: 0 },
    groundSampleDistanceCm: { type: Number, min: 0 },
    imageCount: { type: Number, min: 0, default: 0 },
    coveragePercentage: { type: Number, min: 0, max: 100, default: 0 },
    flightNotes: { type: String, trim: true, maxlength: 2000 },
    weatherDuringSurvey: { type: Schema.Types.Mixed },
    status: { type: String, enum: DRONE_SURVEY_STATUSES, default: 'draft', index: true },
    sceneId: { type: Schema.Types.ObjectId, ref: 'RemoteSensingScene' },
  },
  { timestamps: true },
);

droneSurveySchema.index({ farmPlanId: 1, surveyDate: -1 });

export const DroneSurveyModel = model<DroneSurvey>('DroneSurvey', droneSurveySchema);

