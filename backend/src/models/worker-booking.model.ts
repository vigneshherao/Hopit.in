import { Schema, model, type HydratedDocument } from 'mongoose';
import { WORKER_BOOKING_STATUSES } from '@/constants/auth.constants.js';

export interface WorkerBooking {
  farmerId: Schema.Types.ObjectId;
  workerId: Schema.Types.ObjectId;
  landId?: Schema.Types.ObjectId;
  workType: string;
  description?: string;
  workDate: Date;
  startTime?: string;
  endTime?: string;
  numberOfDays: number;
  agreedDailyWage: number;
  totalAmount: number;
  status: (typeof WORKER_BOOKING_STATUSES)[number];
  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkerBookingDocument = HydratedDocument<WorkerBooking>;

const workerBookingSchema = new Schema<WorkerBooking>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land' },
    workType: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 1500 },
    workDate: { type: Date, required: true, index: true },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true },
    numberOfDays: { type: Number, required: true, min: 1 },
    agreedDailyWage: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: WORKER_BOOKING_STATUSES, default: 'pending', index: true },
  },
  { timestamps: true },
);

workerBookingSchema.pre('validate', function calculateTotalAmount(next) {
  this.totalAmount = Number((this.numberOfDays * this.agreedDailyWage).toFixed(2));
  next();
});

export const WorkerBookingModel = model<WorkerBooking>('WorkerBooking', workerBookingSchema);
