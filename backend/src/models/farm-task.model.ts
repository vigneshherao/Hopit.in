import { Schema, model, type HydratedDocument } from 'mongoose';
import { FARM_TASK_CATEGORIES, FARM_TASK_PRIORITIES, FARM_TASK_STATUSES, type FarmTaskCategory, type FarmTaskPriority, type FarmTaskStatus } from '@/constants/farm-task.constants.js';

export interface FarmTask {
  farmPlanId: Schema.Types.ObjectId;
  landId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  category: FarmTaskCategory;
  priority: FarmTaskPriority;
  status: FarmTaskStatus;
  assignedWorker?: Schema.Types.ObjectId;
  assignedWorkerTeam?: Schema.Types.ObjectId;
  estimatedDuration?: number;
  startDate: Date;
  endDate: Date;
  actualStart?: Date;
  actualEnd?: Date;
  completedAt?: Date;
  progress: number;
  dependencies: Schema.Types.ObjectId[];
  attachments: string[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FarmTaskDocument = HydratedDocument<FarmTask>;

const farmTaskSchema = new Schema<FarmTask>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 2000 },
    category: { type: String, enum: FARM_TASK_CATEGORIES, required: true, index: true },
    priority: { type: String, enum: FARM_TASK_PRIORITIES, default: 'Medium', index: true },
    status: { type: String, enum: FARM_TASK_STATUSES, default: 'Pending', index: true },
    assignedWorker: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedWorkerTeam: { type: Schema.Types.ObjectId, ref: 'WorkerTeam', index: true },
    estimatedDuration: { type: Number, min: 0 },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    actualStart: { type: Date },
    actualEnd: { type: Date },
    completedAt: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'FarmTask' }],
    attachments: [{ type: String, trim: true }],
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

farmTaskSchema.index({ farmPlanId: 1, status: 1, startDate: 1 });
farmTaskSchema.index({ ownerId: 1, status: 1, endDate: 1 });
farmTaskSchema.index({ assignedWorker: 1, status: 1, startDate: 1 });

export const FarmTaskModel = model<FarmTask>('FarmTask', farmTaskSchema);
