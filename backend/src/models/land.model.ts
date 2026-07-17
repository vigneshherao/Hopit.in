import { Schema, model } from 'mongoose';

export interface LandDocument {
  ownerId: Schema.Types.ObjectId;
  title: string;
  location: string;
  areaInAcres: number;
  status: 'draft' | 'active' | 'leased';
}

const landSchema = new Schema<LandDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    areaInAcres: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'active', 'leased'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true },
);

export const LandModel = model<LandDocument>('Land', landSchema);
