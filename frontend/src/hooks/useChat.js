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
