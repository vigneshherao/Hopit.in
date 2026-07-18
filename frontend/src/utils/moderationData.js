import { AlertTriangle, Archive, BadgeCheck, ClipboardCheck, EyeOff, Flag, History, Send, ShieldAlert, UserCheck, XCircle } from 'lucide-react';

export const moderationStatuses = [
  'pending-review',
  'under-verification',
  'needs-revision',
  'approved',
  'published',
  'rejected',
  'archived',
  'hidden',
  'removed',
  'escalated',
];

export const moderationChecklistLabels = {
  'owner-name': 'Owner name',
  location: 'Location',
  coordinates: 'Coordinates',
  'land-area': 'Land area',
  'survey-number': 'Survey number',
  'ownership-documents': 'Ownership documents',
  'crop-type': 'Crop type',
  photos: 'Photos',
  price: 'Price',
  description: 'Description',
  'water-availability': 'Water availability',
  electricity: 'Electricity',
  'road-access': 'Road access',
};

export const moderationActions = [
  { key: 'assign', label: 'Self assign', icon: UserCheck },
  { key: 'approve', label: 'Approve', icon: BadgeCheck },
  { key: 'revision', label: 'Request revision', icon: Send },
  { key: 'reject', label: 'Reject', icon: XCircle },
  { key: 'escalate', label: 'Escalate', icon: ShieldAlert },
  { key: 'hide', label: 'Hide', icon: EyeOff },
  { key: 'archive', label: 'Archive', icon: Archive },
  { key: 'flag', label: 'Flag', icon: Flag },
];

export const moderationQueueTabs = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'High Priority', value: 'high-priority' },
  { label: 'Escalated', value: 'escalated' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Revision', value: 'revision' },
  { label: 'Completed', value: 'completed' },
];

export const moderationTimelineIcons = {
  submitted: History,
  assigned: UserCheck,
  reviewed: ClipboardCheck,
  'revision-requested': Send,
  approved: BadgeCheck,
  published: BadgeCheck,
  rejected: XCircle,
  archived: Archive,
  hidden: EyeOff,
  removed: AlertTriangle,
  escalated: ShieldAlert,
};
