import { Schema, model } from 'mongoose';

export interface WorkerProfileDocument {
  userId: Schema.Types.ObjectId;
  skills: string[];
  preferredLocations: string[];
  availability: 'available' | 'engaged' | 'unavailable';
}

const workerProfileSchema = new Schema<WorkerProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: [{ type: String, trim: true }],
    preferredLocations: [{ type: String, trim: true }],
    availability: {
      type: String,
      enum: ['available', 'engaged', 'unavailable'],
      default: 'available',
      index: true,
    },
  },
  { timestamps: true },
);

export const WorkerProfileModel = model<WorkerProfileDocument>('WorkerProfile', workerProfileSchema);
