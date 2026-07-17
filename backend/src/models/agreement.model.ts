import { Schema, model, type HydratedDocument } from 'mongoose';
import {
  AGREEMENT_STATUSES,
  AGREEMENT_TYPES,
  LEGAL_DISCLAIMER,
  type AgreementStatus,
} from '@/constants/application.constants.js';

export interface Agreement {
  applicationId: Schema.Types.ObjectId;
  landId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  applicantId: Schema.Types.ObjectId;
  agreementType: (typeof AGREEMENT_TYPES)[number];
  status: AgreementStatus;
  terms: {
    landTitle: string;
    landLocation: string;
    landAreaValue: number;
    landAreaUnit: string;
    purpose: string;
    durationMonths?: number;
    startDate?: Date;
    endDate?: Date;
    monthlyRent?: number;
    annualLeaseAmount?: number;
    purchasePrice?: number;
    securityDeposit?: number;
    ownerRevenuePercentage?: number;
    applicantRevenuePercentage?: number;
    ownerParticipation: boolean;
    noticePeriodDays?: number;
    ownerResponsibilities: string[];
    applicantResponsibilities: string[];
    additionalTerms: string[];
  };
  generatedSummary: string;
  version: number;
  versionHistory: {
    version: number;
    terms: Record<string, unknown>;
    generatedSummary: string;
    generatedAt: Date;
  }[];
  generatedBy: 'system' | 'admin';
  legalDisclaimer: string;
  confirmations: {
    ownerConfirmedAt?: Date;
    applicantConfirmedAt?: Date;
  };
  changeRequests: {
    requestedBy: Schema.Types.ObjectId;
    message: string;
    requestedAt: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type AgreementDocument = HydratedDocument<Agreement>;

const agreementSchema = new Schema<Agreement>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agreementType: { type: String, enum: AGREEMENT_TYPES, required: true, index: true },
    status: { type: String, enum: AGREEMENT_STATUSES, default: 'draft', index: true },
    terms: {
      landTitle: { type: String, required: true, trim: true },
      landLocation: { type: String, required: true, trim: true },
      landAreaValue: { type: Number, required: true },
      landAreaUnit: { type: String, required: true },
      purpose: { type: String, required: true },
      durationMonths: { type: Number, min: 1 },
      startDate: { type: Date },
      endDate: { type: Date },
      monthlyRent: { type: Number, min: 0 },
      annualLeaseAmount: { type: Number, min: 0 },
      purchasePrice: { type: Number, min: 0 },
      securityDeposit: { type: Number, min: 0 },
      ownerRevenuePercentage: { type: Number, min: 0, max: 100 },
      applicantRevenuePercentage: { type: Number, min: 0, max: 100 },
      ownerParticipation: { type: Boolean, default: false },
      noticePeriodDays: { type: Number, min: 0 },
      ownerResponsibilities: [{ type: String, trim: true }],
      applicantResponsibilities: [{ type: String, trim: true }],
      additionalTerms: [{ type: String, trim: true }],
    },
    generatedSummary: { type: String, required: true, trim: true },
    version: { type: Number, default: 1, min: 1 },
    versionHistory: [
      {
        version: { type: Number, required: true },
        terms: { type: Schema.Types.Mixed, required: true },
        generatedSummary: { type: String, required: true },
        generatedAt: { type: Date, default: Date.now },
      },
    ],
    generatedBy: { type: String, enum: ['system', 'admin'], default: 'system' },
    legalDisclaimer: { type: String, default: LEGAL_DISCLAIMER },
    confirmations: {
      ownerConfirmedAt: { type: Date },
      applicantConfirmedAt: { type: Date },
    },
    changeRequests: [
      {
        requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true, trim: true },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

agreementSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
agreementSchema.index({ applicantId: 1, status: 1, createdAt: -1 });

export const AgreementModel = model<Agreement>('Agreement', agreementSchema);
