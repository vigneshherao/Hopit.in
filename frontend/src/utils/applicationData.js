export const applicationTypes = ['lease', 'rent', 'sale-enquiry', 'joint-venture', 'revenue-share', 'business-proposal'];
export const applicationStatuses = [
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
];

export const applicationTypeLabels = {
  lease: 'Lease',
  rent: 'Rent',
  'sale-enquiry': 'Sale Enquiry',
  'joint-venture': 'Joint Venture',
  'revenue-share': 'Revenue Share',
  'business-proposal': 'Business Proposal',
};

export const applicationStatusLabels = {
  draft: 'Draft',
  submitted: 'Submitted',
  'under-review': 'Under Review',
  shortlisted: 'Shortlisted',
  'changes-requested': 'Changes Requested',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
  cancelled: 'Cancelled',
  'agreement-pending': 'Agreement Pending',
  'agreement-ready': 'Agreement Ready',
  completed: 'Completed',
};

export const fundingSources = ['self-funded', 'loan', 'investor', 'partnership', 'other'];

export const agreementDisclaimer =
  'This is a platform-generated draft summary and is not legal advice or a legally executed agreement. Parties should consult a qualified legal professional and complete applicable registration, stamp-duty, and statutory requirements.';

export function compatibleApplicationTypes(land) {
  const types = [];
  if (land?.transactionTypes?.includes('lease')) types.push('lease');
  if (land?.transactionTypes?.includes('rent')) types.push('rent');
  if (land?.transactionTypes?.includes('sale')) types.push('sale-enquiry');
  if (land?.transactionTypes?.includes('joint-venture')) types.push('joint-venture');
  if (land?.transactionTypes?.includes('revenue-share')) types.push('revenue-share');
  if (
    land?.purposes?.some((purpose) =>
      ['commercial', 'agri-business', 'warehouse', 'solar-project', 'dairy', 'poultry', 'fish-farming', 'other'].includes(
        purpose,
      ),
    )
  ) {
    types.push('business-proposal');
  }
  return types;
}
