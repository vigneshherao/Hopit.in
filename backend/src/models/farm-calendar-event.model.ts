import { Schema, model, type HydratedDocument } from 'mongoose';
import { FARM_CALENDAR_REPEAT_TYPES } from '@/constants/farm-task.constants.js';

export interface FarmCalendarEvent {
  farmPlanId: Schema.Types.ObjectId;
  taskId?: Schema.Types.ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  eventColor: string;
  notificationEnabled: boolean;
  repeatType: (typeof FARM_CALENDAR_REPEAT_TYPES)[number];
  createdAt?: Date;
  updatedAt?: Date;
}

export type FarmCalendarEventDocument = HydratedDocument<FarmCalendarEvent>;

const farmCalendarEventSchema = new Schema<FarmCalendarEvent>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'FarmTask', index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 2000 },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    allDay: { type: Boolean, default: true },
    eventColor: { type: String, default: '#059669', trim: true },
    notificationEnabled: { type: Boolean, default: true },
    repeatType: { type: String, enum: FARM_CALENDAR_REPEAT_TYPES, default: 'none' },
  },
  { timestamps: true },
);

farmCalendarEventSchema.index({ farmPlanId: 1, startDate: 1 });

export const FarmCalendarEventModel = model<FarmCalendarEvent>('FarmCalendarEvent', farmCalendarEventSchema);
