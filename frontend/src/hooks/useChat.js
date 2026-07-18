import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as chatService from '@/services/chatService.js';

export const chatKeys = {
  all: ['chat'],
  conversations: (filters = {}) => ['chat', 'conversations', filters],
  conversation: (id) => ['chat', 'conversation', id],
  messages: (conversationId, filters = {}) => ['chat', 'messages', conversationId, filters],
  members: (conversationId) => ['chat', 'members', conversationId],
  searchMessages: (filters = {}) => ['chat', 'search', 'messages', filters],
  blockedUsers: ['chat', 'blocked-users'],
  mentions: (filters = {}) => ['chat', 'mentions', filters],
  pins: (filters = {}) => ['chat', 'pins', filters],
  starred: (filters = {}) => ['chat', 'starred', filters],
  thread: (messageId) => ['chat', 'thread', messageId],
  notes: (filters = {}) => ['chat', 'notes', filters],
  announcements: (filters = {}) => ['chat', 'announcements', filters],
  bookmarks: (filters = {}) => ['chat', 'bookmarks', filters],
};

export function useConversations(filters = {}) {
  return useQuery({ queryKey: chatKeys.conversations(filters), queryFn: () => chatService.getConversations(filters), staleTime: 20_000 });
}

export function useConversation(id) {
  return useQuery({ queryKey: chatKeys.conversation(id), queryFn: () => chatService.getConversation(id), enabled: Boolean(id) });
}

export function useCreateDirectConversation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.createDirectConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useCreateGroupConversation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.createGroupConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.updateConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useArchiveConversation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.archiveConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useUnarchiveConversation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.unarchiveConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function usePinConversation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.pinConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useUnpinConversation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.unpinConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useMuteConversation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.muteConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useUnmuteConversation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.unmuteConversation, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useConversationMembers(conversationId) {
  return useQuery({ queryKey: chatKeys.members(conversationId), queryFn: () => chatService.getConversationMembers(conversationId), enabled: Boolean(conversationId) });
}

export function useAddConversationMembers() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.addConversationMembers, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useUpdateConversationMember() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.updateConversationMember, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useRemoveConversationMember() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.removeConversationMember, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useMessages(conversationId, filters = {}) {
  return useQuery({ queryKey: chatKeys.messages(conversationId, filters), queryFn: () => chatService.getMessages({ conversationId, params: filters }), enabled: Boolean(conversationId), staleTime: 10_000 });
}

export function useMessage(id) {
  return useQuery({ queryKey: ['chat', 'message', id], queryFn: () => chatService.getMessage(id), enabled: Boolean(id) });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.sendMessage, onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.conversationId] }) });
}

export function useEditMessage() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.editMessage, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.deleteMessage, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useForwardMessage() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.forwardMessage, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.markConversationRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useUploadChatAttachment() {
  return useMutation({ mutationFn: chatService.uploadChatAttachment });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.blockUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.blockedUsers }) });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.unblockUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.blockedUsers }) });
}

export function useBlockedUsers() {
  return useQuery({ queryKey: chatKeys.blockedUsers, queryFn: chatService.getBlockedUsers });
}

export function useSearchConversations(filters) {
  return useQuery({ queryKey: ['chat', 'search', 'conversations', filters], queryFn: () => chatService.searchConversations(filters), enabled: Boolean(filters?.q) });
}

export function useSearchMessages(filters) {
  return useQuery({ queryKey: chatKeys.searchMessages(filters), queryFn: () => chatService.searchMessages(filters), enabled: Boolean(filters?.q) });
}

export function useReactions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: chatKeys.all });
  return {
    addReaction: useMutation({ mutationFn: chatService.addReaction, onSuccess: invalidate }),
    removeReaction: useMutation({ mutationFn: chatService.removeReaction, onSuccess: invalidate }),
  };
}

export function useMentions(filters = {}) {
  return useQuery({ queryKey: chatKeys.mentions(filters), queryFn: () => chatService.getMentions(filters) });
}

export function usePinnedMessages(filters = {}) {
  return useQuery({ queryKey: chatKeys.pins(filters), queryFn: () => chatService.getPinnedMessages(filters), enabled: Boolean(filters?.conversationId) });
}

export function usePinMessage() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.pinMessage, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useUnpinMessage() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.unpinMessage, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useStarredMessages(filters = {}) {
  return useQuery({ queryKey: chatKeys.starred(filters), queryFn: () => chatService.getStarredMessages(filters) });
}

export function useStarMessage() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.starMessage, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useUnstarMessage() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.unstarMessage, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useThreads(messageId) {
  return useQuery({ queryKey: chatKeys.thread(messageId), queryFn: () => chatService.getThread({ messageId }), enabled: Boolean(messageId) });
}

export function useThreadReply() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.createThreadReply, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useSharedNotes(filters = {}) {
  return useQuery({ queryKey: chatKeys.notes(filters), queryFn: () => chatService.getSharedNotes(filters), enabled: Boolean(filters?.conversationId) });
}

export function useCreateSharedNote() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.createSharedNote, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useUpdateSharedNote() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.updateSharedNote, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useDeleteSharedNote() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.deleteSharedNote, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useAnnouncements(filters = {}) {
  return useQuery({ queryKey: chatKeys.announcements(filters), queryFn: () => chatService.getAnnouncements(filters), enabled: Boolean(filters?.conversationId) });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.createAnnouncement, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}

export function useBookmarks(filters = {}) {
  return useQuery({ queryKey: chatKeys.bookmarks(filters), queryFn: () => chatService.getBookmarks(filters) });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: chatService.createBookmark, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }) });
}
