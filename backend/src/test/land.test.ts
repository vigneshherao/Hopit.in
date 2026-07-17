import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@/app.js';
import { LandModel } from '@/models/land.model.js';

const app = createApp();
const password = 'AgriLink@123';

async function register(role: 'owner' | 'farmer' | 'admin', email = `${role}@example.com`) {
  const response = await request(app).post('/api/v1/auth/register').send({
    name: `${role} user`,
    email,
    role: role === 'admin' ? 'owner' : role,
    password,
    confirmPassword: password,
  });

  if (role === 'admin') {
    await import('@/models/user.model.js').then(({ UserModel }) =>
      UserModel.updateOne({ email }, { $set: { role: 'admin' } }),
    );
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    return login.body.data.accessToken;
  }

  return response.body.data.accessToken;
}

function landPayload(overrides = {}) {
  return {
    title: 'Mandya organic farm land',
    description: 'A well connected irrigated farm parcel suitable for vegetables and seasonal crops.',
    purposes: ['agriculture', 'organic-farming'],
    transactionTypes: ['lease'],
    location: {
      address: 'Canal road',
      city: 'Mandya',
      district: 'Mandya',
      state: 'Karnataka',
      country: 'India',
      coordinates: { type: 'Point', coordinates: [76.7047, 12.4237] },
    },
    area: { value: 5, unit: 'acre' },
    landDetails: {
      soilType: 'alluvial',
      terrain: 'flat',
      irrigationAvailable: true,
      waterSources: ['canal'],
      waterAvailability: 'adequate',
      electricityAvailable: true,
      roadAccess: true,
      fencingAvailable: true,
      storageAvailable: false,
      farmHouseAvailable: false,
    },
    pricing: {
      annualLeaseAmount: 300000,
      priceNegotiable: true,
    },
    agreementTerms: {
      ownerParticipationAllowed: true,
    },
    media: {
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
    },
    documents: [
      {
        type: 'ownership-proof',
        name: 'Ownership document',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    ],
    status: 'draft',
    ...overrides,
  };
}

async function createAvailableLand(ownerToken: string, overrides = {}) {
  const created = await request(app)
    .post('/api/v1/lands')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send(landPayload({ status: 'pending-verification', ...overrides }));
  await LandModel.updateOne(
    { _id: created.body.data.land._id },
    { $set: { status: 'available', 'verification.isLandVerified': true } },
  );
  return created.body.data.land;
}

describe('land marketplace', () => {
  it('allows an owner to create a draft listing', async () => {
    const ownerToken = await register('owner', 'owner1@example.com');
    const response = await request(app)
      .post('/api/v1/lands')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(landPayload());

    expect(response.status).toBe(201);
    expect(response.body.data.land.status).toBe('draft');
    expect(response.body.data.land.slug).toContain('mandya-organic-farm-land');
  });

  it('blocks farmers from creating listings', async () => {
    const farmerToken = await register('farmer', 'farmer1@example.com');
    const response = await request(app)
      .post('/api/v1/lands')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send(landPayload());

    expect(response.status).toBe(403);
  });

  it('public browse returns only available listings and supports filters and pagination', async () => {
    const ownerToken = await register('owner', 'owner2@example.com');
    await createAvailableLand(ownerToken, { title: 'Mandya lease farm', purposes: ['agriculture'] });
    await request(app).post('/api/v1/lands').set('Authorization', `Bearer ${ownerToken}`).send(landPayload({ title: 'Private draft' }));

    const response = await request(app).get('/api/v1/lands?district=Mandya&transactionType=lease&purpose=agriculture&page=1&limit=1');

    expect(response.status).toBe(200);
    expect(response.body.data.lands).toHaveLength(1);
    expect(response.body.data.pagination.total).toBe(1);
  });

  it('lets an owner view their own draft but blocks public draft access', async () => {
    const ownerToken = await register('owner', 'owner3@example.com');
    const created = await request(app).post('/api/v1/lands').set('Authorization', `Bearer ${ownerToken}`).send(landPayload());

    const ownerView = await request(app)
      .get(`/api/v1/lands/${created.body.data.land._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    const publicView = await request(app).get(`/api/v1/lands/${created.body.data.land._id}`);

    expect(ownerView.status).toBe(200);
    expect(publicView.status).toBe(404);
  });

  it('prevents another owner from editing a listing', async () => {
    const ownerToken = await register('owner', 'owner4@example.com');
    const otherOwnerToken = await register('owner', 'owner5@example.com');
    const created = await request(app).post('/api/v1/lands').set('Authorization', `Bearer ${ownerToken}`).send(landPayload());

    const response = await request(app)
      .patch(`/api/v1/lands/${created.body.data.land._id}`)
      .set('Authorization', `Bearer ${otherOwnerToken}`)
      .send({ title: 'Bad edit' });

    expect(response.status).toBe(403);
  });

  it('allows owner updates and submit for verification while rejecting incomplete submissions', async () => {
    const ownerToken = await register('owner', 'owner6@example.com');
    const created = await request(app).post('/api/v1/lands').set('Authorization', `Bearer ${ownerToken}`).send(landPayload());
    const updated = await request(app)
      .patch(`/api/v1/lands/${created.body.data.land._id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Updated land title' });
    const submitted = await request(app)
      .post(`/api/v1/lands/${created.body.data.land._id}/submit-verification`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const incomplete = await request(app)
      .post('/api/v1/lands')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(landPayload({ status: 'pending-verification', media: { images: [] } }));

    expect(updated.status).toBe(200);
    expect(submitted.status).toBe(200);
    expect(incomplete.status).toBe(400);
  });

  it('allows admin approval and rejection', async () => {
    const ownerToken = await register('owner', 'owner7@example.com');
    const adminToken = await register('admin', 'admin-land@example.com');
    const created = await request(app)
      .post('/api/v1/lands')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(landPayload({ status: 'pending-verification' }));

    const approved = await request(app)
      .patch(`/api/v1/lands/${created.body.data.land._id}/verification`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'approve' });
    const rejected = await request(app)
      .patch(`/api/v1/lands/${created.body.data.land._id}/verification`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'reject', reason: 'Missing updated survey document' });

    expect(approved.status).toBe(200);
    expect(rejected.status).toBe(200);
  });

  it('supports slug lookup and soft delete', async () => {
    const ownerToken = await register('owner', 'owner8@example.com');
    const land = await createAvailableLand(ownerToken);
    const bySlug = await request(app).get(`/api/v1/lands/${land.slug}`);
    const deleted = await request(app)
      .delete(`/api/v1/lands/${land._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(bySlug.status).toBe(200);
    expect(deleted.status).toBe(200);
  });

  it('rejects invalid coordinates and invalid revenue share totals', async () => {
    const ownerToken = await register('owner', 'owner9@example.com');
    const badCoordinates = await request(app)
      .post('/api/v1/lands')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(landPayload({ location: { ...landPayload().location, coordinates: { type: 'Point', coordinates: [200, 95] } } }));
    const badRevenue = await request(app)
      .post('/api/v1/lands')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(
        landPayload({
          transactionTypes: ['revenue-share'],
          pricing: { revenueShareOwnerPercentage: 70, revenueShareFarmerPercentage: 20, priceNegotiable: true },
        }),
      );

    expect(badCoordinates.status).toBe(400);
    expect(badRevenue.status).toBe(400);
  });
});
