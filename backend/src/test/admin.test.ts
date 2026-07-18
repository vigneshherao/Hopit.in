import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@/app.js';
import { ADMIN_PERMISSIONS } from '@/constants/admin.constants.js';
import { AdminActionLogModel } from '@/models/admin-action-log.model.js';
import { AdminPermissionOverrideModel } from '@/models/admin-permission-override.model.js';
import { AdminProfileModel } from '@/models/admin-profile.model.js';
import { AdminRoleModel } from '@/models/admin-role.model.js';
import { UserStatusHistoryModel } from '@/models/user-status-history.model.js';
import { UserVerificationModel } from '@/models/user-verification.model.js';
import { UserModel } from '@/models/user.model.js';
import { signAccessToken } from '@/utils/token.js';

const app = createApp();
const strongPassword = 'HoptIt@123';

async function createUser(email: string, role: 'owner' | 'farmer' | 'worker' | 'admin' = 'farmer') {
  return UserModel.create({
    name: email.split('@')[0],
    email,
    password: strongPassword,
    role,
  });
}

function tokenFor(user: Awaited<ReturnType<typeof createUser>>) {
  return signAccessToken({ sub: user._id.toString(), email: user.email, role: user.role });
}

async function createAdmin(email = 'admin@example.com', permissions: string[] = Object.values(ADMIN_PERMISSIONS)) {
  const user = await createUser(email, 'admin');
  const role = await AdminRoleModel.create({
    name: 'Test Admin',
    slug: `test-admin-${user._id.toString().slice(-6)}`,
    permissions,
    isSystemRole: false,
    isActive: true,
  });
  const profile = await AdminProfileModel.create({
    userId: user._id,
    adminCode: `ADM-${user._id.toString().slice(-8)}`,
    displayName: user.name,
    roleIds: [role._id],
    status: 'active',
    activatedAt: new Date(),
  });
  return { user, role, profile, token: tokenFor(user) };
}

describe('admin foundation API', () => {
  it('rejects non-admin users from admin routes', async () => {
    const user = await createUser('farmer-admin-denied@example.com', 'farmer');

    const response = await request(app)
      .get('/api/v1/admin/me')
      .set('Authorization', `Bearer ${tokenFor(user)}`);

    expect(response.status).toBe(403);
  });

  it('returns the active admin profile and permissions', async () => {
    const admin = await createAdmin();

    const response = await request(app)
      .get('/api/v1/admin/me')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.profile.displayName).toBe(admin.user.name);
    expect(response.body.data.permissions).toContain(ADMIN_PERMISSIONS.USERS_VIEW);
  });

  it('applies explicit deny overrides after role permissions', async () => {
    const admin = await createAdmin('deny-admin@example.com');
    await AdminPermissionOverrideModel.create({
      adminProfileId: admin.profile._id,
      allow: [],
      deny: [ADMIN_PERMISSIONS.USERS_VIEW],
      reason: 'Test deny',
      createdBy: admin.user._id,
      updatedBy: admin.user._id,
    });

    const response = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(response.status).toBe(403);
  });

  it('lists users without private fields when private permission is missing', async () => {
    const admin = await createAdmin('readonly-admin@example.com', [ADMIN_PERMISSIONS.USERS_VIEW]);
    await createUser('visible-user@example.com', 'owner');

    const response = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.users[0].email).toBeUndefined();
  });

  it('suspends a user, records history, and writes an audit log', async () => {
    const admin = await createAdmin();
    const target = await createUser('status-target@example.com', 'worker');

    const response = await request(app)
      .post(`/api/v1/admin/users/${target._id}/suspend`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ reason: 'Repeated policy violations', duration: '7-days' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('suspended');
    await expect(UserStatusHistoryModel.countDocuments({ userId: target._id, newStatus: 'suspended' })).resolves.toBe(1);
    await expect(AdminActionLogModel.countDocuments({ action: 'user-suspended' })).resolves.toBe(1);
  });

  it('prevents admins from suspending themselves', async () => {
    const admin = await createAdmin('self-protect@example.com');

    const response = await request(app)
      .post(`/api/v1/admin/users/${admin.user._id}/suspend`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ reason: 'Should not be allowed', duration: '24-hours' });

    expect(response.status).toBe(400);
  });

  it('approves a verification request', async () => {
    const admin = await createAdmin();
    const target = await createUser('verify-target@example.com', 'owner');
    const verification = await UserVerificationModel.create({
      userId: target._id,
      verificationType: 'identity',
      status: 'pending',
      submittedDocuments: [{ documentType: 'identity-proof', submittedAt: new Date() }],
    });

    const response = await request(app)
      .post(`/api/v1/admin/verifications/${verification._id}/approve`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ reviewNotes: 'Identity proof looks valid.' });

    expect(response.status).toBe(200);
    expect(response.body.data.verification.status).toBe('approved');
  });
});
