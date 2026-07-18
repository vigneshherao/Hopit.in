export const CONVERSATION_TYPES = ['direct', 'farm-team', 'agreement', 'task', 'worker', 'manager', 'admin-support', 'custom-group'] as const;
export const CONVERSATION_MEMBER_ROLES = ['owner', 'admin', 'member', 'manager', 'worker', 'viewer', 'support'] as const;
export const CONVERSATION_MEMBER_STATUSES = ['active', 'invited', 'left', 'removed', 'blocked'] as const;
export const MESSAGE_TYPES = ['text', 'image', 'document', 'voice', 'location', 'system', 'task-reference', 'agreement-reference', 'farm-reference'] as const;
export const MESSAGE_STATUSES = ['sending', 'sent', 'delivered', 'read', 'failed'] as const;
export const CHAT_ATTACHMENT_TYPES = ['image', 'document', 'voice', 'video-preview'] as const;
export const CHAT_ATTACHMENT_SCAN_STATUSES = ['pending', 'clean', 'rejected', 'failed'] as const;
export const CHAT_ATTACHMENT_PROCESSING_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;
export const CHAT_AUDIT_ACTIONS = ['conversation-created', 'member-added', 'member-updated', 'member-removed', 'member-left', 'message-edited', 'message-deleted', 'conversation-renamed', 'conversation-archived', 'conversation-unarchived', 'user-blocked', 'user-unblocked'] as const;
export const CHAT_NOTIFICATION_LEVELS = ['all', 'mentions', 'none'] as const;
export const CHAT_REACTIONS = ['👍', '❤️', '🔥', '👏', '🎉', '🙏', '🌱', '🚜', '🌾', '🐄'] as const;
export const ANNOUNCEMENT_PRIORITIES = ['normal', 'important', 'critical'] as const;

export const CHAT_SOCKET_EVENTS = {
  CONVERSATION_JOIN: 'chat:conversation:join',
  CONVERSATION_LEAVE: 'chat:conversation:leave',
  MESSAGE_SEND: 'chat:message:send',
  MESSAGE_DELIVERED: 'chat:message:delivered',
  MESSAGE_READ: 'chat:message:read',
  TYPING_START: 'chat:typing:start',
  TYPING_STOP: 'chat:typing:stop',
  PRESENCE_CONVERSATION: 'chat:presence:conversation',
  MESSAGE_EDIT: 'chat:message:edit',
  MESSAGE_DELETE: 'chat:message:delete',
  MESSAGE_REACT: 'message-react',
  MESSAGE_UNREACT: 'message-unreact',
  MESSAGE_STAR: 'message-star',
  MESSAGE_UNSTAR: 'message-unstar',
  MESSAGE_PIN: 'message-pin',
  MESSAGE_UNPIN: 'message-unpin',
  THREAD_OPEN: 'thread-open',
  THREAD_REPLY: 'thread-reply',
  NOTE_UPDATE: 'note-update',
  ANNOUNCEMENT_CREATE: 'announcement-create',
  CONVERSATION_NEW: 'chat:conversation:new',
  CONVERSATION_UPDATE: 'chat:conversation:update',
  CONVERSATION_REMOVED: 'chat:conversation:removed',
  MEMBER_ADDED: 'chat:member:added',
  MEMBER_REMOVED: 'chat:member:removed',
  MESSAGE_NEW: 'chat:message:new',
  MESSAGE_UPDATE: 'chat:message:update',
  MESSAGE_DELETED: 'chat:message:deleted',
  MESSAGE_READ_UPDATE: 'chat:message:read',
  UNREAD_UPDATE: 'chat:unread:update',
  REACTION_ADDED: 'reaction-added',
  REACTION_REMOVED: 'reaction-removed',
  MENTION_CREATED: 'mention-created',
  THREAD_UPDATED: 'thread-updated',
  MESSAGE_PINNED: 'message-pinned',
  MESSAGE_UNPINNED: 'message-unpinned',
  MESSAGE_STARRED: 'message-starred',
  MESSAGE_UNSTARRED: 'message-unstarred',
  ANNOUNCEMENT_CREATED: 'announcement-created',
  NOTE_UPDATED: 'note-updated',
  ERROR: 'chat:error',
} as const;

export const DEFAULT_CHAT_PERMISSIONS = {
  canSendMessages: true,
  canUploadFiles: true,
  canAddMembers: false,
  canRemoveMembers: false,
  canEditConversation: false,
  canViewHistory: true,
};
