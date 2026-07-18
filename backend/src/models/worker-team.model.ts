import { Schema, model, type HydratedDocument } from 'mongoose';
import { PROFESSIONAL_ROLES, TEAM_MEMBER_STATUSES, WORKER_AVAILABILITY_STATUSES_EXTENDED, WORKER_SKILLS } from '@/constants/worker.constants.js';

export interface WorkerTeam {
  leaderId: Schema.Types.ObjectId;
  name: string;
  description: string;
  image?: string;
  members: { workerId: Schema.Types.ObjectId; role: string; joinedAt: Date; status: string }[];
  professionalRoles: string[];
  skills: string[];
  teamSize: number;
  location?: { city?: string; district?: string; state?: string; coordinates?: { type: 'Point'; coordinates: [number, number] } };
  pricing: { dailyTeamRate?: number; weeklyTeamRate?: number; monthlyTeamRate?: number; negotiable: boolean };
  availabilityStatus: string;
  ratingAverage: number;
  ratingCount: number;
  completedJobs: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WorkerTeamDocument = HydratedDocument<WorkerTeam>;

const workerTeamSchema = new Schema<WorkerTeam>(
  {
    leaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, trim: true },
    members: [
      {
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, required: true, trim: true },
        joinedAt: { type: Date, default: Date.now },
        status: { type: String, enum: TEAM_MEMBER_STATUSES, default: 'active' },
      },
    ],
    professionalRoles: [{ type: String, enum: PROFESSIONAL_ROLES, index: true }],
    skills: [{ type: String, enum: WORKER_SKILLS, index: true }],
    teamSize: { type: Number, default: 1, min: 1 },
    location: {
      city: { type: String, trim: true },
      district: { type: String, trim: true, index: true },
      state: { type: String, trim: true, index: true },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] },
      },
    },
    pricing: {
      dailyTeamRate: { type: Number, min: 0, index: true },
      weeklyTeamRate: { type: Number, min: 0 },
      monthlyTeamRate: { type: Number, min: 0 },
      negotiable: { type: Boolean, default: true },
    },
    availabilityStatus: { type: String, enum: WORKER_AVAILABILITY_STATUSES_EXTENDED, default: 'available', index: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5, index: true },
    ratingCount: { type: Number, default: 0, min: 0 },
    completedJobs: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

workerTeamSchema.pre('validate', function validateTeam(next) {
  const activeMembers = this.members.filter((member) => member.status === 'active');
  const uniqueMembers = new Set(this.members.map((member) => member.workerId.toString()));
  if (!activeMembers.length) return next(new Error('A team must have at least one active member.'));
  if (!this.members.some((member) => member.workerId.toString() === this.leaderId.toString())) {
    return next(new Error('Team leader must be a team member.'));
  }
  if (uniqueMembers.size !== this.members.length) return next(new Error('Team members cannot be duplicated.'));
  this.teamSize = activeMembers.length;
  next();
});

workerTeamSchema.index({ 'location.coordinates': '2dsphere' });
workerTeamSchema.index({ leaderId: 1, isActive: 1 });
workerTeamSchema.index({ professionalRoles: 1, skills: 1, availabilityStatus: 1 });
workerTeamSchema.index({ name: 'text', description: 'text', professionalRoles: 'text', skills: 'text', 'location.district': 'text', 'location.state': 'text' });

export const WorkerTeamModel = model<WorkerTeam>('WorkerTeam', workerTeamSchema);
