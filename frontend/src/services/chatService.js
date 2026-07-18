import { apiClient } from '@/services/apiClient.js';

export async function getConversations(params = {}) {
  const { data } = await apiClient.get('/chat/conversations', { params });
  return data.data;
}

export async function getConversation(id) {
  const { data } = await apiClient.get(`/chat/conversations/${id}`);
  return data.data;
}

export async function createDirectConversation(payload) {
  const { data } = await apiClient.post('/chat/conversations/direct', payload);
  return data.data;
}

export async function createGroupConversation(payload) {
  const { data } = await apiClient.post('/chat/conversations/group', payload);
  return data.data;
}

export async function updateConversation({ id, payload }) {
  const { data } = await apiClient.patch(`/chat/conversations/${id}`, payload);
  return data.data;
}

export async function archiveConversation(id) {
  const { data } = await apiClient.post(`/chat/conversations/${id}/archive`);
  return data.data;
}

export async function unarchiveConversation(id) {
  const { data } = await apiClient.post(`/chat/conversations/${id}/unarchive`);
  return data.data;
}

export async function pinConversation(id) {
  const { data } = await apiClient.post(`/chat/conversations/${id}/pin`);
  return data.data;
}

export async function unpinConversation(id) {
  const { data } = await apiClient.post(`/chat/conversations/${id}/unpin`);
  return data.data;
}

export async function muteConversation({ id, duration }) {
  const { data } = await apiClient.post(`/chat/conversations/${id}/mute`, { duration });
  return data.data;
}

export async function unmuteConversation(id) {
  const { data } = await apiClient.post(`/chat/conversations/${id}/unmute`);
  return data.data;
}

export async function getConversationMembers(id) {
  const { data } = await apiClient.get(`/chat/conversations/${id}/members`);
  return data.data;
}

export async function addConversationMembers({ id, payload }) {
  const { data } = await apiClient.post(`/chat/conversations/${id}/members`, payload);
  return data.data;
}

export async function updateConversationMember({ id, userId, payload }) {
  const { data } = await apiClient.patch(`/chat/conversations/${id}/members/${userId}`, payload);
  return data.data;
}

export async function removeConversationMember({ id, userId }) {
  const { data } = await apiClient.delete(`/chat/conversations/${id}/members/${userId}`);
  return data.data;
}

export async function getMessages({ conversationId, params = {} }) {
  const { data } = await apiClient.get(`/chat/conversations/${conversationId}/messages`, { params });
  return data.data;
}

export async function getMessage(id) {
  const { data } = await apiClient.get(`/chat/messages/${id}`);
  return data.data;
}

export async function sendMessage({ conversationId, payload }) {
  const { data } = await apiClient.post(`/chat/conversations/${conversationId}/messages`, payload);
  return data.data;
}

export async function editMessage({ id, text }) {
  const { data } = await apiClient.patch(`/chat/messages/${id}`, { text });
  return data.data;
}

export async function deleteMessage({ id, scope = 'self' }) {
  const { data } = await apiClient.delete(`/chat/messages/${id}`, { data: { scope } });
  return data.data;
}

export async function forwardMessage({ id, conversationIds }) {
  const { data } = await apiClient.post(`/chat/messages/${id}/forward`, { conversationIds });
  return data.data;
}

export async function markConversationRead({ conversationId, lastReadMessageId }) {
  const { data } = await apiClient.post(`/chat/conversations/${conversationId}/read`, { lastReadMessageId });
  return data.data;
}

export async function uploadChatAttachment({ conversationId, files }) {
  const formData = new FormData();
  files.forEach((file) => formData.append('attachments', file));
  const { data } = await apiClient.post(`/chat/conversations/${conversationId}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data.data;
}

export async function blockUser({ userId, reason }) {
  const { data } = await apiClient.post(`/chat/users/${userId}/block`, { reason });
  return data.data;
}

export async function unblockUser(userId) {
  const { data } = await apiClient.post(`/chat/users/${userId}/unblock`);
  return data.data;
}

export async function getBlockedUsers() {
  const { data } = await apiClient.get('/chat/blocked-users');
  return data.data;
}

export async function searchConversations(params) {
  const { data } = await apiClient.get('/chat/search/conversations', { params });
  return data.data;
}

export async function searchMessages(params) {
  const { data } = await apiClient.get('/chat/search/messages', { params });
  return data.data;
}
