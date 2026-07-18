import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@/app.js';
import { ADMIN_PERMISSIONS } from '@/constants/admin.constants.js';
import { AdminActionLogModel } from '@/models/admin-action-log.model.js';
import { AdminProfileModel } from '@/models/admin-profile.model.js';
import { AdminRoleModel } from '@/models/admin-role.model.js';
import { LandModerationModel } from '@/models/land-moderation.model.js';
import { LandModel } from '@/models/land.model.js';
import { ModerationDecisionModel } from '@/models/moderation-decision.model.js';
import { UserModel } from '@/models/user.model.js';
import { ensureLandModeration } from '@/services/marketplace-moderation.service.js';
import { signAccessToken } from '@/utils/token.js';

const app = createApp();
const password = 'HoptIt@123';

async function createUser(email: string, role: 'owner' | 'farmer' | 'worker' | 'admin' = 'owner') {
  return UserModel.create({ name: email.split('@')[0], email, password, role, isActive: true });
}

function tokenFor(user: Awaited<ReturnType<typeof createUser>>) {
  return signAccessToken({ sub: user._id.toString(), email: user.email, role: user.role });
}

async function createAdmin(email = 'moderator@example.com', permissions = Object.values(ADMIN_PERMISSIONS)) {
  const user = await createUser(email, 'admin');
  const role = await AdminRoleModel.create({ name: 'Moderation Admin', slug: `moderator-${user._id.toString().slice(-6)}`, permissions, isSystemRole: false, isActive: true });
  await AdminProfileModel.create({ userId: user._id, adminCode: `ADM-${user._id.toString().slice(-8)}`, displayName: user.name, roleIds: [role._id], status: 'active', activatedAt: new Date() });
  return { user, token: tokenFor(user) };
}

async function createModeratedLand(inputOwner?: Awaited<ReturnType<typeof createUser>>) {
  const owner = inputOwner ?? await createUser('moderation-owner@example.com', 'owner');
  const land = await LandModel.create({
    ownerId: owner._id,
    title: 'Moderation test land',
    slug: `moderation-test-land-${owner._id.toString().slice(-6)}`,
    description: 'A complete listing ready for moderation tests.',
    purposes: ['agriculture'],
    transactionTypes: ['lease'],
    location: { address: 'Canal road', city: 'Mandya', district: 'Mandya', state: 'Karnataka', country: 'India', coordinates: { type: 'Point', coordinates: [76.7047, 12.4237] } },
    area: { value: 5, unit: 'acre' },
    landDetails: { soilType: 'loamy', terrain: 'flat', irrigationAvailable: true, waterSources: ['canal'], waterAvailability: 'adequate', electricityAvailable: true, roadAccess: true, fencingAvailable: true, storageAvailable: false, farmHouseAvailable: false },
    pricing: { annualLeaseAmount: 300000, priceNegotiable: true },
    agreementTerms: { ownerParticipationAllowed: true },
    media: { images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'] },
    documents: [{ type: 'ownership-proof', name: 'Ownership proof', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', verificationStatus: 'pending', uploadedAt: new Date() }],
    status: 'pending-verification',
    verification: { isOwnerVerified: true, isLandVerified: false },
    viewCount: 0,
    favoriteCount: 0,
  });
  const moderation = await ensureLandModeration(land._id.toString(), owner._id.toString(), 'Test listing submitted.');
  return { owner, land, moderation };
}

describe('marketplace moderation API', () => {
  it('requires moderation permissions to view queue', async () => {
    const admin = await createAdmin('no-moderation@example.com', [ADMIN_PERMISSIONS.DASHBOARD_VIEW]);

    const response = await request(app).get('/api/v1/admin/moderation/queue').set('Authorization', `Bearer ${admin.token}`);

    expect(response.status).toBe(403);
  });

  it('lists pending moderation records', async () => {
    const admin = await createAdmin();
    await createModeratedLand();

    const response = await request(app).get('/api/v1/admin/moderation/queue?queue=pending').set('Authorization', `Bearer ${admin.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.queue).toHaveLength(1);
    expect(response.body.data.queue[0].status).toBe('pending-review');
  });

  it('supports self assignment', async () => {
    const admin = await createAdmin();
    const { moderation } = await createModeratedLand();

    const response = await request(app)
      .post('/api/v1/admin/moderation/assign')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ moderationId: moderation._id.toString(), method: 'self', reason: 'Taking this review.' });

    expect(response.status).toBe(200);
    expect(response.body.data.moderation.assignedModerator).toBe(admin.user._id.toString());
  });

  it('approves listing and writes decision plus audit log', async () => {
    const admin = await createAdmin();
    const { moderation, land } = await createModeratedLand();

    const response = await request(app)
      .post('/api/v1/admin/moderation/approve')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ moderationId: moderation._id.toString(), reason: 'Listing meets all marketplace requirements.' });

    expect(response.status).toBe(200);
    await expect(LandModel.findById(land._id).then((item) => item?.status)).resolves.toBe('available');
    await expect(ModerationDecisionModel.countDocuments({ moderationId: moderation._id, decision: 'approve' })).resolves.toBe(1);
    await expect(AdminActionLogModel.countDocuments({ action: 'moderation-approve' })).resolves.toBe(1);
  });

  it('requests revision and hides listing from public availability', async () => {
    const admin = await createAdmin();
    const { moderation, land } = await createModeratedLand();

    const response = await request(app)
      .post('/api/v1/admin/moderation/revision')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ moderationId: moderation._id.toString(), reason: 'Please upload clearer ownership documents.' });

    expect(response.status).toBe(200);
    await expect(LandModel.findById(land._id).then((item) => item?.status)).resolves.toBe('rejected');
    await expect(LandModerationModel.findById(moderation._id).then((item) => item?.status)).resolves.toBe('needs-revision');
  });
});
