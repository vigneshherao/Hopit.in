import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose, { type FilterQuery } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/env.js';
import {
  ACTIVE_APPLICATION_STATUSES_EXTENDED,
  APPLICATION_TYPE_TRANSACTION_MAP,
  BUSINESS_PROPOSAL_PURPOSES,
  LEGAL_DISCLAIMER,
  type ApplicationStatus,
  type ApplicationType,
} from '@/constants/application.constants.js';
import { AgreementModel, type AgreementDocument } from '@/models/agreement.model.js';
import { ApplicationNegotiationModel } from '@/models/application-negotiation.model.js';
import {
  ApplicationModel,
  type ApplicationDocument,
  type NegotiationTerms,
} from '@/models/application.model.js';
import { LandModel, type LandDocument } from '@/models/land.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import type { AuthenticatedUser } from '@/types/http.js';
import {
  type ApplicationFilterInput,
  type CreateApplicationInput,
  type NegotiationInput,
  type UpdateApplicationInput,
} from '@/validators/application.validator.js';
import { AppError } from '@/utils/app-error.js';
import {
  canTransitionApplicationStatus,
  getAllowedApplicationActions,
  getApplicationActorRole,
} from '@/utils/application-status.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadRoot = path.resolve(__dirname, '../../uploads/applications');

export async function createApplication(input: CreateApplicationInput, user: AuthenticatedUser) {
  assertApplicantRole(user.role);
  const land = await findApplicationLand(input.landId);
  assertLandAcceptsApplications(land);
  assertNotOwnLand(land, user.id);
  assertApplicationTypeCompatible(land, input.applicationType);
  await assertNoActiveApplication(input.landId, user.id);

  const status = input.saveAsDraft ? 'draft' : 'submitted';
  const application = await ApplicationModel.create({
    landId: land._id,
    applicantId: user.id,
    farmerId: user.role === 'farmer' ? user.id : undefined,
    ownerId: land.ownerId,
    applicationType: input.applicationType,
    status,
    applicantProfile: input.applicantProfile,
    proposal: input.proposal,
    coverMessage: input.coverMessage,
    documents: input.documents,
    submittedAt: status === 'submitted' ? new Date() : undefined,
    expiresAt: status === 'submitted' ? new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) : undefined,
  });

  await ApplicationNegotiationModel.create({
    applicationId: application._id,
    round: 1,
    createdBy: user.id,
    createdByRole: 'applicant',
    message: input.coverMessage,
    proposedTerms: proposalToTerms(application),
    action: 'proposal-created',
  });
  application.negotiation.currentRound = 1;
  application.negotiation.lastActionBy = user.id as never;
  application.negotiation.lastActionAt = new Date();
  await application.save();

  if (status === 'submitted') {
    await notify(application.ownerId, 'application-submitted', 'New land application submitted', `${application.proposal.title} was submitted.`, application);
  }

  return application;
}

export async function submitApplication(id: string, user: AuthenticatedUser) {
  const application = await getApplicationForAccess(id, user);
  const actorRole = getApplicationActorRole(application, user);
  if (!['applicant', 'admin'].includes(actorRole)) throw new AppError('Not authorized.', 403);
  assertTransition(application, 'submitted');
  const land = await findApplicationLand(documentId(application.landId));
  assertLandAcceptsApplications(land);
  assertApplicationTypeCompatible(land, application.applicationType);

  application.status = 'submitted';
  application.submittedAt = new Date();
  await application.save();
  await notify(application.ownerId, 'application-submitted', 'Application submitted', `${application.proposal.title} was submitted.`, application);
  return application;
}

export async function getMyApplications(query: ApplicationFilterInput, user: AuthenticatedUser) {
  const filter: FilterQuery<ApplicationDocument> =
    user.role === 'admin' ? {} : { applicantId: user.id };
  addApplicationFilters(filter, query);
  return listApplications(filter, query);
}

export async function getReceivedApplications(query: ApplicationFilterInput, user: AuthenticatedUser) {
  if (!['owner', 'admin'].includes(user.role)) throw new AppError('Not authorized.', 403);
  const filter: FilterQuery<ApplicationDocument> = user.role === 'admin' ? {} : { ownerId: user.id };
  addApplicationFilters(filter, query);
  return listApplications(filter, query);
}

export async function getApplicationDetails(id: string, user: AuthenticatedUser) {
  const application = await getApplicationForAccess(id, user);
  const [negotiations, agreement] = await Promise.all([
    ApplicationNegotiationModel.find({ applicationId: application._id }).sort({ round: 1 }).lean(),
    application.agreement?.agreementId ? AgreementModel.findById(application.agreement.agreementId).lean() : null,
  ]);

  return {
    application,
    negotiations,
    agreement,
    allowedActions: getAllowedApplicationActions(application, user),
  };
}

export async function updateDraftApplication(id: string, input: UpdateApplicationInput, user: AuthenticatedUser) {
  const application = await getApplicationForAccess(id, user);
  const actorRole = getApplicationActorRole(application, user);
  if (!['applicant', 'admin'].includes(actorRole)) throw new AppError('Not authorized.', 403);
  if (!['draft', 'changes-requested'].includes(application.status)) {
    throw new AppError('Only drafts or change-requested applications can be edited.', 400);
  }

  if (input.applicantProfile) application.applicantProfile = { ...application.applicantProfile, ...input.applicantProfile };
  if (input.proposal) application.proposal = { ...application.proposal, ...input.proposal };
  if (input.coverMessage !== undefined) application.coverMessage = input.coverMessage;
  if (input.documents) application.documents = input.documents;
  await application.save();
  return application;
}

export async function withdrawApplication(id: string, user: AuthenticatedUser) {
  const application = await getApplicationForAccess(id, user);
  if (getApplicationActorRole(application, user) !== 'applicant') throw new AppError('Not authorized.', 403);
  assertTransition(application, 'withdrawn');
  application.status = 'withdrawn';
  application.withdrawnAt = new Date();
  await application.save();
  await notify(application.ownerId, 'application-withdrawn', 'Application withdrawn', `${application.proposal.title} was withdrawn.`, application);
  return application;
}

export async function beginReview(id: string, user: AuthenticatedUser) {
  const application = await ownerActionApplication(id, user, 'under-review');
  application.review.reviewedBy = user.id as never;
  application.review.reviewedAt = new Date();
  await application.save();
  await notify(application.applicantId, 'application-under-review', 'Application under review', 'The owner started reviewing your application.', application);
  return application;
}

export async function shortlistApplication(id: string, user: AuthenticatedUser) {
  const application = await ownerActionApplication(id, user, 'shortlisted');
  await notify(application.applicantId, 'application-shortlisted', 'Application shortlisted', 'Your application was shortlisted.', application);
  return application;
}

export async function requestApplicationChanges(id: string, message: string, user: AuthenticatedUser) {
  const application = await ownerActionApplication(id, user, 'changes-requested');
  application.review.changeRequestMessage = message;
  const round = application.negotiation.currentRound + 1;
  await ApplicationNegotiationModel.create({
    applicationId: application._id,
    round,
    createdBy: user.id,
    createdByRole: user.role === 'admin' ? 'admin' : 'owner',
    message,
    proposedTerms: application.negotiation.agreedTerms ?? proposalToTerms(application),
    action: 'changes-requested',
  });
  application.negotiation.currentRound = round;
  application.negotiation.lastActionBy = user.id as never;
  application.negotiation.lastActionAt = new Date();
  await application.save();
  await notify(application.applicantId, 'application-changes-requested', 'Changes requested', message, application);
  return application;
}

export async function rejectApplication(id: string, reason: string, user: AuthenticatedUser) {
  const application = await ownerActionApplication(id, user, 'rejected');
  application.review.rejectionReason = reason;
  application.rejectedAt = new Date();
  await application.save();
  await notify(application.applicantId, 'application-rejected', 'Application rejected', reason, application);
  return application;
}

export async function negotiateApplication(id: string, input: NegotiationInput, user: AuthenticatedUser) {
  const application = await getApplicationForAccess(id, user);
  const actorRole = getApplicationActorRole(application, user);
  if (!['applicant', 'owner', 'admin'].includes(actorRole)) throw new AppError('Not authorized.', 403);
  validateTerms(input.proposedTerms, application.applicationType);

  const round = application.negotiation.currentRound + 1;
  await ApplicationNegotiationModel.create({
    applicationId: application._id,
    round,
    createdBy: user.id,
    createdByRole: actorRole === 'none' ? 'admin' : actorRole,
    message: input.message,
    proposedTerms: input.proposedTerms,
    action: 'counter-offer',
  });

  application.negotiation.currentRound = round;
  application.negotiation.lastActionBy = user.id as never;
  application.negotiation.lastActionAt = new Date();
  await application.save();
  await notifyOtherParty(application, user, 'counter-offer-received', 'Counter-offer received', input.message ?? 'A counter-offer was submitted.');
  return application;
}

export async function acceptNegotiatedTerms(id: string, user: AuthenticatedUser) {
  const application = await getApplicationForAccess(id, user);
  const actorRole = getApplicationActorRole(application, user);
  if (!['applicant', 'owner', 'admin'].includes(actorRole)) throw new AppError('Not authorized.', 403);
  if (!application.negotiation.lastActionBy) throw new AppError('No terms are available to accept.', 400);
  if (application.negotiation.lastActionBy.toString() === user.id && user.role !== 'admin') {
    throw new AppError('You cannot accept your own latest offer.', 400);
  }

  const latest = await ApplicationNegotiationModel.findOne({ applicationId: application._id }).sort({ round: -1 });
  if (!latest) throw new AppError('No negotiation history found.', 400);
  application.negotiation.agreedTerms = latest.proposedTerms;
  const round = application.negotiation.currentRound + 1;
  await ApplicationNegotiationModel.create({
    applicationId: application._id,
    round,
    createdBy: user.id,
    createdByRole: actorRole === 'none' ? 'admin' : actorRole,
    proposedTerms: latest.proposedTerms,
    action: 'terms-accepted',
  });
  application.negotiation.currentRound = round;
  application.negotiation.lastActionBy = user.id as never;
  application.negotiation.lastActionAt = new Date();
  await application.save();
  await notifyBoth(application, 'terms-accepted', 'Negotiated terms accepted', 'Negotiated terms were accepted.');
  return application;
}

export async function acceptApplication(id: string, user: AuthenticatedUser) {
  const application = await getApplicationForAccess(id, user);
  const actorRole = getApplicationActorRole(application, user);
  if (!['owner', 'admin'].includes(actorRole)) throw new AppError('Not authorized.', 403);
  if (!['shortlisted', 'submitted', 'under-review'].includes(application.status) && !application.negotiation.agreedTerms) {
    throw new AppError('Application must be shortlisted or have accepted negotiated terms.', 400);
  }

  const acceptedExisting = await ApplicationModel.exists({
    landId: documentId(application.landId),
    status: { $in: ['accepted', 'agreement-pending', 'agreement-ready', 'completed'] },
    _id: { $ne: application._id },
  });
  if (acceptedExisting) throw new AppError('This land already has an accepted active application.', 409);

  async function applyAcceptance() {
    application.status = 'agreement-pending';
    application.acceptedAt = new Date();
    await application.save();
    await ApplicationModel.updateMany(
      {
        landId: documentId(application.landId),
        _id: { $ne: application._id },
        status: { $in: [...ACTIVE_APPLICATION_STATUSES_EXTENDED] },
      },
      { $set: { status: 'rejected', rejectedAt: new Date(), 'review.rejectionReason': 'Another application was accepted.' } },
    );
    await LandModel.updateOne({ _id: documentId(application.landId) }, { $set: { status: 'reserved' } });
    return generateAgreement(application, user.role === 'admin' ? 'admin' : 'system');
  }

  let agreement: AgreementDocument;
  const session = await mongoose.startSession();
  try {
    if (mongoose.connection.readyState === 1) {
      await session.withTransaction(async () => {
        agreement = await applyAcceptance();
      });
    } else {
      agreement = await applyAcceptance();
    }
  } catch {
    agreement = await applyAcceptance();
  } finally {
    await session.endSession();
  }

  await notifyBoth(application, 'application-accepted', 'Application accepted', 'The application was accepted and an agreement draft was generated.', agreement!._id.toString());
  return { application, agreement: agreement! };
}

export async function cancelApplication(id: string, reason: string, user: AuthenticatedUser) {
  const application = await getApplicationForAccess(id, user);
  const actorRole = getApplicationActorRole(application, user);
  if (!['applicant', 'owner', 'admin'].includes(actorRole)) throw new AppError('Not authorized.', 403);
  if (application.status === 'completed') throw new AppError('Completed applications cannot be cancelled.', 400);
  application.status = 'cancelled';
  application.review.ownerNotes = reason;
  await application.save();
  if (application.agreement?.agreementId) {
    await AgreementModel.updateOne({ _id: application.agreement.agreementId }, { $set: { status: 'cancelled' } });
  }
  await LandModel.updateOne({ _id: documentId(application.landId), status: 'reserved' }, { $set: { status: 'available' } });
  await notifyBoth(application, 'application-cancelled', 'Application cancelled', reason);
  return application;
}

export async function getApplicationStatistics(user: AuthenticatedUser) {
  const applicantFilter = user.role === 'admin' ? {} : { applicantId: user.id };
  const ownerFilter = user.role === 'admin' ? {} : { ownerId: user.id };
  const [applicantApps, ownerApps] = await Promise.all([
    ApplicationModel.find(applicantFilter).select('status landId').lean(),
    ['owner', 'admin'].includes(user.role) ? ApplicationModel.find(ownerFilter).select('status landId').lean() : Promise.resolve([]),
  ]);
  const count = (items: { status: string }[], status: string) => items.filter((item) => item.status === status).length;
  return {
    total: applicantApps.length,
    draft: count(applicantApps, 'draft'),
    submitted: count(applicantApps, 'submitted'),
    underReview: count(applicantApps, 'under-review'),
    shortlisted: count(applicantApps, 'shortlisted'),
    accepted: applicantApps.filter((item) => ['accepted', 'agreement-pending', 'agreement-ready'].includes(item.status)).length,
    rejected: count(applicantApps, 'rejected'),
    withdrawn: count(applicantApps, 'withdrawn'),
    totalReceived: ownerApps.length,
    newApplications: count(ownerApps, 'submitted'),
    applicationsByLand: ownerApps.reduce<Record<string, number>>((acc, item) => {
      const key = documentId(item.landId);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

export async function uploadApplicationFiles(files: Express.Multer.File[]) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const uploads = [];
  for (const file of files) {
    if (!allowed.includes(file.mimetype)) throw new AppError('Unsupported file type.', 400);
    if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: 'hopit/applications/documents',
        resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      });
      uploads.push({ url: uploaded.secure_url, name: file.originalname, mimeType: file.mimetype, size: file.size });
    } else {
      const folder = localUploadRoot;
      await fs.mkdir(folder, { recursive: true });
      const extension = extensionFromMime(file.mimetype);
      const filename = `${Date.now()}-${safeName(file.originalname)}.${extension}`;
      await fs.writeFile(path.join(folder, filename), file.buffer);
      uploads.push({ url: `/uploads/applications/${filename}`, name: file.originalname, mimeType: file.mimetype, size: file.size });
    }
  }
  return uploads;
}

async function listApplications(filter: FilterQuery<ApplicationDocument>, query: ApplicationFilterInput) {
  const skip = (query.page - 1) * query.limit;
  const sort = query.sort === 'oldest' ? { createdAt: 1 as const } : { createdAt: -1 as const };
  const [applications, total] = await Promise.all([
    ApplicationModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate({ path: 'landId', select: 'title slug location area media status transactionTypes purposes' })
      .populate({ path: 'ownerId', select: 'name avatar location.city isEmailVerified' })
      .populate({ path: 'applicantId', select: 'name avatar role location.city isEmailVerified' })
      .lean(),
    ApplicationModel.countDocuments(filter),
  ]);
  return {
    applications,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) || 1 },
  };
}

function addApplicationFilters(filter: FilterQuery<ApplicationDocument>, query: ApplicationFilterInput): void {
  if (query.status) filter.status = query.status;
  if (query.applicationType) filter.applicationType = query.applicationType;
  if (query.landId) filter.landId = query.landId;
  if (query.search) filter['proposal.title'] = new RegExp(escapeRegex(query.search), 'i');
}

async function getApplicationForAccess(id: string, user: AuthenticatedUser) {
  const application = await ApplicationModel.findById(id)
    .populate({ path: 'landId', select: 'title slug location area media status transactionTypes purposes ownerId' })
    .populate({ path: 'ownerId', select: 'name avatar location.city isEmailVerified' })
    .populate({ path: 'applicantId', select: 'name avatar role location.city isEmailVerified' });
  if (!application) throw new AppError('Application not found.', 404);
  if (getApplicationActorRole(application, user) === 'none') throw new AppError('Application not found.', 404);
  return application;
}

async function findApplicationLand(landId: string) {
  const land = await LandModel.findById(landId);
  if (!land) throw new AppError('Land listing not found.', 404);
  return land;
}

function assertApplicantRole(role: string): void {
  if (!['farmer', 'worker', 'owner', 'admin'].includes(role)) throw new AppError('Only authenticated Hopt It users can submit land proposals.', 403);
}

function assertLandAcceptsApplications(land: LandDocument): void {
  if (!['available', 'reserved'].includes(land.status)) {
    throw new AppError('This land is not accepting applications.', 400);
  }
}

function assertNotOwnLand(land: LandDocument, userId: string): void {
  if (land.ownerId.toString() === userId) throw new AppError('You cannot apply to your own land.', 400);
}

function assertApplicationTypeCompatible(land: LandDocument, applicationType: ApplicationType): void {
  if (applicationType === 'business-proposal') {
    if (!land.purposes.some((purpose) => (BUSINESS_PROPOSAL_PURPOSES as readonly string[]).includes(purpose))) {
      throw new AppError('Business proposals are not compatible with this land listing.', 400);
    }
    return;
  }
  const requiredTransaction = APPLICATION_TYPE_TRANSACTION_MAP[applicationType];
  if (!land.transactionTypes.includes(requiredTransaction)) {
    throw new AppError('Application type is not compatible with this land listing.', 400);
  }
}

async function assertNoActiveApplication(landId: string, applicantId: string): Promise<void> {
  const existing = await ApplicationModel.exists({
    landId,
    applicantId,
    status: { $in: [...ACTIVE_APPLICATION_STATUSES_EXTENDED] },
  });
  if (existing) throw new AppError('You already have an active application for this land.', 409);
}

function assertTransition(application: ApplicationDocument, nextStatus: ApplicationStatus): void {
  if (!canTransitionApplicationStatus(application.status, nextStatus)) {
    throw new AppError(`Cannot move application from ${application.status} to ${nextStatus}.`, 400);
  }
}

async function ownerActionApplication(id: string, user: AuthenticatedUser, nextStatus: ApplicationStatus) {
  const application = await getApplicationForAccess(id, user);
  const actorRole = getApplicationActorRole(application, user);
  if (!['owner', 'admin'].includes(actorRole)) throw new AppError('Not authorized.', 403);
  assertTransition(application, nextStatus);
  application.status = nextStatus;
  application.review.reviewedBy = user.id as never;
  application.review.reviewedAt = new Date();
  await application.save();
  return application;
}

function proposalToTerms(application: ApplicationDocument): NegotiationTerms {
  return {
    durationMonths: application.proposal.proposedDurationMonths,
    monthlyRent: application.proposal.proposedMonthlyRent,
    annualLeaseAmount: application.proposal.proposedAnnualLeaseAmount,
    purchasePrice: application.proposal.proposedPurchasePrice,
    securityDeposit: application.proposal.proposedSecurityDeposit,
    ownerRevenuePercentage: application.proposal.proposedOwnerRevenuePercentage,
    applicantRevenuePercentage: application.proposal.proposedApplicantRevenuePercentage,
    ownerParticipation: application.proposal.ownerParticipationRequested,
    startDate: application.proposal.expectedStartDate,
    additionalTerms: application.proposal.additionalRequirements,
  };
}

function validateTerms(terms: NegotiationTerms, applicationType: ApplicationType): void {
  if (
    terms.ownerRevenuePercentage !== undefined &&
    terms.applicantRevenuePercentage !== undefined &&
    terms.ownerRevenuePercentage + terms.applicantRevenuePercentage !== 100
  ) {
    throw new AppError('Revenue-share percentages must total 100.', 400);
  }
  if (applicationType === 'rent' && terms.monthlyRent === undefined) throw new AppError('Rent counter-offers require monthly rent.', 400);
  if (applicationType === 'lease' && terms.annualLeaseAmount === undefined) {
    throw new AppError('Lease counter-offers require annual lease amount.', 400);
  }
}

async function generateAgreement(application: ApplicationDocument, generatedBy: 'system' | 'admin') {
  const existing = await AgreementModel.findOne({ applicationId: application._id });
  if (existing) return existing;
  const land = await LandModel.findById(documentId(application.landId));
  if (!land) throw new AppError('Land listing not found.', 404);
  const terms = application.negotiation.agreedTerms ?? proposalToTerms(application);
  const agreementType = mapAgreementType(application.applicationType);
  const generatedSummary = buildAgreementSummary(land, application, terms);
  const agreement = await AgreementModel.create({
    applicationId: application._id,
      landId: documentId(application.landId),
      ownerId: documentId(application.ownerId),
      applicantId: documentId(application.applicantId),
    agreementType,
    status: 'review-pending',
    terms: {
      landTitle: land.title,
      landLocation: `${land.location.district}, ${land.location.state}`,
      landAreaValue: land.area.value,
      landAreaUnit: land.area.unit,
      purpose: application.proposal.intendedUse,
      durationMonths: terms.durationMonths,
      startDate: terms.startDate,
      endDate: terms.startDate && terms.durationMonths ? addMonths(terms.startDate, terms.durationMonths) : undefined,
      monthlyRent: terms.monthlyRent,
      annualLeaseAmount: terms.annualLeaseAmount,
      purchasePrice: terms.purchasePrice,
      securityDeposit: terms.securityDeposit,
      ownerRevenuePercentage: terms.ownerRevenuePercentage,
      applicantRevenuePercentage: terms.applicantRevenuePercentage,
      ownerParticipation: Boolean(terms.ownerParticipation),
      noticePeriodDays: terms.noticePeriodDays,
      ownerResponsibilities: application.proposal.requestedOwnerResponsibilities ?? [],
      applicantResponsibilities: application.proposal.applicantResponsibilities ?? [],
      additionalTerms: terms.additionalTerms ?? [],
    },
    generatedSummary,
    versionHistory: [{ version: 1, terms, generatedSummary, generatedAt: new Date() }],
    generatedBy,
    legalDisclaimer: LEGAL_DISCLAIMER,
  });
  application.agreement = { agreementId: agreement._id as never, summaryGenerated: true, generatedAt: new Date() };
  application.status = 'agreement-pending';
  await application.save();
  return agreement;
}

function mapAgreementType(type: ApplicationType) {
  const map = {
    lease: 'lease',
    rent: 'rent',
    'sale-enquiry': 'sale',
    'joint-venture': 'joint-venture',
    'revenue-share': 'revenue-share',
    'business-proposal': 'business-use',
  } as const;
  return map[type];
}

function buildAgreementSummary(land: LandDocument, application: ApplicationDocument, terms: NegotiationTerms): string {
  return `Draft summary for ${land.title}: ${application.proposal.intendedUse}. Terms include duration ${terms.durationMonths ?? 'to be finalized'} months, rent ${terms.monthlyRent ?? 'not applicable'}, annual lease ${terms.annualLeaseAmount ?? 'not applicable'}, purchase price ${terms.purchasePrice ?? 'not applicable'}, and owner participation ${terms.ownerParticipation ? 'requested' : 'not requested'}. ${LEGAL_DISCLAIMER}`;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

async function notify(userId: unknown, type: string, title: string, message: string, application: ApplicationDocument, agreementId?: string): Promise<void> {
  await NotificationModel.create({
    userId: documentId(userId),
    type,
    title,
    message,
    data: { applicationId: application._id, landId: documentId(application.landId), agreementId },
  });
}

async function notifyBoth(application: ApplicationDocument, type: string, title: string, message: string, agreementId?: string) {
  await Promise.all([
    notify(application.ownerId, type, title, message, application, agreementId),
    notify(application.applicantId, type, title, message, application, agreementId),
  ]);
}

async function notifyOtherParty(application: ApplicationDocument, user: AuthenticatedUser, type: string, title: string, message: string) {
  const recipient = documentId(application.applicantId) === user.id ? application.ownerId : application.applicantId;
  await notify(recipient, type, title, message, application);
}

function documentId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) return String((value as { _id: unknown })._id);
  return String(value);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extensionFromMime(mimeType: string): string {
  return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }[mimeType] ?? 'bin';
}

function safeName(value: string): string {
  return value.toLowerCase().replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}
