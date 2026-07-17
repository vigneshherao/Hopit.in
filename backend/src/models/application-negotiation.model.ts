import { Schema, model, type HydratedDocument } from 'mongoose';
import { NEGOTIATION_ACTIONS } from '@/constants/application.constants.js';
import { type NegotiationTerms } from '@/models/application.model.js';

export interface ApplicationNegotiation {
  applicationId: Schema.Types.ObjectId;
  round: number;
  createdBy: Schema.Types.ObjectId;
  createdByRole: 'applicant' | 'owner' | 'admin';
  message?: string;
  proposedTerms: NegotiationTerms;
  action: (typeof NEGOTIATION_ACTIONS)[number];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ApplicationNegotiationDocument = HydratedDocument<ApplicationNegotiation>;

const proposedTermsSchema = new Schema<NegotiationTerms>(
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

const negotiationSchema = new Schema<ApplicationNegotiation>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    round: { type: Number, required: true, min: 1 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByRole: { type: String, enum: ['applicant', 'owner', 'admin'], required: true },
    message: { type: String, trim: true, maxlength: 1500 },
    proposedTerms: { type: proposedTermsSchema, default: {} },
    action: { type: String, enum: NEGOTIATION_ACTIONS, required: true },
  },
  { timestamps: true },
);

negotiationSchema.index({ applicationId: 1, createdAt: -1 });
negotiationSchema.index({ applicationId: 1, round: 1 }, { unique: true });

export const ApplicationNegotiationModel = model<ApplicationNegotiation>(
  'ApplicationNegotiation',
  negotiationSchema,
);
