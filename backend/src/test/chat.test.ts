import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@/app.js';
import { ConversationBlockModel } from '@/models/conversation-block.model.js';
import { ConversationMemberModel } from '@/models/conversation-member.model.js';
import { MessageModel } from '@/models/message.model.js';

const app = createApp();
const password = 'HoptIt@123';

async function register(email: string, role = 'owner') {
  const response = await request(app).post('/api/v1/auth/register').send({
    name: email.split('@')[0],
    email,
    role,
    password,
    confirmPassword: password,
  });
  return response.body.data;
}

describe('chat messaging API', () => {
  it('requires authentication for conversations', async () => {
    const response = await request(app).get('/api/v1/chat/conversations');
    expect(response.status).toBe(401);
  });

  it('creates direct conversations once and sends idempotent messages', async () => {
    const owner = await register('chat-owner@example.com');
    const farmer = await register('chat-farmer@example.com', 'farmer');

    const first = await request(app).post('/api/v1/chat/conversations/direct').set('Authorization', `Bearer ${owner.accessToken}`).send({ participantId: farmer.user.id });
    const second = await request(app).post('/api/v1/chat/conversations/direct').set('Authorization', `Bearer ${owner.accessToken}`).send({ participantId: farmer.user.id });
    expect(first.status).toBe(201);
    expect(second.body.data.conversation._id).toBe(first.body.data.conversation._id);

    const conversationId = first.body.data.conversation._id;
    expect(await ConversationMemberModel.countDocuments({ conversationId, status: 'active' })).toBe(2);

    const payload = { type: 'text', text: 'I will inspect the north field tomorrow.', clientMessageId: 'client-message-one' };
    const sent = await request(app).post(`/api/v1/chat/conversations/${conversationId}/messages`).set('Authorization', `Bearer ${owner.accessToken}`).send(payload);
    const duplicate = await request(app).post(`/api/v1/chat/conversations/${conversationId}/messages`).set('Authorization', `Bearer ${owner.accessToken}`).send(payload);
    expect(sent.status).toBe(201);
    expect(duplicate.body.data.message._id).toBe(sent.body.data.message._id);
    expect(await MessageModel.countDocuments({ conversationId })).toBe(1);

    const inbox = await request(app).get('/api/v1/chat/conversations?unreadOnly=true').set('Authorization', `Bearer ${farmer.accessToken}`);
    expect(inbox.status).toBe(200);
    expect(inbox.body.data.conversations[0].member.unreadCount).toBe(1);

    const read = await request(app).post(`/api/v1/chat/conversations/${conversationId}/read`).set('Authorization', `Bearer ${farmer.accessToken}`).send({ lastReadMessageId: sent.body.data.message._id });
    expect(read.status).toBe(200);
  });

  it('rejects empty messages, validates replies, edits and deletes text messages', async () => {
    const owner = await register('chat-edit-owner@example.com');
    const farmer = await register('chat-edit-farmer@example.com', 'farmer');
    const conversation = await request(app).post('/api/v1/chat/conversations/direct').set('Authorization', `Bearer ${owner.accessToken}`).send({ participantId: farmer.user.id });
    const conversationId = conversation.body.data.conversation._id;

    const empty = await request(app).post(`/api/v1/chat/conversations/${conversationId}/messages`).set('Authorization', `Bearer ${owner.accessToken}`).send({ type: 'text', text: '' });
    expect(empty.status).toBe(400);

    const badReply = await request(app).post(`/api/v1/chat/conversations/${conversationId}/messages`).set('Authorization', `Bearer ${owner.accessToken}`).send({ type: 'text', text: 'Reply', replyToMessageId: '64b2f5d254af58fd3bc30fff' });
    expect(badReply.status).toBe(400);

    const sent = await request(app).post(`/api/v1/chat/conversations/${conversationId}/messages`).set('Authorization', `Bearer ${owner.accessToken}`).send({ type: 'text', text: 'Original note' });
    const edited = await request(app).patch(`/api/v1/chat/messages/${sent.body.data.message._id}`).set('Authorization', `Bearer ${owner.accessToken}`).send({ text: 'Updated note' });
    expect(edited.status).toBe(200);
    expect(edited.body.data.message.editVersion).toBe(1);

    const deleted = await request(app).delete(`/api/v1/chat/messages/${sent.body.data.message._id}`).set('Authorization', `Bearer ${owner.accessToken}`).send({ scope: 'everyone' });
    expect(deleted.status).toBe(200);
    expect(deleted.body.data.message.isDeletedForEveryone).toBe(true);
  });

  it('blocks direct messages and protects attachment access', async () => {
    const owner = await register('chat-block-owner@example.com');
    const farmer = await register('chat-block-farmer@example.com', 'farmer');
    const outsider = await register('chat-outsider@example.com', 'worker');
    const conversation = await request(app).post('/api/v1/chat/conversations/direct').set('Authorization', `Bearer ${owner.accessToken}`).send({ participantId: farmer.user.id });
    const conversationId = conversation.body.data.conversation._id;

    const attachment = await request(app)
      .post(`/api/v1/chat/conversations/${conversationId}/attachments`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .attach('attachments', Buffer.from('hello'), { filename: 'farm-note.txt', contentType: 'text/plain' });
    expect(attachment.status).toBe(201);

    const forbiddenAttachment = await request(app).get(`/api/v1/chat/attachments/${attachment.body.data.attachments[0]._id}`).set('Authorization', `Bearer ${outsider.accessToken}`);
    expect(forbiddenAttachment.status).toBe(404);

    const block = await request(app).post(`/api/v1/chat/users/${farmer.user.id}/block`).set('Authorization', `Bearer ${owner.accessToken}`).send({ reason: 'No longer needed' });
    expect(block.status).toBe(201);
    expect(await ConversationBlockModel.countDocuments({ blockerId: owner.user.id, blockedUserId: farmer.user.id })).toBe(1);

    const blockedSend = await request(app).post(`/api/v1/chat/conversations/${conversationId}/messages`).set('Authorization', `Bearer ${farmer.accessToken}`).send({ type: 'text', text: 'Can you see this?' });
    expect(blockedSend.status).toBe(403);
  });

  it('creates groups, manages members, forwards messages and searches authorized messages', async () => {
    const owner = await register('chat-group-owner@example.com');
    const farmer = await register('chat-group-farmer@example.com', 'farmer');
    const worker = await register('chat-group-worker@example.com', 'worker');
    const group = await request(app).post('/api/v1/chat/conversations/group').set('Authorization', `Bearer ${owner.accessToken}`).send({ title: 'Field Operations Team', participantIds: [farmer.user.id, worker.user.id] });
    expect(group.status).toBe(201);
    const conversationId = group.body.data.conversation._id;

    const members = await request(app).get(`/api/v1/chat/conversations/${conversationId}/members`).set('Authorization', `Bearer ${owner.accessToken}`);
    expect(members.body.data.members.length).toBe(3);

    const updatedMember = await request(app)
      .patch(`/api/v1/chat/conversations/${conversationId}/members/${worker.user.id}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ role: 'worker', permissions: { canSendMessages: false } });
    expect(updatedMember.status).toBe(200);
    expect(updatedMember.body.data.member.role).toBe('worker');
    expect(updatedMember.body.data.member.permissions.canSendMessages).toBe(false);

    const blockedByPermission = await request(app).post(`/api/v1/chat/conversations/${conversationId}/messages`).set('Authorization', `Bearer ${worker.accessToken}`).send({ type: 'text', text: 'I should not be able to send this.' });
    expect(blockedByPermission.status).toBe(403);

    const sent = await request(app).post(`/api/v1/chat/conversations/${conversationId}/messages`).set('Authorization', `Bearer ${farmer.accessToken}`).send({ type: 'text', text: 'Irrigation line is ready.' });
    expect(sent.status).toBe(201);

    const direct = await request(app).post('/api/v1/chat/conversations/direct').set('Authorization', `Bearer ${owner.accessToken}`).send({ participantId: farmer.user.id });
    const forwarded = await request(app).post(`/api/v1/chat/messages/${sent.body.data.message._id}/forward`).set('Authorization', `Bearer ${farmer.accessToken}`).send({ conversationIds: [direct.body.data.conversation._id] });
    expect(forwarded.status).toBe(201);

    const search = await request(app).get('/api/v1/chat/search/messages?q=Irrigation').set('Authorization', `Bearer ${owner.accessToken}`);
    expect(search.status).toBe(200);
    expect(search.body.data.messages.length).toBeGreaterThan(0);
  });
});
