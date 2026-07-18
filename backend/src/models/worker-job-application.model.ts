import { Schema, model, type HydratedDocument } from 'mongoose';
import { ACTIVE_WORKER_JOB_APPLICATION_STATUSES, WORKER_JOB_APPLICATION_STATUSES, WORKER_JOB_APPLICATION_TYPES } from '@/constants/worker.constants.js';

export interface WorkerJobApplication {
  jobId: Schema.Types.ObjectId;
  applicantType: string;
  workerId?: Schema.Types.ObjectId;
  teamId?: Schema.Types.ObjectId;
  applicantUserId: Schema.Types.ObjectId;
  jobOwnerId: Schema.Types.ObjectId;
  coverMessage: string;
  proposedRate?: number;
  availableFrom?: Date;
  availabilityConfirmation: boolean;
  relevantExperience?: string;
  status: string;
  review?: { reviewedBy?: Schema.Types.ObjectId; reviewedAt?: Date; notes?: string; rejectionReason?: string };
  submittedAt?: Date;
  acceptedAt?: Date;
  withdrawnAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkerJobApplicationDocument = HydratedDocument<WorkerJobApplication>;

const workerJobApplicationSchema = new Schema<WorkerJobApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'FarmJob', required: true, index: true },
    applicantType: { type: String, enum: WORKER_JOB_APPLICATION_TYPES, required: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'WorkerTeam', index: true },
    applicantUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coverMessage: { type: String, required: true, trim: true, maxlength: 1500 },
    proposedRate: { type: Number, min: 0 },
    availableFrom: { type: Date },
    availabilityConfirmation: { type: Boolean, default: false },
    relevantExperience: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: WORKER_JOB_APPLICATION_STATUSES, default: 'submitted', index: true },
    review: {
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
      notes: { type: String, trim: true },
      rejectionReason: { type: String, trim: true },
    },
    submittedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    withdrawnAt: { type: Date },
  },
  { timestamps: true },
);

workerJobApplicationSchema.index(
  { jobId: 1, applicantUserId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: [...ACTIVE_WORKER_JOB_APPLICATION_STATUSES] } } },
);
workerJobApplicationSchema.index({ jobId: 1, status: 1, createdAt: -1 });
workerJobApplicationSchema.index({ applicantUserId: 1, status: 1, createdAt: -1 });

export const WorkerJobApplicationModel = model<WorkerJobApplication>('WorkerJobApplication', workerJobApplicationSchema);
