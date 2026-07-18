import { Schema, model, type HydratedDocument } from 'mongoose';
import { IMAGE_METADATA_STATUSES, SCENE_PROCESSING_STATUSES } from '@/constants/remote-monitoring.constants.js';

export interface DroneImage {
  surveyId: Schema.Types.ObjectId;
  farmPlanId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  originalFileName: string;
  imageUrl: string;
  thumbnailUrl: string;
  compressedUrl: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  imageHash: string;
  capturedAt?: Date;
  coordinates?: { latitude?: number; longitude?: number; altitude?: number };
  orientation?: { yaw?: number; pitch?: number; roll?: number };
  metadataStatus: (typeof IMAGE_METADATA_STATUSES)[number];
  processingStatus: (typeof SCENE_PROCESSING_STATUSES)[number];
  createdAt?: Date;
  updatedAt?: Date;
}

export type DroneImageDocument = HydratedDocument<DroneImage>;

const droneImageSchema = new Schema<DroneImage>(
  {
    surveyId: { type: Schema.Types.ObjectId, ref: 'DroneSurvey', required: true, index: true },
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalFileName: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, required: true, trim: true },
    compressedUrl: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true, min: 1 },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    imageHash: { type: String, required: true, trim: true, index: true },
    capturedAt: { type: Date },
    coordinates: { type: Schema.Types.Mixed },
    orientation: { type: Schema.Types.Mixed },
    metadataStatus: { type: String, enum: IMAGE_METADATA_STATUSES, default: 'missing' },
    processingStatus: { type: String, enum: SCENE_PROCESSING_STATUSES, default: 'completed' },
  },
  { timestamps: true },
);

droneImageSchema.index({ surveyId: 1, imageHash: 1 }, { unique: true });

export const DroneImageModel = model<DroneImage>('DroneImage', droneImageSchema);

