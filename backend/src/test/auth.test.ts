import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@/app.js';
import { RefreshTokenModel } from '@/models/refresh-token.model.js';
import { UserModel } from '@/models/user.model.js';
import { signAccessToken } from '@/utils/token.js';

const app = createApp();
const strongPassword = 'HoptIt@123';

async function register(email = 'farmer@example.com', role = 'farmer') {
  return request(app).post('/api/v1/auth/register').send({
    name: 'Test User',
    email,
    phone: '+919876543210',
    role,
    password: strongPassword,
    confirmPassword: strongPassword,
  });
}

describe('auth routes', () => {
  it('registers a new user', async () => {
    const response = await register();

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('farmer@example.com');
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.data.accessToken).toBeTruthy();
  });

  it('rejects duplicate emails', async () => {
    await register();
    const response = await register();

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('logs in with valid credentials', async () => {
    await register();
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'farmer@example.com',
      password: strongPassword,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeTruthy();
  });

  it('rejects invalid login credentials', async () => {
    await register();
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'farmer@example.com',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password.');
  });

  it('returns the protected current user', async () => {
    const registered = await register();
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${registered.body.data.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('farmer@example.com');
  });

  it('rotates refresh tokens', async () => {
    const registered = await register();
    const cookie = registered.headers['set-cookie'];

    const response = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie).send({});

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeTruthy();
    const revokedCount = await RefreshTokenModel.countDocuments({ revokedAt: { $exists: true } });
    expect(revokedCount).toBe(1);
  });

  it('logs out by revoking the submitted refresh token', async () => {
    const registered = await register();
    const response = await request(app).post('/api/v1/auth/logout').set('Cookie', registered.headers['set-cookie']);

    expect(response.status).toBe(200);
    const revokedCount = await RefreshTokenModel.countDocuments({ revokedAt: { $exists: true } });
    expect(revokedCount).toBe(1);
  });

  it('rejects role authorization when role is not allowed', async () => {
    const user = await UserModel.create({
      name: 'Worker',
      email: 'worker@example.com',
      password: strongPassword,
      role: 'worker',
    });
    const token = signAccessToken({ sub: user._id.toString(), email: user.email, role: user.role });

    const response = await request(app)
      .get('/api/v1/auth/owner-check')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});
