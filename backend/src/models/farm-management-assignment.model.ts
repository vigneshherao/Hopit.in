import { Schema, model, type HydratedDocument } from 'mongoose';
import { FARM_MANAGEMENT_REPORTING_FREQUENCIES, FARM_MANAGEMENT_STATUSES } from '@/constants/worker.constants.js';

export interface FarmManagementAssignment {
  landId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  managerId: Schema.Types.ObjectId;
  bookingId?: Schema.Types.ObjectId;
  title: string;
  responsibilities: string[];
  cropOrBusinessType?: string;
  startDate: Date;
  endDate?: Date;
  reportingFrequency: string;
  status: string;
  budget: { totalBudget?: number; workerBudget?: number; equipmentBudget?: number; materialsBudget?: number; miscellaneousBudget?: number };
  permissions: { canHireWorkers: boolean; canBookEquipment: boolean; canRecordExpenses: boolean; canUploadProgress: boolean; canRequestBudget: boolean };
  currentProgressPercentage: number;
  nextReportDueAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FarmManagementAssignmentDocument = HydratedDocument<FarmManagementAssignment>;

const assignmentSchema = new Schema<FarmManagementAssignment>(
  {
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'WorkerBooking', index: true },
    title: { type: String, required: true, trim: true },
    responsibilities: [{ type: String, trim: true }],
    cropOrBusinessType: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    reportingFrequency: { type: String, enum: FARM_MANAGEMENT_REPORTING_FREQUENCIES, default: 'weekly' },
    status: { type: String, enum: FARM_MANAGEMENT_STATUSES, default: 'pending', index: true },
    budget: {
      totalBudget: { type: Number, min: 0 },
      workerBudget: { type: Number, min: 0 },
      equipmentBudget: { type: Number, min: 0 },
      materialsBudget: { type: Number, min: 0 },
      miscellaneousBudget: { type: Number, min: 0 },
    },
    permissions: {
      canHireWorkers: { type: Boolean, default: false },
      canBookEquipment: { type: Boolean, default: false },
      canRecordExpenses: { type: Boolean, default: true },
      canUploadProgress: { type: Boolean, default: true },
      canRequestBudget: { type: Boolean, default: true },
    },
    currentProgressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    nextReportDueAt: { type: Date, index: true },
  },
  { timestamps: true },
);

assignmentSchema.index({ ownerId: 1, status: 1 });
assignmentSchema.index({ managerId: 1, status: 1 });

export const FarmManagementAssignmentModel = model<FarmManagementAssignment>('FarmManagementAssignment', assignmentSchema);
