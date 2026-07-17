import { Schema, model, type HydratedDocument } from 'mongoose';
import {
  ACTIVE_APPLICATION_STATUSES_EXTENDED,
  APPLICATION_DOCUMENT_TYPES,
  APPLICATION_STATUSES_EXTENDED,
  APPLICATION_TYPES,
  FUNDING_SOURCES,
  type ApplicationStatus,
  type ApplicationType,
} from '@/constants/application.constants.js';

export interface NegotiationTerms {
  durationMonths?: number;
  monthlyRent?: number;
  annualLeaseAmount?: number;
  purchasePrice?: number;
  securityDeposit?: number;
  ownerRevenuePercentage?: number;
  applicantRevenuePercentage?: number;
  ownerParticipation?: boolean;
  startDate?: Date;
  noticePeriodDays?: number;
  additionalTerms?: string[];
}

export interface Application {
  landId: Schema.Types.ObjectId;
  applicantId: Schema.Types.ObjectId;
  farmerId?: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  applicantProfile: {
    occupation?: string;
    experienceYears?: number;
    currentLocation?: string;
    preferredLanguage?: string;
    farmingExperience?: string;
    businessExperience?: string;
  };
  proposal: {
    title: string;
    summary: string;
    intendedUse: string;
    cropsOrBusinessTypes?: string[];
    expectedStartDate?: Date;
    proposedDurationMonths?: number;
    proposedMonthlyRent?: number;
    proposedAnnualLeaseAmount?: number;
    proposedPurchasePrice?: number;
    proposedSecurityDeposit?: number;
    proposedOwnerRevenuePercentage?: number;
    proposedApplicantRevenuePercentage?: number;
    expectedInvestment?: number;
    fundingSource?: (typeof FUNDING_SOURCES)[number];
    ownerParticipationRequested: boolean;
    requestedOwnerResponsibilities?: string[];
    applicantResponsibilities?: string[];
    estimatedWorkersRequired?: number;
    additionalRequirements?: string[];
  };
  coverMessage?: string;
  documents: {
    type: (typeof APPLICATION_DOCUMENT_TYPES)[number];
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  review: {
    reviewedBy?: Schema.Types.ObjectId;
    reviewedAt?: Date;
    ownerNotes?: string;
    rejectionReason?: string;
    changeRequestMessage?: string;
  };
  negotiation: {
    currentRound: number;
    lastActionBy?: Schema.Types.ObjectId;
    lastActionAt?: Date;
    agreedTerms?: NegotiationTerms;
  };
  agreement?: {
    agreementId?: Schema.Types.ObjectId;
    summaryGenerated: boolean;
    generatedAt?: Date;
  };
  submittedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ApplicationDocument = HydratedDocument<Application>;

const termsSchema = new Schema<NegotiationTerms>(
  {
    durationMonths: { type: Number, min: 1 },
    monthlyRent: { type: Number, min: 0 },
    annualLeaseAmount: { type: Number, min: 0 },
    purchasePrice: { type: Number, min: 0 },
    securityDeposit: { type: Number, min: 0 },
    ownerRevenuePercentage: { type: Number, min: 0, max: 100 },
    applicantRevenuePercentage: { type: Number, min: 0, max: 100 },
    ownerParticipation: { type: Boolean },
    startDate: { type: Date },
    noticePeriodDays: { type: Number, min: 0 },
    additionalTerms: [{ type: String, trim: true }],
  },
  { _id: false },
);

const applicationSchema = new Schema<Application>(
  {
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicationType: { type: String, enum: APPLICATION_TYPES, required: true, index: true },
    status: { type: String, enum: APPLICATION_STATUSES_EXTENDED, default: 'draft', index: true },
    applicantProfile: {
      occupation: { type: String, trim: true },
      experienceYears: { type: Number, min: 0, max: 80 },
      currentLocation: { type: String, trim: true },
      preferredLanguage: { type: String, trim: true },
      farmingExperience: { type: String, trim: true },
      businessExperience: { type: String, trim: true },
    },
    proposal: {
      title: { type: String, trim: true, required: true, maxlength: 180 },
      summary: { type: String, trim: true, required: true, maxlength: 2500 },
      intendedUse: { type: String, trim: true, required: true, maxlength: 1200 },
      cropsOrBusinessTypes: [{ type: String, trim: true }],
      expectedStartDate: { type: Date },
      proposedDurationMonths: { type: Number, min: 1 },
      proposedMonthlyRent: { type: Number, min: 0 },
      proposedAnnualLeaseAmount: { type: Number, min: 0 },
      proposedPurchasePrice: { type: Number, min: 0 },
      proposedSecurityDeposit: { type: Number, min: 0 },
      proposedOwnerRevenuePercentage: { type: Number, min: 0, max: 100 },
      proposedApplicantRevenuePercentage: { type: Number, min: 0, max: 100 },
      expectedInvestment: { type: Number, min: 0 },
      fundingSource: { type: String, enum: FUNDING_SOURCES },
      ownerParticipationRequested: { type: Boolean, default: false },
      requestedOwnerResponsibilities: [{ type: String, trim: true }],
      applicantResponsibilities: [{ type: String, trim: true }],
      estimatedWorkersRequired: { type: Number, min: 0 },
      additionalRequirements: [{ type: String, trim: true }],
    },
    coverMessage: { type: String, trim: true, maxlength: 1500 },
    documents: [
      {
        type: { type: String, enum: APPLICATION_DOCUMENT_TYPES, required: true },
        name: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    review: {
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
      ownerNotes: { type: String, trim: true },
      rejectionReason: { type: String, trim: true },
      changeRequestMessage: { type: String, trim: true },
    },
    negotiation: {
      currentRound: { type: Number, default: 0, min: 0 },
      lastActionBy: { type: Schema.Types.ObjectId, ref: 'User' },
      lastActionAt: { type: Date },
      agreedTerms: termsSchema,
    },
    agreement: {
      agreementId: { type: Schema.Types.ObjectId, ref: 'Agreement' },
      summaryGenerated: { type: Boolean, default: false },
      generatedAt: { type: Date },
    },
    submittedAt: { type: Date, index: true },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    withdrawnAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

applicationSchema.index(
  { landId: 1, applicantId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: [...ACTIVE_APPLICATION_STATUSES_EXTENDED] } },
  },
);
applicationSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ applicantId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ createdAt: -1 });

applicationSchema.pre('validate', function validateApplication(next) {
  if (this.applicantId?.toString() === this.ownerId?.toString()) {
    next(new Error('Applicant and land owner must be different users.'));
    return;
  }

  const ownerShare = this.proposal?.proposedOwnerRevenuePercentage;
  const applicantShare = this.proposal?.proposedApplicantRevenuePercentage;
  if (ownerShare !== undefined && applicantShare !== undefined && ownerShare + applicantShare !== 100) {
    next(new Error('Revenue-share percentages must total 100.'));
    return;
  }

  next();
});

export const ApplicationModel = model<Application>('Application', applicationSchema);
