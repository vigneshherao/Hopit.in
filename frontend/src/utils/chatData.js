import { ClipboardCheck, FileSignature, Headphones, MessageCircle, Sprout, UsersRound, UserRound, Wrench } from 'lucide-react';

export const conversationFilters = [
  { label: 'All', value: 'all' },
  { label: 'Direct', value: 'direct' },
  { label: 'Farm', value: 'farm-team' },
  { label: 'Agreements', value: 'agreement' },
  { label: 'Tasks', value: 'task' },
  { label: 'Support', value: 'admin-support' },
];

export const conversationTypeIcons = {
  direct: UserRound,
  'farm-team': Sprout,
  agreement: FileSignature,
  task: ClipboardCheck,
  worker: Wrench,
  manager: UsersRound,
  'admin-support': Headphones,
  'custom-group': MessageCircle,
};

export function chatTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function conversationTitle(conversation) {
  if (conversation?.title) return conversation.title;
  if (conversation?.type === 'direct') return 'Direct conversation';
  return 'Hopt It conversation';
}
