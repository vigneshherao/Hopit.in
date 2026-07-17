export const APPLICATION_STATUSES_EXTENDED = [
  'draft',
  'submitted',
  'under-review',
  'shortlisted',
  'changes-requested',
  'accepted',
  'rejected',
  'withdrawn',
  'expired',
  'cancelled',
  'agreement-pending',
  'agreement-ready',
  'completed',
] as const;

export const APPLICATION_TYPES = [
  'lease',
  'rent',
  'sale-enquiry',
  'joint-venture',
  'revenue-share',
  'business-proposal',
] as const;

export const APPLICATION_DOCUMENT_TYPES = [
  'identity-proof',
  'experience-proof',
  'business-plan',
  'financial-proof',
  'address-proof',
  'license',
  'other',
] as const;

export const FUNDING_SOURCES = ['self-funded', 'loan', 'investor', 'partnership', 'other'] as const;

export const NEGOTIATION_ACTIONS = [
  'proposal-created',
  'counter-offer',
  'terms-accepted',
  'changes-requested',
  'proposal-withdrawn',
] as const;

export const AGREEMENT_TYPES = ['lease', 'rent', 'sale', 'joint-venture', 'revenue-share', 'business-use'] as const;

export const AGREEMENT_STATUSES = [
  'draft',
  'review-pending',
  'changes-requested',
  'ready-for-legal-review',
  'approved',
  'cancelled',
] as const;

export const ACTIVE_APPLICATION_STATUSES_EXTENDED = [
  'draft',
  'submitted',
  'under-review',
  'shortlisted',
  'changes-requested',
  'accepted',
  'agreement-pending',
  'agreement-ready',
] as const;

export const CLOSED_APPLICATION_STATUSES = ['rejected', 'withdrawn', 'expired', 'cancelled', 'completed'] as const;

export const APPLICATION_STATUS_TRANSITIONS = {
  draft: ['submitted', 'withdrawn', 'cancelled'],
  submitted: ['under-review', 'shortlisted', 'changes-requested', 'accepted', 'rejected', 'withdrawn', 'expired'],
  'under-review': ['shortlisted', 'changes-requested', 'accepted', 'rejected', 'withdrawn'],
  shortlisted: ['changes-requested', 'accepted', 'rejected', 'withdrawn'],
  'changes-requested': ['submitted', 'rejected', 'withdrawn'],
  accepted: ['agreement-pending', 'cancelled'],
  'agreement-pending': ['agreement-ready', 'cancelled'],
  'agreement-ready': ['completed', 'cancelled'],
  rejected: [],
  withdrawn: [],
  expired: [],
  cancelled: [],
  completed: [],
} as const;

export const APPLICATION_TYPE_TRANSACTION_MAP = {
  lease: 'lease',
  rent: 'rent',
  'sale-enquiry': 'sale',
  'joint-venture': 'joint-venture',
  'revenue-share': 'revenue-share',
  'business-proposal': 'business-proposal',
} as const;

export const BUSINESS_PROPOSAL_PURPOSES = [
  'commercial',
  'agri-business',
  'warehouse',
  'solar-project',
  'dairy',
  'poultry',
  'fish-farming',
  'other',
] as const;

export const LEGAL_DISCLAIMER =
  'This is a platform-generated draft summary and is not legal advice or a legally executed agreement. Parties should consult a qualified legal professional and complete applicable registration, stamp-duty, and statutory requirements.';

export type ApplicationStatus = (typeof APPLICATION_STATUSES_EXTENDED)[number];
export type ApplicationType = (typeof APPLICATION_TYPES)[number];
export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];
