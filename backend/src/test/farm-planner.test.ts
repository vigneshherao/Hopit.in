import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '@/app.js';
import { LandModel } from '@/models/land.model.js';
import { UserModel } from '@/models/user.model.js';

const app = createApp();
const password = 'HoptIt@123';

async function register(role: 'owner' | 'admin', email: string) {
  const response = await request(app).post('/api/v1/auth/register').send({
    name: `${role} user`,
    email,
    role: 'owner',
    password,
    confirmPassword: password,
  });
  if (role === 'admin') {
    await UserModel.updateOne({ email }, { $set: { role: 'admin' } });
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    const user = await UserModel.findOne({ email });
    return { token: login.body.data.accessToken as string, user };
  }
  const user = await UserModel.findOne({ email });
  return { token: response.body.data.accessToken as string, user };
}

async function createLand(ownerId: unknown, slug: string) {
  return LandModel.create({
    ownerId,
    title: 'Planner land',
    slug,
    description: 'A complete land record for farm planner tests.',
    purposes: ['agriculture'],
    transactionTypes: ['lease'],
    location: { address: 'Canal road', city: 'Mandya', district: 'Mandya', state: 'Karnataka', country: 'India' },
    area: { value: 4, unit: 'acre' },
    landDetails: {
      soilType: 'loamy',
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
    nearbyFacilities: { nearestMarketKm: 10 },
    pricing: { annualLeaseAmount: 250000, priceNegotiable: true },
    agreementTerms: { ownerParticipationAllowed: true },
    media: { images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'] },
    documents: [{ type: 'ownership-proof', name: 'Ownership proof', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }],
    status: 'available',
  });
}

function mockFarmPlanResponse(overrides = {}) {
  const payload = {
    planTitle: 'Tomato execution plan',
    description: 'A complete tomato farming execution plan for the selected Hopt It land.',
    farmDurationDays: 110,
    farmDurationMonths: 3.6,
    expectedHarvestDate: new Date(Date.now() + 110 * 86400000).toISOString(),
    currentStage: 'planning',
    landPreparation: ['Deep ploughing', 'Apply compost', 'Prepare raised beds'],
    seedRecommendation: { variety: 'Arka Rakshak', seedRate: '80 grams per acre', notes: ['Use certified seed'] },
    sowing: { method: 'Nursery transplanting', spacing: '60 x 45 cm', steps: ['Raise nursery', 'Transplant healthy seedlings'] },
    waterSchedule: [{ stage: 'After transplanting', frequency: 'Daily for first week', notes: 'Avoid waterlogging' }],
    fertilizerSchedule: [{ day: 10, item: 'Compost', quantity: '2 tons', purpose: 'Improve organic matter' }],
    pesticideSchedule: [{ stage: 'Vegetative', treatment: 'Neem spray', notes: 'Prevent sucking pests' }],
    harvestSchedule: { expectedWindow: '95 to 110 days', steps: ['Harvest ripe fruits'], postHarvest: ['Grade and pack'] },
    labourRequirement: { totalWorkers: 3, peakWorkers: 6, notes: ['Extra workers during harvest'] },
    equipmentRequirement: { items: ['Tractor', 'Sprayer'], estimatedCost: { minimum: 12000, maximum: 25000, currency: 'INR' } },
    fertilizerRequirement: { items: ['Compost', 'NPK'], estimatedCost: { minimum: 10000, maximum: 22000, currency: 'INR' } },
    waterRequirement: { level: 'medium', estimatedLitresPerDay: 2500, notes: ['Use drip irrigation'] },
    timeline: [
      { day: 0, stage: 'Preparation', activity: 'Plough field', expectedCost: 15000, progressWeight: 15 },
      { day: 10, stage: 'Nursery', activity: 'Raise seedlings', expectedCost: 8000, progressWeight: 10 },
      { day: 25, stage: 'Sowing', activity: 'Transplant seedlings', expectedCost: 12000, progressWeight: 15 },
      { day: 45, stage: 'Growth', activity: 'Fertilizer and irrigation', expectedCost: 18000, progressWeight: 20 },
      { day: 100, stage: 'Harvest', activity: 'Harvest and pack', expectedCost: 20000, progressWeight: 40 },
    ],
    riskAnalysis: { riskLevel: 'medium', riskScore: 46, risks: ['Price fluctuation', 'Pest attack'], mitigation: ['Use traps', 'Stagger harvest'] },
    weatherNotes: 'Monitor heavy rainfall and maintain drainage during monsoon.',
    estimatedInvestment: 80000,
    estimatedRevenue: 190000,
    estimatedProfit: 110000,
    expectedROI: 137.5,
    ...overrides,
  };
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
    }),
  );
}

describe('farm planner API', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('requires authentication', async () => {
    const response = await request(app).post('/api/v1/farm-planner/generate-plan').send({});
    expect(response.status).toBe(401);
  });

  it('generates, fetches, updates, dashboards, recalculates and deletes a farm plan', async () => {
    mockFarmPlanResponse();
    const owner = await register('owner', 'planner-owner@example.com');
    const land = await createLand(owner.user?._id, 'planner-land-one');

    const generated = await request(app)
      .post('/api/v1/farm-planner/generate-plan')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ landId: land._id.toString(), selectedCrop: 'Tomato', selectedSeason: 'monsoon', budget: 100000, startDate: new Date().toISOString() });

    expect(generated.status).toBe(201);
    expect(generated.body.data.plan.selectedCrop).toBe('Tomato');

    const planId = generated.body.data.plan._id;
    const dashboard = await request(app).get(`/api/v1/farm-planner/plans/${planId}/dashboard`).set('Authorization', `Bearer ${owner.token}`);
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.dashboard.profit).toBe(110000);

    const updated = await request(app).patch(`/api/v1/farm-planner/plans/${planId}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'active', progress: { percentage: 25 } });
    expect(updated.status).toBe(200);
    expect(updated.body.data.plan.progress.percentage).toBe(25);

    mockFarmPlanResponse({ estimatedInvestment: 90000, expectedROI: 120 });
    const recalculated = await request(app).post(`/api/v1/farm-planner/plans/${planId}/recalculate`).set('Authorization', `Bearer ${owner.token}`).send({ reason: 'Budget changed' });
    expect(recalculated.status).toBe(200);
    expect(recalculated.body.data.plan.versions.length).toBeGreaterThan(1);

    const deleted = await request(app).delete(`/api/v1/farm-planner/plans/${planId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(deleted.status).toBe(200);
  });

  it('blocks another owner from accessing a plan', async () => {
    mockFarmPlanResponse();
    const owner = await register('owner', 'planner-owner-a@example.com');
    const other = await register('owner', 'planner-owner-b@example.com');
    const land = await createLand(owner.user?._id, 'planner-land-two');
    const generated = await request(app).post('/api/v1/farm-planner/generate-plan').set('Authorization', `Bearer ${owner.token}`).send({ landId: land._id.toString(), selectedCrop: 'Tomato', selectedSeason: 'monsoon', startDate: new Date().toISOString() });
    const response = await request(app).get(`/api/v1/farm-planner/plans/${generated.body.data.plan._id}`).set('Authorization', `Bearer ${other.token}`);
    expect(response.status).toBe(404);
  });
});
