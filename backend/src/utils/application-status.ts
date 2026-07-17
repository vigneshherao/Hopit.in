import {
  APPLICATION_STATUS_TRANSITIONS,
  type ApplicationStatus,
} from '@/constants/application.constants.js';
import type { ApplicationDocument } from '@/models/application.model.js';
import type { AuthenticatedUser } from '@/types/http.js';

export function canTransitionApplicationStatus(currentStatus: ApplicationStatus, nextStatus: ApplicationStatus): boolean {
  return (APPLICATION_STATUS_TRANSITIONS[currentStatus] as readonly string[]).includes(nextStatus);
}

export function getAllowedApplicationActions(application: ApplicationDocument, currentUser?: AuthenticatedUser): string[] {
  if (!currentUser) return [];

  const role = getApplicationActorRole(application, currentUser);
  const actions = new Set<string>();

  if ((role === 'applicant' || role === 'admin') && ['draft', 'changes-requested'].includes(application.status)) {
    actions.add('edit');
    actions.add('submit');
  }
  if (role === 'applicant' && ['submitted', 'under-review', 'shortlisted', 'changes-requested'].includes(application.status)) {
    actions.add('withdraw');
  }
  if ((role === 'owner' || role === 'admin') && application.status === 'submitted') actions.add('review');
  if ((role === 'owner' || role === 'admin') && ['submitted', 'under-review'].includes(application.status)) {
    actions.add('shortlist');
  }
  if ((role === 'owner' || role === 'admin') && ['submitted', 'under-review', 'shortlisted'].includes(application.status)) {
    actions.add('request-changes');
    actions.add('reject');
  }
  if (['applicant', 'owner', 'admin'].includes(role) && ['submitted', 'under-review', 'shortlisted', 'changes-requested'].includes(application.status)) {
    actions.add('negotiate');
  }
  if (application.negotiation.lastActionBy && application.negotiation.lastActionBy.toString() !== currentUser.id) {
    actions.add('accept-terms');
  }
  if ((role === 'owner' || role === 'admin') && ['shortlisted', 'submitted', 'under-review'].includes(application.status)) {
    actions.add('accept-application');
  }
  if (['applicant', 'owner', 'admin'].includes(role) && ['accepted', 'agreement-pending', 'agreement-ready'].includes(application.status)) {
    actions.add('cancel');
  }
  if (application.agreement?.agreementId) actions.add('view-agreement');

  return [...actions];
}

export function getApplicationActorRole(application: ApplicationDocument, user: AuthenticatedUser): 'applicant' | 'owner' | 'admin' | 'none' {
  if (user.role === 'admin') return 'admin';
  if (getId(application.applicantId) === user.id) return 'applicant';
  if (getId(application.ownerId) === user.id) return 'owner';
  return 'none';
}

function getId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) return String((value as { _id: unknown })._id);
  return String(value);
}
