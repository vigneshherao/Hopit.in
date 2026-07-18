import { createServer, type Server } from 'node:http';
import request from 'supertest';
import { io as createClient, type Socket as ClientSocket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '@/app.js';
import { ActivityFeedModel } from '@/models/activity-feed.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import { UserPresenceModel } from '@/models/user-presence.model.js';
import { createActivity } from '@/services/activity/activity.service.js';
import { createNotification } from '@/services/notification/notification.service.js';
import { initSocketServer } from '@/socket/socketServer.js';

const app = createApp();
const password = 'HoptIt@123';

async function register(email: string, role = 'owner') {
  const response = await request(app).post('/api/v1/auth/register').send({
    name: 'Realtime User',
    email,
    role,
    password,
    confirmPassword: password,
  });
  return response.body.data;
}

function connectSocket(url: string, token?: string): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const client = createClient(url, {
      auth: token ? { token, device: 'test' } : {},
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    client.once('connect', () => resolve(client));
    client.once('connect_error', reject);
  });
}

describe('realtime notifications, activity and sockets', () => {
  let server: Server;
  let socketUrl = '';

  beforeAll(async () => {
    server = createServer(app);
    initSocketServer(server);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (address && typeof address === 'object') socketUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('creates, reads and deletes notifications', async () => {
    const session = await register('notify-owner@example.com');
    const created = await createNotification({
      receiverId: session.user.id,
      title: 'Task assigned',
      message: 'A new irrigation task is ready.',
      type: 'task',
      category: 'task',
      priority: 'high',
    });

    expect(created.title).toBe('Task assigned');
    expect(await NotificationModel.countDocuments({ receiverId: session.user.id })).toBe(1);

    const list = await request(app).get('/api/v1/notifications?status=unread').set('Authorization', `Bearer ${session.accessToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.unreadCount).toBe(1);

    const read = await request(app).patch(`/api/v1/notifications/${created.id}/read`).set('Authorization', `Bearer ${session.accessToken}`);
    expect(read.status).toBe(200);
    expect(read.body.data.notification.isRead).toBe(true);

    const deleted = await request(app).delete(`/api/v1/notifications/${created.id}`).set('Authorization', `Bearer ${session.accessToken}`);
    expect(deleted.status).toBe(200);
  });

  it('stores deduplicated activity and returns preferences and presence', async () => {
    const session = await register('activity-owner@example.com');
    await createActivity({
      userId: session.user.id,
      actorId: session.user.id,
      entityType: 'farm',
      action: 'created-task',
      title: 'Created irrigation task',
      description: 'Irrigation was scheduled for tomorrow.',
      visibility: 'private',
      dedupeKey: 'activity-owner-task-one',
    });
    await createActivity({
      userId: session.user.id,
      actorId: session.user.id,
      entityType: 'farm',
      action: 'created-task',
      title: 'Created irrigation task',
      visibility: 'private',
      dedupeKey: 'activity-owner-task-one',
    });

    expect(await ActivityFeedModel.countDocuments({ userId: session.user.id })).toBe(1);

    const activities = await request(app).get('/api/v1/activity?entityType=farm').set('Authorization', `Bearer ${session.accessToken}`);
    expect(activities.status).toBe(200);
    expect(activities.body.data.activities).toHaveLength(1);

    const preferences = await request(app).get('/api/v1/notifications/preferences').set('Authorization', `Bearer ${session.accessToken}`);
    expect(preferences.status).toBe(200);
    expect(preferences.body.data.preferences.inApp).toBe(true);

    const presence = await request(app).get(`/api/v1/presence/${session.user.id}`).set('Authorization', `Bearer ${session.accessToken}`);
    expect(presence.status).toBe(200);
  });

  it('authenticates sockets, tracks presence and rejects missing tokens', async () => {
    const session = await register('socket-owner@example.com');
    await expect(connectSocket(socketUrl)).rejects.toBeTruthy();

    const client = await connectSocket(socketUrl, session.accessToken);
    expect(client.connected).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 50));
    const presence = await UserPresenceModel.findOne({ userId: session.user.id }).lean();
    expect(presence?.status).toBe('online');

    client.disconnect();
  });
});
