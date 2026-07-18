import { Schema, model, type HydratedDocument } from 'mongoose';
import { SCENE_PROCESSING_STATUSES, SCENE_SOURCE_TYPES } from '@/constants/remote-monitoring.constants.js';

export interface RemoteSensingScene {
  farmPlanId: Schema.Types.ObjectId;
  landId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  provider: string;
  providerSceneId?: string;
  sourceType: (typeof SCENE_SOURCE_TYPES)[number];
  title: string;
  description?: string;
  capturedAt: Date;
  uploadedAt?: Date;
  cloudCoverage: number;
  spatialResolutionMeters: number;
  geometry?: Record<string, unknown>;
  footprint?: Record<string, unknown>;
  availableBands: string[];
  previewUrl?: string;
  thumbnailUrl?: string;
  originalFileUrl?: string;
  processedLayerUrls: Record<string, string>;
  processingStatus: (typeof SCENE_PROCESSING_STATUSES)[number];
  processingProgress: number;
  processingErrors: { code: string; message: string; createdAt: Date }[];
  isSimulated: boolean;
  dataQualityScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RemoteSensingSceneDocument = HydratedDocument<RemoteSensingScene>;

const remoteSensingSceneSchema = new Schema<RemoteSensingScene>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, required: true, trim: true, index: true },
    providerSceneId: { type: String, trim: true, index: true },
    sourceType: { type: String, enum: SCENE_SOURCE_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 2000 },
    capturedAt: { type: Date, required: true, index: true },
    uploadedAt: { type: Date },
    cloudCoverage: { type: Number, min: 0, max: 100, default: 0 },
    spatialResolutionMeters: { type: Number, min: 0, default: 10 },
    geometry: { type: Schema.Types.Mixed },
    footprint: { type: Schema.Types.Mixed },
    availableBands: [{ type: String, trim: true }],
    previewUrl: { type: String, trim: true },
    thumbnailUrl: { type: String, trim: true },
    originalFileUrl: { type: String, trim: true },
    processedLayerUrls: { type: Schema.Types.Mixed, default: {} },
    processingStatus: { type: String, enum: SCENE_PROCESSING_STATUSES, default: 'completed', index: true },
    processingProgress: { type: Number, min: 0, max: 100, default: 100 },
    processingErrors: [{ code: String, message: String, createdAt: { type: Date, default: Date.now } }],
    isSimulated: { type: Boolean, default: false, index: true },
    dataQualityScore: { type: Number, min: 0, max: 100, default: 70 },
  },
  { timestamps: true },
);

remoteSensingSceneSchema.index({ farmPlanId: 1, capturedAt: -1 });
remoteSensingSceneSchema.index({ farmPlanId: 1, sourceType: 1, processingStatus: 1 });

export const RemoteSensingSceneModel = model<RemoteSensingScene>('RemoteSensingScene', remoteSensingSceneSchema);

