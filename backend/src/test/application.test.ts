import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '@/app.js';
import { ApplicationModel } from '@/models/application.model.js';
import { LandModel } from '@/models/land.model.js';
import { UserModel } from '@/models/user.model.js';

const app = createApp();
const password = 'AgriLink@123';

async function register(role: 'owner' | 'farmer' | 'worker' | 'admin', email: string) {
  const publicRole = role === 'admin' ? 'owner' : role;
  const response = await request(app).post('/api/v1/auth/register').send({
    name: `${role} user`,
    email,
    role: publicRole,
    password,
    confirmPassword: password,
  });
  if (role === 'admin') {
    await UserModel.updateOne({ email }, { $set: { role: 'admin' } });
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    const user = await UserModel.findOne({ email });
    return { token: login.body.data.accessToken, user };
  }
  const user = await UserModel.findOne({ email });
  return { token: response.body.data.accessToken, user };
}

async function createLand(ownerId: unknown, overrides = {}) {
  return LandModel.create({
    ownerId,
    title: `Test lease land ${Math.random()}`,
    slug: `test-lease-land-${Math.random().toString(36).slice(2)}`,
    description: 'A complete available land listing for application workflow tests.',
    purposes: ['agriculture', 'agri-business'],
    transactionTypes: ['lease', 'rent', 'revenue-share', 'joint-venture'],
    location: {
      address: 'Canal road',
      city: 'Mandya',
      district: 'Mandya',
      state: 'Karnataka',
      country: 'India',
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
      monthlyRent: 30000,
      revenueShareOwnerPercentage: 40,
      revenueShareFarmerPercentage: 60,
      priceNegotiable: true,
    },
    agreementTerms: { ownerParticipationAllowed: true },
    media: { images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'] },
    documents: [
      {
        type: 'ownership-proof',
        name: 'Ownership document',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    ],
    status: 'available',
    verification: { isOwnerVerified: true, isLandVerified: true },
    ...overrides,
  });
}

function applicationPayload(landId: string, overrides = {}) {
  return {
    landId,
    applicationType: 'lease',
    applicantProfile: {
      occupation: 'Farmer',
      experienceYears: 6,
      currentLocation: 'Mandya',
    },
    proposal: {
      title: 'Vegetable cultivation proposal',
      summary: 'I want to lease this land for vegetable cultivation and local market supply.',
      intendedUse: 'Seasonal vegetable farming',
      proposedDurationMonths: 24,
      proposedAnnualLeaseAmount: 280000,
      proposedSecurityDeposit: 50000,
      ownerParticipationRequested: false,
      applicantResponsibilities: ['Cultivation', 'Labor management'],
    },
    coverMessage: 'Please review my proposal.',
    saveAsDraft: true,
    ...overrides,
  };
}

describe('application workflow', () => {
  it('allows a farmer to create and update a draft application', async () => {
    const owner = await register('owner', 'app-owner1@example.com');
    const farmer = await register('farmer', 'app-farmer1@example.com');
    const land = await createLand(owner.user?._id);
    const created = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${farmer.token}`)
      .send(applicationPayload(land._id.toString()));
    const updated = await request(app)
      .patch(`/api/v1/applications/${created.body.data.application._id}`)
      .set('Authorization', `Bearer ${farmer.token}`)
      .send({ proposal: { summary: 'Updated summary for a stronger vegetable plan.' } });

    expect(created.status).toBe(201);
    expect(created.body.data.application.status).toBe('draft');
    expect(updated.status).toBe(200);
  });

  it('blocks workers, own-land applications, unsupported types, and duplicate active applications', async () => {
    const owner = await register('owner', 'app-owner2@example.com');
    const farmer = await register('farmer', 'app-farmer2@example.com');
    const worker = await register('worker', 'app-worker2@example.com');
    const land = await createLand(owner.user?._id, { transactionTypes: ['lease'] });

    const workerAttempt = await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${worker.token}`).send(applicationPayload(land._id.toString()));
    const ownAttempt = await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${owner.token}`).send(applicationPayload(land._id.toString()));
    const unsupported = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${farmer.token}`)
      .send(applicationPayload(land._id.toString(), { applicationType: 'rent' }));
    const first = await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${farmer.token}`).send(applicationPayload(land._id.toString()));
    const duplicate = await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${farmer.token}`).send(applicationPayload(land._id.toString()));

    expect(workerAttempt.status).toBe(403);
    expect(ownAttempt.status).toBe(400);
    expect(unsupported.status).toBe(400);
    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(409);
  });

  it('submits, reviews, shortlists, requests changes, resubmits, withdraws, and rejects', async () => {
    const owner = await register('owner', 'app-owner3@example.com');
    const farmer = await register('farmer', 'app-farmer3@example.com');
    const land = await createLand(owner.user?._id);
    const created = await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${farmer.token}`).send(applicationPayload(land._id.toString()));
    const id = created.body.data.application._id;

    expect((await request(app).post(`/api/v1/applications/${id}/submit`).set('Authorization', `Bearer ${farmer.token}`)).status).toBe(200);
    expect((await request(app).post(`/api/v1/applications/${id}/review`).set('Authorization', `Bearer ${owner.token}`)).status).toBe(200);
    expect((await request(app).post(`/api/v1/applications/${id}/shortlist`).set('Authorization', `Bearer ${owner.token}`)).status).toBe(200);
    expect((await request(app).post(`/api/v1/applications/${id}/request-changes`).set('Authorization', `Bearer ${owner.token}`).send({ message: 'Please improve rent terms.' })).status).toBe(200);
    expect((await request(app).post(`/api/v1/applications/${id}/submit`).set('Authorization', `Bearer ${farmer.token}`)).status).toBe(200);
    expect((await request(app).post(`/api/v1/applications/${id}/withdraw`).set('Authorization', `Bearer ${farmer.token}`)).status).toBe(200);

    const second = await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${farmer.token}`).send(applicationPayload(land._id.toString(), { saveAsDraft: false }));
    expect((await request(app).post(`/api/v1/applications/${second.body.data.application._id}/reject`).set('Authorization', `Bearer ${owner.token}`).send({ reason: 'Selected a different applicant.' })).status).toBe(200);
  });

  it('creates negotiation history, prevents accepting own offer, accepts application, reserves land, closes others, generates agreement, and cancels', async () => {
    const owner = await register('owner', 'app-owner4@example.com');
    const farmer = await register('farmer', 'app-farmer4@example.com');
    const otherFarmer = await register('farmer', 'app-farmer5@example.com');
    const land = await createLand(owner.user?._id);
    const first = await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${farmer.token}`).send(applicationPayload(land._id.toString(), { saveAsDraft: false }));
    const second = await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${otherFarmer.token}`).send(applicationPayload(land._id.toString(), { saveAsDraft: false }));
    const id = first.body.data.application._id;

    const counter = await request(app)
      .post(`/api/v1/applications/${id}/negotiate`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ proposedTerms: { durationMonths: 24, annualLeaseAmount: 300000 } });
    const ownAccept = await request(app).post(`/api/v1/applications/${id}/accept-terms`).set('Authorization', `Bearer ${owner.token}`);
    const termsAccept = await request(app).post(`/api/v1/applications/${id}/accept-terms`).set('Authorization', `Bearer ${farmer.token}`);
    await request(app).post(`/api/v1/applications/${id}/shortlist`).set('Authorization', `Bearer ${owner.token}`);
    const accepted = await request(app).post(`/api/v1/applications/${id}/accept`).set('Authorization', `Bearer ${owner.token}`);
    const reloadedLand = await LandModel.findById(land._id);
    const otherApplication = await ApplicationModel.findById(second.body.data.application._id);
    const cancelled = await request(app).post(`/api/v1/applications/${id}/cancel`).set('Authorization', `Bearer ${owner.token}`).send({ reason: 'Parties paused the deal.' });

    expect(counter.status).toBe(200);
    expect(ownAccept.status).toBe(400);
    expect(termsAccept.status).toBe(200);
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.agreement._id).toBeTruthy();
    expect(reloadedLand?.status).toBe('reserved');
    expect(otherApplication?.status).toBe('rejected');
    expect(cancelled.status).toBe(200);
  });

  it('rejects invalid revenue shares and protects other owners from viewing applications', async () => {
    const owner = await register('owner', 'app-owner6@example.com');
    const otherOwner = await register('owner', 'app-owner7@example.com');
    const farmer = await register('farmer', 'app-farmer6@example.com');
    const land = await createLand(owner.user?._id);
    const badShare = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${farmer.token}`)
      .send(applicationPayload(land._id.toString(), {
        applicationType: 'revenue-share',
        proposal: {
          ...applicationPayload(land._id.toString()).proposal,
          proposedOwnerRevenuePercentage: 70,
          proposedApplicantRevenuePercentage: 20,
        },
      }));
    const created = await request(app).post('/api/v1/applications').set('Authorization', `Bearer ${farmer.token}`).send(applicationPayload(land._id.toString()));
    const forbidden = await request(app).get(`/api/v1/applications/${created.body.data.application._id}`).set('Authorization', `Bearer ${otherOwner.token}`);

    expect(badShare.status).toBe(400);
    expect(forbidden.status).toBe(404);
  });
});
