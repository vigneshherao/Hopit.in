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

export async function addReaction(payload) {
  const { data } = await apiClient.post('/chat/reactions', payload);
  return data.data;
}

export async function removeReaction(messageId) {
  const { data } = await apiClient.delete('/chat/reactions', { data: { messageId } });
  return data.data;
}

export async function getMentions(params = {}) {
  const { data } = await apiClient.get('/chat/mentions', { params });
  return data.data;
}

export async function getPinnedMessages(params = {}) {
  const { data } = await apiClient.get('/chat/pins', { params });
  return data.data;
}

export async function pinMessage(messageId) {
  const { data } = await apiClient.post('/chat/pins', { messageId });
  return data.data;
}

export async function unpinMessage(messageId) {
  const { data } = await apiClient.delete('/chat/pins', { data: { messageId } });
  return data.data;
}

export async function getStarredMessages(params = {}) {
  const { data } = await apiClient.get('/chat/starred', { params });
  return data.data;
}

export async function starMessage(messageId) {
  const { data } = await apiClient.post('/chat/starred', { messageId });
  return data.data;
}

export async function unstarMessage(messageId) {
  const { data } = await apiClient.delete('/chat/starred', { data: { messageId } });
  return data.data;
}

export async function getThread(params) {
  const { data } = await apiClient.get('/chat/threads', { params });
  return data.data;
}

export async function createThreadReply(payload) {
  const { data } = await apiClient.post('/chat/threads', payload);
  return data.data;
}

export async function getSharedNotes(params = {}) {
  const { data } = await apiClient.get('/chat/notes', { params });
  return data.data;
}

export async function createSharedNote(payload) {
  const { data } = await apiClient.post('/chat/notes', payload);
  return data.data;
}

export async function updateSharedNote({ noteId, payload }) {
  const { data } = await apiClient.patch(`/chat/notes/${noteId}`, payload);
  return data.data;
}

export async function deleteSharedNote(noteId) {
  const { data } = await apiClient.delete(`/chat/notes/${noteId}`);
  return data.data;
}

export async function getAnnouncements(params = {}) {
  const { data } = await apiClient.get('/chat/announcements', { params });
  return data.data;
}

export async function createAnnouncement(payload) {
  const { data } = await apiClient.post('/chat/announcements', payload);
  return data.data;
}

export async function updateAnnouncement({ announcementId, payload }) {
  const { data } = await apiClient.patch(`/chat/announcements/${announcementId}`, payload);
  return data.data;
}

export async function deleteAnnouncement(announcementId) {
  const { data } = await apiClient.delete(`/chat/announcements/${announcementId}`);
  return data.data;
}

export async function getBookmarks(params = {}) {
  const { data } = await apiClient.get('/chat/bookmarks', { params });
  return data.data;
}

export async function createBookmark(payload) {
  const { data } = await apiClient.post('/chat/bookmarks', payload);
  return data.data;
}

export async function deleteBookmark(payload) {
  const { data } = await apiClient.delete('/chat/bookmarks', { data: payload });
  return data.data;
}
