import { z } from 'zod';
import {
  APPLICATION_DOCUMENT_TYPES,
  APPLICATION_STATUSES_EXTENDED,
  APPLICATION_TYPES,
  FUNDING_SOURCES,
} from '@/constants/application.constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.');
const positiveOptional = z.coerce.number().min(0).optional();
const positiveDuration = z.coerce.number().int().positive().optional();

export const applicationTermsSchema = z
  .object({
    durationMonths: positiveDuration,
    monthlyRent: positiveOptional,
    annualLeaseAmount: positiveOptional,
    purchasePrice: positiveOptional,
    securityDeposit: positiveOptional,
    ownerRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
    applicantRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
    ownerParticipation: z.boolean().optional(),
    startDate: z.coerce.date().optional(),
    noticePeriodDays: positiveOptional,
    additionalTerms: z.array(z.string().trim().min(1).max(180)).default([]),
  })
  .refine(
    (terms) =>
      terms.ownerRevenuePercentage === undefined ||
      terms.applicantRevenuePercentage === undefined ||
      terms.ownerRevenuePercentage + terms.applicantRevenuePercentage === 100,
    {
      path: ['ownerRevenuePercentage'],
      message: 'Revenue-share percentages must total 100.',
    },
  );

const applicantProfileSchema = z.object({
  occupation: z.string().trim().max(120).optional(),
  experienceYears: z.coerce.number().min(0).max(80).optional(),
  currentLocation: z.string().trim().max(160).optional(),
  preferredLanguage: z.string().trim().max(80).optional(),
  farmingExperience: z.string().trim().max(1200).optional(),
  businessExperience: z.string().trim().max(1200).optional(),
});

const proposalSchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    summary: z.string().trim().min(10).max(2500),
    intendedUse: z.string().trim().min(3).max(1200),
    cropsOrBusinessTypes: z.array(z.string().trim().min(1).max(120)).default([]),
    expectedStartDate: z.coerce.date().optional(),
    proposedDurationMonths: positiveDuration,
    proposedMonthlyRent: positiveOptional,
    proposedAnnualLeaseAmount: positiveOptional,
    proposedPurchasePrice: positiveOptional,
    proposedSecurityDeposit: positiveOptional,
    proposedOwnerRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
    proposedApplicantRevenuePercentage: z.coerce.number().min(0).max(100).optional(),
    expectedInvestment: positiveOptional,
    fundingSource: z.enum(FUNDING_SOURCES).optional(),
    ownerParticipationRequested: z.boolean().default(false),
    requestedOwnerResponsibilities: z.array(z.string().trim().min(1).max(180)).default([]),
    applicantResponsibilities: z.array(z.string().trim().min(1).max(180)).default([]),
    estimatedWorkersRequired: z.coerce.number().min(0).optional(),
    additionalRequirements: z.array(z.string().trim().min(1).max(180)).default([]),
  })
  .refine(
    (proposal) =>
      proposal.proposedOwnerRevenuePercentage === undefined ||
      proposal.proposedApplicantRevenuePercentage === undefined ||
      proposal.proposedOwnerRevenuePercentage + proposal.proposedApplicantRevenuePercentage === 100,
    {
      path: ['proposedOwnerRevenuePercentage'],
      message: 'Revenue-share percentages must total 100.',
    },
  );

const applicationDocumentSchema = z.object({
  type: z.enum(APPLICATION_DOCUMENT_TYPES),
  name: z.string().trim().min(2).max(160),
  url: z.string().url(),
  uploadedAt: z.coerce.date().default(() => new Date()),
});

const createApplicationBaseSchema = z.object({
    landId: objectId,
    applicationType: z.enum(APPLICATION_TYPES),
    applicantProfile: applicantProfileSchema.default({}),
    proposal: proposalSchema,
    coverMessage: z.string().trim().max(1500).optional(),
    documents: z.array(applicationDocumentSchema).default([]),
    saveAsDraft: z.boolean().default(true),
  });

export const createApplicationSchema = createApplicationBaseSchema.superRefine((data, ctx) =>
  validateSubmissionCompleteness(data.applicationType, data.proposal, !data.saveAsDraft, ctx),
);

export const updateApplicationSchema = z.object({
  applicantProfile: applicantProfileSchema.partial().optional(),
  proposal: proposalSchema.innerType().partial().optional(),
  coverMessage: z.string().trim().max(1500).optional(),
  documents: z.array(applicationDocumentSchema).optional(),
});

export const applicationFilterSchema = z.object({
  status: z.enum(APPLICATION_STATUSES_EXTENDED).optional(),
  applicationType: z.enum(APPLICATION_TYPES).optional(),
  landId: objectId.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(['newest', 'oldest', 'investment', 'amount', 'duration']).default('newest'),
});

export const idParamSchema = z.object({ id: objectId });
export const messageSchema = z.object({ message: z.string().trim().min(3).max(1500) });
export const rejectionSchema = z.object({ reason: z.string().trim().min(3).max(1500) });
export const cancelSchema = z.object({ reason: z.string().trim().min(3).max(1500) });
export const negotiationSchema = z.object({
  message: z.string().trim().max(1500).optional(),
  proposedTerms: applicationTermsSchema,
});
export const agreementChangeSchema = z.object({ message: z.string().trim().min(3).max(1500) });

function validateSubmissionCompleteness(
  applicationType: string,
  proposal: z.infer<typeof proposalSchema>,
  isSubmitting: boolean,
  ctx: z.RefinementCtx,
): void {
  if (!isSubmitting) return;

  if (applicationType === 'lease' && (!proposal.proposedDurationMonths || !proposal.proposedAnnualLeaseAmount)) {
    ctx.addIssue({ code: 'custom', path: ['proposal', 'proposedAnnualLeaseAmount'], message: 'Lease requires duration and annual lease amount.' });
  }
  if (applicationType === 'rent' && (!proposal.proposedDurationMonths || !proposal.proposedMonthlyRent)) {
    ctx.addIssue({ code: 'custom', path: ['proposal', 'proposedMonthlyRent'], message: 'Rent requires duration and monthly rent.' });
  }
  if (applicationType === 'sale-enquiry' && proposal.proposedPurchasePrice !== undefined && proposal.proposedPurchasePrice <= 0) {
    ctx.addIssue({ code: 'custom', path: ['proposal', 'proposedPurchasePrice'], message: 'Purchase offer must be positive.' });
  }
  if (
    applicationType === 'revenue-share' &&
    (proposal.proposedOwnerRevenuePercentage === undefined || proposal.proposedApplicantRevenuePercentage === undefined)
  ) {
    ctx.addIssue({ code: 'custom', path: ['proposal', 'proposedOwnerRevenuePercentage'], message: 'Revenue share requires both percentages.' });
  }
  if (
    applicationType === 'joint-venture' &&
    (!proposal.expectedInvestment || !proposal.applicantResponsibilities.length)
  ) {
    ctx.addIssue({ code: 'custom', path: ['proposal', 'expectedInvestment'], message: 'Joint venture requires investment and responsibilities.' });
  }
}

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ApplicationFilterInput = z.infer<typeof applicationFilterSchema>;
export type NegotiationInput = z.infer<typeof negotiationSchema>;
