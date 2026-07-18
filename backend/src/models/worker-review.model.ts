import { Schema, model, type HydratedDocument } from 'mongoose';

export interface WorkerReview {
  bookingId: Schema.Types.ObjectId;
  workerId?: Schema.Types.ObjectId;
  teamId?: Schema.Types.ObjectId;
  reviewerId: Schema.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  categories: { workQuality: number; punctuality: number; communication: number; reliability: number; professionalism: number };
  response?: { message?: string; respondedAt?: Date };
  isVisible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkerReviewDocument = HydratedDocument<WorkerReview>;

const ratingField = { type: Number, required: true, min: 1, max: 5 };

const workerReviewSchema = new Schema<WorkerReview>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'WorkerBooking', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'WorkerTeam', index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: ratingField,
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    categories: {
      workQuality: ratingField,
      punctuality: ratingField,
      communication: ratingField,
      reliability: ratingField,
      professionalism: ratingField,
    },
    response: {
      message: { type: String, trim: true, maxlength: 1200 },
      respondedAt: { type: Date },
    },
    isVisible: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

workerReviewSchema.index({ bookingId: 1, reviewerId: 1 }, { unique: true });
workerReviewSchema.index({ workerId: 1, isVisible: 1, createdAt: -1 });
workerReviewSchema.index({ teamId: 1, isVisible: 1, createdAt: -1 });

export const WorkerReviewModel = model<WorkerReview>('WorkerReview', workerReviewSchema);
