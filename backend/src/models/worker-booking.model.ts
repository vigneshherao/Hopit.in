import { Schema, model, type HydratedDocument } from 'mongoose';
import { WORKER_BOOKING_PAYMENT_TYPES, WORKER_BOOKING_STATUSES_EXTENDED, WORKER_BOOKING_TYPES } from '@/constants/worker.constants.js';

export interface WorkerBooking {
  jobId?: Schema.Types.ObjectId;
  landId?: Schema.Types.ObjectId;
  bookedBy: Schema.Types.ObjectId;
  workerId?: Schema.Types.ObjectId;
  teamId?: Schema.Types.ObjectId;
  bookingType: string;
  workTitle: string;
  workDescription?: string;
  workType: string;
  startDate: Date;
  endDate?: Date;
  numberOfDays?: number;
  numberOfMonths?: number;
  numberOfWorkers: number;
  agreedPayment: { paymentType: string; rate: number; totalAmount: number; advanceAmount: number; remainingAmount: number; currency: string };
  facilities: { accommodationProvided: boolean; foodProvided: boolean; transportProvided: boolean };
  status: string;
  confirmation: { hirerConfirmed: boolean; workerConfirmed: boolean; hirerConfirmedAt?: Date; workerConfirmedAt?: Date };
  progress: { percentage: number; lastUpdatedAt?: Date };
  cancellation?: { cancelledBy?: Schema.Types.ObjectId; cancelledAt?: Date; reason?: string };
  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkerBookingDocument = HydratedDocument<WorkerBooking>;

const workerBookingSchema = new Schema<WorkerBooking>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'FarmJob', index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', index: true },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'WorkerTeam', index: true },
    bookingType: { type: String, enum: WORKER_BOOKING_TYPES, required: true, index: true },
    workTitle: { type: String, required: true, trim: true, maxlength: 160 },
    workDescription: { type: String, trim: true, maxlength: 2500 },
    workType: { type: String, required: true, trim: true, index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, index: true },
    numberOfDays: { type: Number, min: 1 },
    numberOfMonths: { type: Number, min: 1 },
    numberOfWorkers: { type: Number, default: 1, min: 1 },
    agreedPayment: {
      paymentType: { type: String, enum: WORKER_BOOKING_PAYMENT_TYPES, required: true },
      rate: { type: Number, required: true, min: 0 },
      totalAmount: { type: Number, default: 0, min: 0 },
      advanceAmount: { type: Number, default: 0, min: 0 },
      remainingAmount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: 'INR' },
    },
    facilities: {
      accommodationProvided: { type: Boolean, default: false },
      foodProvided: { type: Boolean, default: false },
      transportProvided: { type: Boolean, default: false },
    },
    status: { type: String, enum: WORKER_BOOKING_STATUSES_EXTENDED, default: 'pending-confirmation', index: true },
    confirmation: {
      hirerConfirmed: { type: Boolean, default: false },
      workerConfirmed: { type: Boolean, default: false },
      hirerConfirmedAt: { type: Date },
      workerConfirmedAt: { type: Date },
    },
    progress: {
      percentage: { type: Number, default: 0, min: 0, max: 100 },
      lastUpdatedAt: { type: Date },
    },
    cancellation: {
      cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
      cancelledAt: { type: Date },
      reason: { type: String, trim: true },
    },
  },
  { timestamps: true },
);

workerBookingSchema.pre('validate', function calculatePayment(next) {
  const units = this.numberOfDays ?? this.numberOfMonths ?? 1;
  const total = Number((this.agreedPayment.rate * units * this.numberOfWorkers).toFixed(2));
  this.agreedPayment.totalAmount = total;
  this.agreedPayment.remainingAmount = Math.max(0, Number((total - (this.agreedPayment.advanceAmount ?? 0)).toFixed(2)));
  if (this.confirmation.hirerConfirmed && this.confirmation.workerConfirmed && this.status === 'pending-confirmation') {
    this.status = 'confirmed';
  }
  next();
});

workerBookingSchema.index({ bookedBy: 1, status: 1, startDate: -1 });
workerBookingSchema.index({ workerId: 1, status: 1, startDate: -1 });
workerBookingSchema.index({ teamId: 1, status: 1, startDate: -1 });
workerBookingSchema.index({ jobId: 1, status: 1 });

export const WorkerBookingModel = model<WorkerBooking>('WorkerBooking', workerBookingSchema);
