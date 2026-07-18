import { z } from 'zod';
import {
  CROP_HEALTH_STATUSES,
  DURATION_TYPES,
  FARM_JOB_HIRING_TYPES,
  FARM_JOB_PAYMENT_TYPES,
  FARM_JOB_STATUSES,
  FARM_JOB_WORK_TYPES,
  FARM_MANAGEMENT_REPORTING_FREQUENCIES,
  FARM_MANAGEMENT_STATUSES,
  PROFESSIONAL_ROLES,
  WORKER_AVAILABILITY_STATUSES_EXTENDED,
  WORKER_JOB_APPLICATION_TYPES,
  WORKER_SKILLS,
} from '@/constants/worker.constants.js';

const optionalString = z.string().trim().optional();
const stringArray = z.array(z.string().trim().min(1)).default([]);
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ID.');
const positiveNumber = z.coerce.number().min(0).optional();

export const idParamSchema = z.object({ id: objectId });
export const identifierParamSchema = z.object({ identifier: z.string().min(1) });
export const jobIdParamSchema = z.object({ jobId: objectId });
export const reportIdParamSchema = z.object({ reportId: objectId });
export const jobApplicationActionParamSchema = z.object({
  id: objectId,
  action: z.enum(['review', 'shortlist', 'reject', 'withdraw', 'accept']),
});

const coordinatesSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.coerce.number().min(-180).max(180), z.coerce.number().min(-90).max(90)]),
}).optional();

const workerLocationSchema = z.object({
  address: optionalString,
  village: optionalString,
  city: optionalString,
  district: optionalString,
  state: optionalString,
  country: z.string().trim().default('India'),
  pincode: optionalString,
  coordinates: coordinatesSchema,
}).optional();

const workerDocumentSchema = z.object({
  type: z.enum(['identity-proof', 'address-proof', 'experience-certificate', 'driving-license', 'equipment-license', 'other']),
  name: z.string().trim().min(1),
  url: z.string().trim().min(1),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).default('pending'),
  uploadedAt: z.coerce.date().default(() => new Date()),
});

const portfolioSchema = z.object({
  title: z.string().trim().min(1),
  description: optionalString,
  images: z.array(z.string().trim()).default([]),
  cropOrWorkType: optionalString,
  location: optionalString,
  completedAt: z.coerce.date().optional(),
});

const baseWorkerProfileSchema = z.object({
  headline: z.string().trim().min(4).max(140),
  bio: z.string().trim().min(20).max(2000),
  professionalRoles: z.array(z.enum(PROFESSIONAL_ROLES)).min(1),
  skills: z.array(z.enum(WORKER_SKILLS)).min(1),
  experienceYears: z.coerce.number().min(0).max(80).default(0),
  experienceDescription: optionalString,
  languages: stringArray,
  profileImage: optionalString,
  coverImage: optionalString,
  location: workerLocationSchema,
  availability: z.object({
    status: z.enum(WORKER_AVAILABILITY_STATUSES_EXTENDED).default('available'),
    availableFrom: z.coerce.date().optional(),
    preferredDurationTypes: z.array(z.enum(DURATION_TYPES)).default([]),
    willingToRelocate: z.boolean().default(false),
    willingToStayOnFarm: z.boolean().default(false),
    maximumTravelDistanceKm: z.coerce.number().min(0).max(2000).optional(),
  }).default({}),
  pricing: z.object({
    dailyWage: positiveNumber,
    weeklyRate: positiveNumber,
    monthlySalary: positiveNumber,
    seasonalRate: positiveNumber,
    negotiable: z.boolean().default(true),
  }).default({}),
  workPreferences: z.object({
    preferredCrops: stringArray,
    preferredWorkTypes: z.array(z.enum(WORKER_SKILLS)).default([]),
    acceptsIndividualWork: z.boolean().default(true),
    acceptsTeamWork: z.boolean().default(false),
    acceptsFarmManagement: z.boolean().default(false),
    acceptsNightStay: z.boolean().default(false),
  }).default({}),
  documents: z.array(workerDocumentSchema).default([]),
  portfolio: z.array(portfolioSchema).default([]),
});

export const createWorkerProfileSchema = baseWorkerProfileSchema;
export const updateWorkerProfileSchema = baseWorkerProfileSchema.deepPartial();

export const workerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  search: optionalString,
  state: optionalString,
  district: optionalString,
  city: optionalString,
  professionalRole: z.enum(PROFESSIONAL_ROLES).optional(),
  skill: z.enum(WORKER_SKILLS).optional(),
  minimumExperience: z.coerce.number().min(0).optional(),
  maximumDailyWage: z.coerce.number().min(0).optional(),
  maximumMonthlySalary: z.coerce.number().min(0).optional(),
  availabilityStatus: z.enum(WORKER_AVAILABILITY_STATUSES_EXTENDED).optional(),
  willingToRelocate: z.coerce.boolean().optional(),
  willingToStayOnFarm: z.coerce.boolean().optional(),
  acceptsFarmManagement: z.coerce.boolean().optional(),
  minimumRating: z.coerce.number().min(0).max(5).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(1).max(500).optional(),
  sort: z.enum(['recommended', 'highest-rated', 'most-experienced', 'price-low-high', 'price-high-low', 'nearest', 'newest']).default('recommended'),
});

export const verificationActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().trim().max(1000).optional(),
}).refine((data) => data.action === 'approve' || Boolean(data.reason), {
  path: ['reason'],
  message: 'Rejection reason is required.',
});

const jobLocationSchema = z.object({
  address: optionalString,
  village: optionalString,
  city: optionalString,
  district: optionalString,
  state: optionalString,
  pincode: optionalString,
  coordinates: coordinatesSchema,
}).optional();

const baseFarmJobSchema = z.object({
  landId: objectId.optional(),
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(20).max(4000),
  professionalRolesRequired: z.array(z.enum(PROFESSIONAL_ROLES)).min(1),
  skillsRequired: z.array(z.enum(WORKER_SKILLS)).default([]),
  workType: z.enum(FARM_JOB_WORK_TYPES),
  hiringType: z.enum(FARM_JOB_HIRING_TYPES),
  numberOfWorkersRequired: z.coerce.number().int().min(1).default(1),
  duration: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    numberOfDays: z.coerce.number().int().min(1).optional(),
    numberOfMonths: z.coerce.number().int().min(1).optional(),
    flexible: z.boolean().default(false),
  }).default({}),
  schedule: z.object({
    workingDays: stringArray,
    startTime: optionalString,
    endTime: optionalString,
    accommodationProvided: z.boolean().default(false),
    foodProvided: z.boolean().default(false),
    transportProvided: z.boolean().default(false),
  }).default({}),
  location: jobLocationSchema,
  cropOrBusinessType: optionalString,
  responsibilities: stringArray,
  requirements: stringArray,
  compensation: z.object({
    paymentType: z.enum(FARM_JOB_PAYMENT_TYPES),
    amount: positiveNumber,
    minimumAmount: positiveNumber,
    maximumAmount: positiveNumber,
    currency: z.string().trim().default('INR'),
  }),
  status: z.enum(['draft', 'open']).default('draft'),
  expiresAt: z.coerce.date().optional(),
});

export const createFarmJobSchema = baseFarmJobSchema;
export const updateFarmJobSchema = baseFarmJobSchema.deepPartial().omit({ status: true });

export const farmJobQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  search: optionalString,
  state: optionalString,
  district: optionalString,
  city: optionalString,
  professionalRole: z.enum(PROFESSIONAL_ROLES).optional(),
  skill: z.enum(WORKER_SKILLS).optional(),
  workType: z.enum(FARM_JOB_WORK_TYPES).optional(),
  hiringType: z.enum(FARM_JOB_HIRING_TYPES).optional(),
  minimumPay: z.coerce.number().min(0).optional(),
  maximumPay: z.coerce.number().min(0).optional(),
  paymentType: z.enum(FARM_JOB_PAYMENT_TYPES).optional(),
  accommodationProvided: z.coerce.boolean().optional(),
  foodProvided: z.coerce.boolean().optional(),
  transportProvided: z.coerce.boolean().optional(),
  cropOrBusinessType: optionalString,
  startDate: z.coerce.date().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(1).max(500).optional(),
  status: z.enum(FARM_JOB_STATUSES).optional(),
  sort: z.enum(['newest', 'oldest', 'highest-pay', 'lowest-pay', 'nearest', 'starting-soon']).default('newest'),
});

export const farmJobStatusSchema = z.object({
  action: z.enum(['open', 'pause', 'resume', 'mark-filled', 'cancel', 'complete']),
});

export const jobApplicationSchema = z.object({
  applicantType: z.enum(WORKER_JOB_APPLICATION_TYPES).default('individual'),
  teamId: objectId.optional(),
  coverMessage: z.string().trim().min(10).max(1500),
  proposedRate: z.coerce.number().min(0).optional(),
  availableFrom: z.coerce.date().optional(),
  availabilityConfirmation: z.boolean().default(false),
  relevantExperience: optionalString,
});

export const applicationActionSchema = z.object({
  notes: optionalString,
  reason: optionalString,
});

export const bookingProgressSchema = z.object({ percentage: z.coerce.number().min(0).max(100) });
export const bookingCancelSchema = z.object({ reason: z.string().trim().min(3).max(1000) });

export const createAssignmentSchema = z.object({
  landId: objectId,
  managerId: objectId,
  bookingId: objectId.optional(),
  title: z.string().trim().min(4),
  responsibilities: stringArray,
  cropOrBusinessType: optionalString,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  reportingFrequency: z.enum(FARM_MANAGEMENT_REPORTING_FREQUENCIES).default('weekly'),
  status: z.enum(FARM_MANAGEMENT_STATUSES).default('pending'),
  budget: z.object({
    totalBudget: positiveNumber,
    workerBudget: positiveNumber,
    equipmentBudget: positiveNumber,
    materialsBudget: positiveNumber,
    miscellaneousBudget: positiveNumber,
  }).default({}),
  permissions: z.object({
    canHireWorkers: z.boolean().default(false),
    canBookEquipment: z.boolean().default(false),
    canRecordExpenses: z.boolean().default(true),
    canUploadProgress: z.boolean().default(true),
    canRequestBudget: z.boolean().default(true),
  }).default({}),
});

export const reportSchema = z.object({
  title: z.string().trim().min(4),
  summary: z.string().trim().min(10).max(3000),
  activitiesCompleted: stringArray,
  issuesFound: stringArray,
  nextActions: stringArray,
  weatherNotes: optionalString,
  cropHealthStatus: z.enum(CROP_HEALTH_STATUSES).default('not-applicable'),
  progressPercentage: z.coerce.number().min(0).max(100),
  expensesRecorded: z.array(z.object({
    category: z.string().trim().min(1),
    description: optionalString,
    amount: z.coerce.number().min(0),
    receiptUrl: optionalString,
  })).default([]),
  media: z.object({ images: z.array(z.string()).default([]), videos: z.array(z.string()).default([]) }).default({}),
});

export const reportFeedbackSchema = z.object({ message: z.string().trim().min(3).max(1200) });
export const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  title: z.string().trim().min(3),
  comment: z.string().trim().min(5).max(2000),
  categories: z.object({
    workQuality: z.coerce.number().min(1).max(5),
    punctuality: z.coerce.number().min(1).max(5),
    communication: z.coerce.number().min(1).max(5),
    reliability: z.coerce.number().min(1).max(5),
    professionalism: z.coerce.number().min(1).max(5),
  }),
});

export type WorkerQuery = z.infer<typeof workerQuerySchema>;
export type FarmJobQuery = z.infer<typeof farmJobQuerySchema>;
