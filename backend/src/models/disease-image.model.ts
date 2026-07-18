import { Schema, model, type HydratedDocument } from 'mongoose';

export interface DiseaseImage {
  analysisId: Schema.Types.ObjectId;
  imageUrl: string;
  thumbnailUrl: string;
  compressedUrl: string;
  imageHash: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
  uploadedAt: Date;
}

export type DiseaseImageDocument = HydratedDocument<DiseaseImage>;

const diseaseImageSchema = new Schema<DiseaseImage>(
  {
    analysisId: { type: Schema.Types.ObjectId, ref: 'DiseaseAnalysis', required: true, index: true },
    imageUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, required: true, trim: true },
    compressedUrl: { type: String, required: true, trim: true },
    imageHash: { type: String, required: true, trim: true, index: true },
    mimeType: { type: String, required: true, trim: true },
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
    size: { type: Number, required: true, min: 1 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

diseaseImageSchema.index({ imageHash: 1, uploadedAt: -1 });

export const DiseaseImageModel = model<DiseaseImage>('DiseaseImage', diseaseImageSchema);

