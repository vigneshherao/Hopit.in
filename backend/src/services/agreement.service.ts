import { AgreementModel } from '@/models/agreement.model.js';
import { ApplicationModel } from '@/models/application.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import type { AuthenticatedUser } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';

export async function getAgreement(id: string, user: AuthenticatedUser) {
  const agreement = await AgreementModel.findById(id)
    .populate({ path: 'landId', select: 'title slug location area media' })
    .populate({ path: 'ownerId', select: 'name avatar location.city isEmailVerified' })
    .populate({ path: 'applicantId', select: 'name avatar role location.city isEmailVerified' });
  if (!agreement) throw new AppError('Agreement not found.', 404);
  assertAgreementAccess(agreement, user);
  return agreement;
}

export async function regenerateAgreement(id: string, user: AuthenticatedUser) {
  const agreement = await getAgreement(id, user);
  if (user.role !== 'admin') throw new AppError('Only admins can regenerate agreement summaries right now.', 403);
  agreement.versionHistory.push({
    version: agreement.version,
    terms: agreement.terms,
    generatedSummary: agreement.generatedSummary,
    generatedAt: new Date(),
  });
  agreement.version += 1;
  agreement.generatedSummary = `${agreement.generatedSummary}\n\nVersion ${agreement.version} regenerated for review.`;
  await agreement.save();
  await notifyAgreementParties(agreement, 'agreement-regenerated', 'Agreement regenerated', 'The agreement draft summary was regenerated.');
  return agreement;
}

export async function requestAgreementChanges(id: string, message: string, user: AuthenticatedUser) {
  const agreement = await getAgreement(id, user);
  agreement.status = 'changes-requested';
  agreement.changeRequests.push({ requestedBy: user.id as never, message, requestedAt: new Date() });
  await agreement.save();
  await notifyAgreementParties(agreement, 'agreement-changes-requested', 'Agreement changes requested', message);
  return agreement;
}

export async function confirmAgreementForLegalReview(id: string, user: AuthenticatedUser) {
  const agreement = await getAgreement(id, user);
  const ownerId = getId(agreement.ownerId);
  const applicantId = getId(agreement.applicantId);
  if (user.role !== 'admin' && user.id !== ownerId && user.id !== applicantId) throw new AppError('Not authorized.', 403);
  if (user.id === ownerId || user.role === 'admin') agreement.confirmations.ownerConfirmedAt = new Date();
  if (user.id === applicantId || user.role === 'admin') agreement.confirmations.applicantConfirmedAt = new Date();
  if (agreement.confirmations.ownerConfirmedAt && agreement.confirmations.applicantConfirmedAt) {
    agreement.status = 'ready-for-legal-review';
    await ApplicationModel.updateOne({ _id: agreement.applicationId }, { $set: { status: 'agreement-ready' } });
  }
  await agreement.save();
  await notifyAgreementParties(agreement, 'agreement-ready-for-legal-review', 'Agreement confirmation updated', 'Agreement draft confirmation was updated.');
  return agreement;
}

function assertAgreementAccess(agreement: { ownerId: unknown; applicantId: unknown }, user: AuthenticatedUser): void {
  if (user.role === 'admin') return;
  if ([getId(agreement.ownerId), getId(agreement.applicantId)].includes(user.id)) return;
  throw new AppError('Agreement not found.', 404);
}

async function notifyAgreementParties(agreement: { ownerId: unknown; applicantId: unknown; _id: unknown; applicationId: unknown; landId: unknown }, type: string, title: string, message: string) {
  await NotificationModel.create([
    { userId: getId(agreement.ownerId), type, title, message, data: { agreementId: agreement._id, applicationId: agreement.applicationId, landId: agreement.landId } },
    { userId: getId(agreement.applicantId), type, title, message, data: { agreementId: agreement._id, applicationId: agreement.applicationId, landId: agreement.landId } },
  ]);
}

function getId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) return String((value as { _id: unknown })._id);
  return String(value);
}
