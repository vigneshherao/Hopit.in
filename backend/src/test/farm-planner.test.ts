import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '@/app.js';
import { AssistantConversationModel } from '@/models/assistant-conversation.model.js';
import { AssistantMessageModel } from '@/models/assistant-message.model.js';
import { DiseaseAnalysisModel } from '@/models/disease-analysis.model.js';
import { FarmCalendarEventModel } from '@/models/farm-calendar-event.model.js';
import { FarmTaskModel } from '@/models/farm-task.model.js';
import { LandModel } from '@/models/land.model.js';
import { UserModel } from '@/models/user.model.js';
import { WeatherAlertModel } from '@/models/weather-alert.model.js';
import { WeatherForecastModel } from '@/models/weather-forecast.model.js';
import { FarmBoundaryModel } from '@/models/farm-boundary.model.js';
import { RemoteSensingSceneModel } from '@/models/remote-sensing-scene.model.js';
import { MonitoringZoneModel } from '@/models/monitoring-zone.model.js';

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

function mockAssistantChatResponse() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                answer: 'Your farm is on track. Focus on overdue tasks, irrigation checks and harvest preparation.',
                healthScore: 78,
                suggestedActions: ['Review delayed tasks', 'Check irrigation tomorrow'],
                suggestedQuestions: ['Which tasks are delayed?', 'How many workers do I need?'],
                confidenceScore: 86,
              }),
            },
          },
        ],
      }),
    }),
  );
}

function mockDiseaseResponse() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'The image suggests possible early leaf spot, but the prediction is not guaranteed because lighting and image angle may affect visibility.',
                confidenceScore: 82,
                cropHealthScore: 68,
                severity: 'Medium',
                disease: 'Early leaf spot',
                symptoms: ['Small brown spots on leaves', 'Yellowing around lesions'],
                causes: ['High humidity', 'Leaf wetness'],
                organicTreatment: ['Remove affected leaves', 'Apply neem-based spray'],
                chemicalTreatment: ['Use a registered copper fungicide after local agronomist confirmation'],
                prevention: ['Improve airflow', 'Avoid overhead irrigation'],
                monitoringAdvice: ['Check new leaves every 3 days', 'Take another image after treatment'],
                estimatedRecoveryDays: 14,
                estimatedTreatmentCost: 1500,
                weatherRisk: 'Humid conditions may increase fungal pressure.',
                recommendations: [
                  { title: 'Start monitoring', description: 'Inspect the crop every 3 days and compare leaf spots.', priority: 'High', category: 'Monitoring', estimatedCost: 0 },
                  { title: 'Organic spray', description: 'Apply neem-based spray and remove highly affected leaves.', priority: 'Medium', category: 'Organic', estimatedCost: 600 },
                ],
              }),
            },
          },
        ],
      }),
    }),
  );
}

function pngBuffer() {
  return Buffer.from('89504e470d0a1a0a0000000d49484452000000800000008008020000004c5cf69c0000000049454e44ae426082', 'hex');
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
    const tasksResponse = await request(app).get(`/api/v1/farm-planner/plans/${planId}/tasks`).set('Authorization', `Bearer ${owner.token}`);
    expect(tasksResponse.status).toBe(200);
    expect(tasksResponse.body.data.tasks.length).toBeGreaterThan(10);
    expect(await FarmCalendarEventModel.countDocuments({ farmPlanId: planId })).toBe(tasksResponse.body.data.tasks.length);

    const harvest = await FarmTaskModel.findOne({ farmPlanId: planId, category: 'Harvesting' });
    expect(harvest).toBeTruthy();
    const blockedHarvest = await request(app).post(`/api/v1/farm-planner/tasks/${harvest?._id.toString()}/complete`).set('Authorization', `Bearer ${owner.token}`);
    expect(blockedHarvest.status).toBe(400);

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

  it('creates assistant insights, forecasts and chat for the owner only', async () => {
    mockFarmPlanResponse();
    const owner = await register('owner', 'assistant-owner@example.com');
    const other = await register('owner', 'assistant-other@example.com');
    const land = await createLand(owner.user?._id, 'assistant-land');
    const generated = await request(app).post('/api/v1/farm-planner/generate-plan').set('Authorization', `Bearer ${owner.token}`).send({ landId: land._id.toString(), selectedCrop: 'Tomato', selectedSeason: 'monsoon', startDate: new Date().toISOString() });
    const planId = generated.body.data.plan._id;

    const forbidden = await request(app).get(`/api/v1/assistant/insights/${planId}`).set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(404);

    const insights = await request(app).get(`/api/v1/assistant/insights/${planId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(insights.status).toBe(200);
    expect(insights.body.data.insights.length).toBeGreaterThan(0);
    expect(insights.body.data.health.score).toBeGreaterThanOrEqual(0);

    const forecast = await request(app).get(`/api/v1/assistant/forecast/${planId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(forecast.status).toBe(200);
    expect(forecast.body.data.forecasts.some((item: { forecastType: string }) => item.forecastType === 'Harvest')).toBe(true);

    mockAssistantChatResponse();
    const chat = await request(app).post('/api/v1/assistant/chat').set('Authorization', `Bearer ${owner.token}`).send({ farmPlanId: planId, message: 'How is my farm doing?' });
    expect(chat.status).toBe(201);
    expect(chat.body.data.response.answer).toContain('on track');
    expect(await AssistantConversationModel.countDocuments({ farmPlanId: planId })).toBe(1);
    expect(await AssistantMessageModel.countDocuments({ conversationId: chat.body.data.conversation._id })).toBe(2);
  });

  it('analyzes disease images, stores history, protects ownership and reuses cache', async () => {
    mockFarmPlanResponse();
    const owner = await register('owner', 'disease-owner@example.com');
    const other = await register('owner', 'disease-other@example.com');
    const land = await createLand(owner.user?._id, 'disease-land');
    const generated = await request(app).post('/api/v1/farm-planner/generate-plan').set('Authorization', `Bearer ${owner.token}`).send({ landId: land._id.toString(), selectedCrop: 'Tomato', selectedSeason: 'monsoon', startDate: new Date().toISOString() });
    const planId = generated.body.data.plan._id;

    const forbidden = await request(app)
      .post('/api/v1/disease/analyze')
      .set('Authorization', `Bearer ${other.token}`)
      .field('farmPlanId', planId)
      .field('cropName', 'Tomato')
      .attach('images', pngBuffer(), { filename: 'leaf.png', contentType: 'image/png' });
    expect(forbidden.status).toBe(404);

    mockDiseaseResponse();
    const first = await request(app)
      .post('/api/v1/disease/analyze')
      .set('Authorization', `Bearer ${owner.token}`)
      .field('farmPlanId', planId)
      .field('cropName', 'Tomato')
      .field('weatherSummary', 'Humid week')
      .attach('images', pngBuffer(), { filename: 'leaf.png', contentType: 'image/png' });

    expect(first.status).toBe(201);
    expect(first.body.data.analysis.diseaseName).toBe('Early leaf spot');
    expect(first.body.data.recommendations).toHaveLength(2);
    expect(await DiseaseAnalysisModel.countDocuments({ ownerId: owner.user?._id })).toBe(1);

    const second = await request(app)
      .post('/api/v1/disease/analyze')
      .set('Authorization', `Bearer ${owner.token}`)
      .field('farmPlanId', planId)
      .field('cropName', 'Tomato')
      .field('weatherSummary', 'Humid week')
      .attach('images', pngBuffer(), { filename: 'leaf.png', contentType: 'image/png' });
    expect(second.status).toBe(201);
    expect(second.body.data.cached).toBe(true);
    expect(await DiseaseAnalysisModel.countDocuments({ ownerId: owner.user?._id })).toBe(1);

    const history = await request(app).get(`/api/v1/disease/farm/${planId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(history.status).toBe(200);
    expect(history.body.data.analyses).toHaveLength(1);

    const stats = await request(app).get('/api/v1/disease/statistics').set('Authorization', `Bearer ${owner.token}`);
    expect(stats.status).toBe(200);
    expect(stats.body.data.totalAnalyses).toBe(1);
  });

  it('retrieves weather forecasts, creates predictions and protects farm ownership', async () => {
    mockFarmPlanResponse();
    const owner = await register('owner', 'weather-owner@example.com');
    const other = await register('owner', 'weather-other@example.com');
    const land = await createLand(owner.user?._id, 'weather-land');
    const generated = await request(app).post('/api/v1/farm-planner/generate-plan').set('Authorization', `Bearer ${owner.token}`).send({ landId: land._id.toString(), selectedCrop: 'Tomato', selectedSeason: 'monsoon', startDate: new Date().toISOString() });
    const planId = generated.body.data.plan._id;

    const forbidden = await request(app).get(`/api/v1/weather/current?farmPlanId=${planId}`).set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(404);

    const forecast = await request(app).get(`/api/v1/weather/forecast?farmPlanId=${planId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(forecast.status).toBe(200);
    expect(forecast.body.data.forecasts.length).toBeGreaterThanOrEqual(3);
    expect(await WeatherForecastModel.countDocuments({ farmPlanId: planId })).toBeGreaterThanOrEqual(3);

    const alerts = await request(app).get(`/api/v1/weather/alerts?farmPlanId=${planId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(alerts.status).toBe(200);
    expect(await WeatherAlertModel.countDocuments({ farmPlanId: planId })).toBe(alerts.body.data.alerts.length);

    const pests = await request(app).get(`/api/v1/weather/predictions/pests?farmPlanId=${planId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(pests.status).toBe(200);
    expect(pests.body.data.predictions.length).toBeGreaterThan(0);

    const water = await request(app).get(`/api/v1/weather/predictions/water?farmPlanId=${planId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(water.status).toBe(200);
    expect(water.body.data.water.waterNeededLitresPerDay).toBeGreaterThanOrEqual(0);

    const refreshed = await request(app).post('/api/v1/weather/refresh').set('Authorization', `Bearer ${owner.token}`).send({ farmPlanId: planId, force: true });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.cached).toBe(false);
  });

  it('runs remote monitoring demo scenes, dashboard, zones, tasks, observations and reports', async () => {
    mockFarmPlanResponse();
    const owner = await register('owner', 'monitoring-owner@example.com');
    const other = await register('owner', 'monitoring-other@example.com');
    const land = await createLand(owner.user?._id, 'monitoring-land');
    const generated = await request(app).post('/api/v1/farm-planner/generate-plan').set('Authorization', `Bearer ${owner.token}`).send({ landId: land._id.toString(), selectedCrop: 'Tomato', selectedSeason: 'monsoon', startDate: new Date().toISOString() });
    const planId = generated.body.data.plan._id;
    const polygon = { type: 'Polygon', coordinates: [[[77.5, 12.9], [77.6, 12.9], [77.6, 13.0], [77.5, 13.0], [77.5, 12.9]]] };

    const forbidden = await request(app).get(`/api/v1/remote-monitoring/plans/${planId}/dashboard`).set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(404);

    const boundary = await request(app).post(`/api/v1/remote-monitoring/plans/${planId}/boundary`).set('Authorization', `Bearer ${owner.token}`).send({ geometry: polygon, source: 'manual-draw' });
    expect(boundary.status).toBe(201);
    expect(boundary.body.data.boundary.calculatedArea).toBeGreaterThan(0);
    expect(await FarmBoundaryModel.countDocuments({ farmPlanId: planId, isActive: true })).toBe(1);

    const scenes = await request(app).post(`/api/v1/remote-monitoring/plans/${planId}/satellite/request`).set('Authorization', `Bearer ${owner.token}`).send({ dateRange: { startDate: new Date(Date.now() - 30 * 86400000).toISOString(), endDate: new Date().toISOString() }, maximumCloudCoverage: 80, analysisTypes: ['ndvi'] });
    expect(scenes.status).toBe(201);
    expect(scenes.body.data.isSimulated).toBe(true);
    expect(await RemoteSensingSceneModel.countDocuments({ farmPlanId: planId })).toBeGreaterThan(0);
    expect(await MonitoringZoneModel.countDocuments({ farmPlanId: planId })).toBeGreaterThan(0);

    const zones = await request(app).get(`/api/v1/remote-monitoring/plans/${planId}/zones`).set('Authorization', `Bearer ${owner.token}`);
    const zoneId = zones.body.data.zones[0]._id;
    const task = await request(app).post(`/api/v1/remote-monitoring/zones/${zoneId}/create-task`).set('Authorization', `Bearer ${owner.token}`).send({});
    expect(task.status).toBe(201);
    expect(task.body.data.task.category).toBe('Inspection');

    const observation = await request(app).post(`/api/v1/remote-monitoring/plans/${planId}/observations`).set('Authorization', `Bearer ${owner.token}`).send({ monitoringZoneId: zoneId, title: 'Zone inspection note', observedCondition: 'dry', severity: 'medium', imageUrls: [] });
    expect(observation.status).toBe(201);

    const dashboard = await request(app).get(`/api/v1/remote-monitoring/plans/${planId}/dashboard`).set('Authorization', `Bearer ${owner.token}`);
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.dataQuality.isSimulated).toBe(true);

    const report = await request(app).post(`/api/v1/remote-monitoring/plans/${planId}/reports`).set('Authorization', `Bearer ${owner.token}`).send({ reportType: 'weekly-monitoring' });
    expect(report.status).toBe(201);
  });
});
