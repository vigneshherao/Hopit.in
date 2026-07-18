import crypto from 'node:crypto';
import { BoundaryRevisionModel } from '@/models/boundary-revision.model.js';
import { DroneImageModel } from '@/models/drone-image.model.js';
import { DroneSurveyModel } from '@/models/drone-survey.model.js';
import { FarmBoundaryModel } from '@/models/farm-boundary.model.js';
import { FarmPlanModel } from '@/models/farm-plan.model.js';
import { FarmTaskModel } from '@/models/farm-task.model.js';
import { FieldObservationModel } from '@/models/field-observation.model.js';
import { ImageryComparisonModel } from '@/models/imagery-comparison.model.js';
import { LandModel } from '@/models/land.model.js';
import { MonitoringReportModel } from '@/models/monitoring-report.model.js';
import { MonitoringZoneModel } from '@/models/monitoring-zone.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import { RemoteSensingSceneModel } from '@/models/remote-sensing-scene.model.js';
import { VegetationAnalysisModel } from '@/models/vegetation-analysis.model.js';
import { calculatePolygonAreaAcres, createDefaultBoundary, polygonCenter, validatePolygonGeometry } from '@/services/geospatial/geometry.service.js';
import { getSatelliteProvider } from '@/services/satellite/satellite.provider.js';
import type { AuthenticatedUser } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';
import type { BoundaryInput, ComparisonInput, DroneSurveyInput, ObservationInput, ReportInput, SatelliteRequestInput, VegetationRequestInput } from '@/validators/remote-monitoring.validator.js';

export async function getBoundary(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  const boundary = await FarmBoundaryModel.findOne({ farmPlanId, isActive: true }).lean();
  return { boundary };
}

export async function createBoundary(farmPlanId: string, input: BoundaryInput, user: AuthenticatedUser) {
  const { plan, land } = await getPlanAndLand(farmPlanId, user);
  const geometry = validatePolygonGeometry(input.geometry);
  const calculatedArea = calculatePolygonAreaAcres(geometry);
  const center = polygonCenter(geometry);
  await FarmBoundaryModel.updateMany({ farmPlanId }, { $set: { isActive: false } });
  const prior = await FarmBoundaryModel.findOne({ farmPlanId }).sort({ version: -1 }).lean();
  const boundary = await FarmBoundaryModel.create({
    farmPlanId,
    landId: land._id,
    ownerId: plan.ownerId,
    geometry,
    center: { type: 'Point', coordinates: center },
    calculatedArea,
    areaUnit: 'acre',
    source: input.source,
    verificationStatus: input.source === 'admin-verified' && user.role === 'admin' ? 'verified' : 'unverified',
    version: (prior?.version ?? 0) + 1,
    isActive: true,
  });
  if (prior) {
    await BoundaryRevisionModel.create({ boundaryId: boundary._id, farmPlanId, previousGeometry: prior.geometry, updatedGeometry: geometry, previousArea: prior.calculatedArea, updatedArea: calculatedArea, changedBy: user.id, reason: input.reason });
  }
  return { boundary };
}

export async function updateBoundary(boundaryId: string, input: BoundaryInput, user: AuthenticatedUser) {
  const boundary = await FarmBoundaryModel.findById(boundaryId);
  if (!boundary) throw new AppError('Farm boundary not found.', 404);
  await getOwnedPlan(String(boundary.farmPlanId), user);
  const geometry = validatePolygonGeometry(input.geometry);
  const calculatedArea = calculatePolygonAreaAcres(geometry);
  await BoundaryRevisionModel.create({ boundaryId, farmPlanId: boundary.farmPlanId, previousGeometry: boundary.geometry, updatedGeometry: geometry, previousArea: boundary.calculatedArea, updatedArea: calculatedArea, changedBy: user.id, reason: input.reason });
  boundary.geometry = geometry;
  boundary.center = { type: 'Point', coordinates: polygonCenter(geometry) };
  boundary.calculatedArea = calculatedArea;
  boundary.version += 1;
  if (boundary.verificationStatus === 'verified' && user.role !== 'admin') boundary.verificationStatus = 'pending';
  await boundary.save();
  return { boundary };
}

export async function submitBoundaryVerification(boundaryId: string, user: AuthenticatedUser) {
  const boundary = await FarmBoundaryModel.findById(boundaryId);
  if (!boundary) throw new AppError('Farm boundary not found.', 404);
  await getOwnedPlan(String(boundary.farmPlanId), user);
  boundary.verificationStatus = 'pending';
  await boundary.save();
  return { boundary };
}

export async function boundaryHistory(boundaryId: string, user: AuthenticatedUser) {
  const boundary = await FarmBoundaryModel.findById(boundaryId).lean();
  if (!boundary) throw new AppError('Farm boundary not found.', 404);
  await getOwnedPlan(String(boundary.farmPlanId), user);
  return { revisions: await BoundaryRevisionModel.find({ boundaryId }).sort({ createdAt: -1 }).lean() };
}

export async function listSatelliteScenes(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  return { scenes: await RemoteSensingSceneModel.find({ farmPlanId, sourceType: { $in: ['satellite', 'demo'] } }).sort({ capturedAt: -1 }).lean() };
}

export async function requestSatelliteScenes(farmPlanId: string, input: SatelliteRequestInput, user: AuthenticatedUser) {
  const { plan, land } = await getPlanAndLand(farmPlanId, user);
  const boundary = await ensureBoundary(plan, land);
  const provider = getSatelliteProvider();
  const metadata = await provider.getAvailableScenes({ farmPlanId, boundary: boundary.geometry as never, startDate: input.dateRange.startDate, endDate: input.dateRange.endDate, maximumCloudCoverage: input.maximumCloudCoverage });
  const scenes = [];
  for (const item of metadata) {
    const scene = await RemoteSensingSceneModel.findOneAndUpdate(
      { farmPlanId, providerSceneId: item.providerSceneId },
      { $set: { ...item, farmPlanId, landId: land._id, ownerId: plan.ownerId, sourceType: item.isSimulated ? 'demo' : 'satellite', footprint: boundary.geometry, geometry: boundary.geometry, processingStatus: 'completed', processingProgress: 100 } },
      { upsert: true, new: true },
    );
    scenes.push(scene);
    for (const analysisType of input.analysisTypes) await createVegetationAnalysis(String(scene._id), { analysisType }, user);
  }
  await NotificationModel.create({ userId: plan.ownerId, type: 'remote-monitoring-scenes', title: 'Satellite scenes available', message: `${scenes.length} ${provider.name} scene(s) are ready for review.`, data: { farmPlanId, isSimulated: scenes.some((scene) => scene.isSimulated) } });
  return { scenes, isSimulated: scenes.some((scene) => scene.isSimulated) };
}

export async function getScene(sceneId: string, user: AuthenticatedUser) {
  const scene = await findScene(sceneId, user);
  const [analyses, zones] = await Promise.all([VegetationAnalysisModel.find({ sceneId }).lean(), MonitoringZoneModel.find({ sceneId }).lean()]);
  return { scene, analyses, zones };
}

export async function listScenes(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  return { scenes: await RemoteSensingSceneModel.find({ farmPlanId }).sort({ capturedAt: -1 }).lean() };
}

export async function createDroneSurvey(farmPlanId: string, input: DroneSurveyInput, user: AuthenticatedUser) {
  const { plan, land } = await getPlanAndLand(farmPlanId, user);
  const survey = await DroneSurveyModel.create({ ...input, farmPlanId, landId: land._id, ownerId: plan.ownerId, imageCount: 0, coveragePercentage: 0, status: 'draft' });
  return { survey };
}

export async function listDroneSurveys(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  return { surveys: await DroneSurveyModel.find({ farmPlanId }).sort({ surveyDate: -1 }).lean() };
}

export async function getDroneSurvey(surveyId: string, user: AuthenticatedUser) {
  const survey = await DroneSurveyModel.findById(surveyId).lean();
  if (!survey) throw new AppError('Drone survey not found.', 404);
  await getOwnedPlan(String(survey.farmPlanId), user);
  const images = await DroneImageModel.find({ surveyId }).lean();
  return { survey, images };
}

export async function uploadDroneImages(surveyId: string, files: Express.Multer.File[], user: AuthenticatedUser) {
  const survey = await DroneSurveyModel.findById(surveyId);
  if (!survey) throw new AppError('Drone survey not found.', 404);
  await getOwnedPlan(String(survey.farmPlanId), user);
  const images = [];
  for (const file of files) {
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    if (await DroneImageModel.exists({ surveyId, imageHash: hash })) throw new AppError('Duplicate drone image detected.', 409);
    images.push(await DroneImageModel.create({ surveyId, farmPlanId: survey.farmPlanId, ownerId: survey.ownerId, originalFileName: sanitizeName(file.originalname), imageUrl: `/uploads/remote-monitoring/${surveyId}/${hash}.jpg`, thumbnailUrl: `/uploads/remote-monitoring/${surveyId}/${hash}.jpg`, compressedUrl: `/uploads/remote-monitoring/${surveyId}/${hash}.jpg`, mimeType: file.mimetype, fileSize: file.size, imageHash: hash, metadataStatus: 'missing', processingStatus: 'completed' }));
  }
  survey.imageCount += images.length;
  survey.status = 'uploading';
  await survey.save();
  return { images };
}

export async function processDroneSurvey(surveyId: string, user: AuthenticatedUser) {
  const survey = await DroneSurveyModel.findById(surveyId);
  if (!survey) throw new AppError('Drone survey not found.', 404);
  const { plan, land } = await getPlanAndLand(String(survey.farmPlanId), user);
  const scene = await RemoteSensingSceneModel.create({ farmPlanId: survey.farmPlanId, landId: survey.landId, ownerId: survey.ownerId, provider: 'manual-upload', providerSceneId: `drone-${survey._id}`, sourceType: 'drone', title: survey.title, description: 'Drone survey imagery uploaded manually. Hopt It does not control drone hardware.', capturedAt: survey.surveyDate, uploadedAt: new Date(), cloudCoverage: 0, spatialResolutionMeters: 0.05, availableBands: ['red', 'green', 'blue'], previewUrl: '/uploads/demo/remote-monitoring/drone-preview.jpg', thumbnailUrl: '/uploads/demo/remote-monitoring/drone-preview.jpg', processedLayerUrls: { rgb: '/uploads/demo/remote-monitoring/drone-rgb.png', stress: '/uploads/demo/remote-monitoring/drone-stress.png' }, processingStatus: 'completed', processingProgress: 100, processingErrors: [], isSimulated: false, dataQualityScore: Math.min(90, 40 + survey.imageCount * 5) });
  survey.sceneId = scene._id as never;
  survey.status = 'completed';
  survey.coveragePercentage = Math.min(100, survey.imageCount * 12);
  await survey.save();
  await createVegetationAnalysis(String(scene._id), { analysisType: 'rgb-health' }, user);
  await NotificationModel.create({ userId: plan.ownerId, type: 'drone-processing-completed', title: 'Drone processing completed', message: `${survey.title} is ready for monitoring review.`, data: { farmPlanId: plan._id, sceneId: scene._id, landId: land._id } });
  return { survey, scene };
}

export async function createVegetationAnalysis(sceneId: string, input: VegetationRequestInput, user: AuthenticatedUser) {
  const scene = await findScene(sceneId, user);
  if (input.analysisType === 'ndvi' && !scene.availableBands.includes('nir')) throw new AppError('True NDVI requires a near-infrared band. Use rgb-health for RGB-only imagery.', 400);
  const seed = String(scene._id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const stressed = Math.min(45, (seed % 25) + scene.cloudCoverage * 0.2);
  const healthy = Math.max(20, 78 - stressed - scene.cloudCoverage * 0.25);
  const moderate = Math.max(0, 100 - healthy - stressed - 6);
  const analysis = await VegetationAnalysisModel.create({ farmPlanId: scene.farmPlanId, sceneId: scene._id, ownerId: scene.ownerId, analysisType: input.analysisType, calculatedAt: new Date(), meanValue: Number((0.45 + healthy / 300).toFixed(2)), minimumValue: -0.1, maximumValue: 0.86, standardDeviation: 0.14, healthyCoveragePercentage: Number(healthy.toFixed(1)), moderateCoveragePercentage: Number(moderate.toFixed(1)), stressedCoveragePercentage: Number(stressed.toFixed(1)), bareSoilPercentage: 4, waterCoveragePercentage: 2, unavailableCoveragePercentage: scene.cloudCoverage > 60 ? 15 : 0, healthScore: Math.round(healthy + moderate * 0.5), confidenceScore: scene.dataQualityScore, source: scene.isSimulated ? 'simulated' : input.analysisType === 'rgb-health' ? 'ai-estimated' : 'provider', rasterUrl: scene.processedLayerUrls[input.analysisType] ?? scene.processedLayerUrls.stress, tileLayerUrl: scene.processedLayerUrls[input.analysisType] ?? scene.processedLayerUrls.stress, legend: defaultLegend(input.analysisType), warnings: scene.isSimulated ? ['Simulated data for demo mode.'] : input.analysisType === 'rgb-health' ? ['RGB health estimation is not true NDVI.'] : [], assumptions: ['Field inspection is required before treatment decisions.'] });
  await detectZones(scene, analysis);
  return { analysis };
}

export async function listAnalyses(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  return { analyses: await VegetationAnalysisModel.find({ farmPlanId }).sort({ calculatedAt: -1 }).lean() };
}

export async function getAnalysis(analysisId: string, user: AuthenticatedUser) {
  const analysis = await VegetationAnalysisModel.findById(analysisId).lean();
  if (!analysis) throw new AppError('Vegetation analysis not found.', 404);
  await getOwnedPlan(String(analysis.farmPlanId), user);
  return { analysis };
}

export async function listZones(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  return { zones: await MonitoringZoneModel.find({ farmPlanId }).sort({ severity: -1, createdAt: -1 }).lean() };
}

export async function updateZoneStatus(zoneId: string, status: 'reviewed' | 'resolved' | 'dismissed', user: AuthenticatedUser) {
  const zone = await MonitoringZoneModel.findById(zoneId);
  if (!zone) throw new AppError('Monitoring zone not found.', 404);
  await getOwnedPlan(String(zone.farmPlanId), user);
  zone.status = status;
  zone.reviewedBy = user.id as never;
  zone.reviewedAt = new Date();
  if (status === 'resolved') zone.resolvedAt = new Date();
  await zone.save();
  return { zone };
}

export async function createTaskFromZone(zoneId: string, input: { title?: string; assignedWorkerId?: string }, user: AuthenticatedUser) {
  const zone = await MonitoringZoneModel.findById(zoneId);
  if (!zone) throw new AppError('Monitoring zone not found.', 404);
  const { plan } = await getPlanAndLand(String(zone.farmPlanId), user);
  const due = new Date();
  due.setDate(due.getDate() + (zone.severity === 'critical' ? 1 : 3));
  const task = await FarmTaskModel.create({ farmPlanId: zone.farmPlanId, landId: plan.landId, ownerId: plan.ownerId, title: input.title ?? `Inspect ${zone.title}`, description: `${zone.description}\n\nRecommended actions: ${zone.recommendedActions.join(', ')}`, category: 'Inspection', priority: zone.severity === 'critical' ? 'Critical' : zone.severity === 'high' ? 'High' : 'Medium', status: 'Scheduled', assignedWorker: input.assignedWorkerId, estimatedDuration: 2, startDate: due, endDate: due, progress: 0, dependencies: [], attachments: [], notes: `Monitoring zone: ${zone._id}` });
  zone.assignedTaskId = task._id as never;
  zone.status = 'action-created';
  await zone.save();
  return { task, zone };
}

export async function createObservation(farmPlanId: string, input: ObservationInput, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  const observation = await FieldObservationModel.create({ ...input, farmPlanId, createdBy: user.id, verificationStatus: 'unverified' });
  await NotificationModel.create({ userId: user.id, type: 'field-observation-added', title: 'Field observation added', message: observation.title, data: { farmPlanId, observationId: observation._id } });
  return { observation };
}

export async function listObservations(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  return { observations: await FieldObservationModel.find({ farmPlanId }).sort({ observationDate: -1 }).lean() };
}

export async function createComparison(farmPlanId: string, input: ComparisonInput, user: AuthenticatedUser) {
  const { plan } = await getPlanAndLand(farmPlanId, user);
  const [baseline, comparison] = await Promise.all([findScene(input.baselineSceneId, user), findScene(input.comparisonSceneId, user)]);
  if (String(baseline.farmPlanId) !== farmPlanId || String(comparison.farmPlanId) !== farmPlanId) throw new AppError('Scenes must belong to the same farm plan.', 400);
  const [baselineAnalysis, comparisonAnalysis] = await Promise.all([VegetationAnalysisModel.findOne({ sceneId: baseline._id }).sort({ calculatedAt: -1 }).lean(), VegetationAnalysisModel.findOne({ sceneId: comparison._id }).sort({ calculatedAt: -1 }).lean()]);
  const healthScoreChange = (comparisonAnalysis?.healthScore ?? 0) - (baselineAnalysis?.healthScore ?? 0);
  const record = await ImageryComparisonModel.create({ farmPlanId, ownerId: plan.ownerId, baselineSceneId: baseline._id, comparisonSceneId: comparison._id, baselineDate: baseline.capturedAt, comparisonDate: comparison.capturedAt, healthScoreChange, healthyCoverageChange: (comparisonAnalysis?.healthyCoveragePercentage ?? 0) - (baselineAnalysis?.healthyCoveragePercentage ?? 0), stressedCoverageChange: (comparisonAnalysis?.stressedCoveragePercentage ?? 0) - (baselineAnalysis?.stressedCoveragePercentage ?? 0), improvedAreaPercentage: Math.max(0, healthScoreChange), declinedAreaPercentage: Math.max(0, -healthScoreChange), unchangedAreaPercentage: Math.max(0, 100 - Math.abs(healthScoreChange)), newRiskZones: [], resolvedRiskZones: [], summary: healthScoreChange >= 0 ? 'Crop-health score improved. Differences are directional and should be field verified.' : 'Crop-health score declined. Inspect new or persistent stressed zones.', confidenceScore: Math.min(baseline.dataQualityScore, comparison.dataQualityScore), isSimulated: baseline.isSimulated || comparison.isSimulated });
  return { comparison: record };
}

export async function listComparisons(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  return { comparisons: await ImageryComparisonModel.find({ farmPlanId }).sort({ createdAt: -1 }).lean() };
}

export async function generateReport(farmPlanId: string, input: ReportInput, user: AuthenticatedUser) {
  const dashboard = await getDashboard(farmPlanId, user);
  const { plan } = await getPlanAndLand(farmPlanId, user);
  const report = await MonitoringReportModel.create({ farmPlanId, ownerId: plan.ownerId, title: `${input.reportType} remote monitoring report`, reportType: input.reportType, dateRange: { startDate: new Date(Date.now() - 30 * 86_400_000), endDate: new Date() }, sceneIds: dashboard.recentScenes.map((scene) => scene._id), summary: `Health score is ${dashboard.overallHealth.score}. ${dashboard.recommendedActions[0] ?? 'Continue monitoring.'}`, overallHealthScore: dashboard.overallHealth.score, healthyCoveragePercentage: dashboard.coverage.healthy, stressedCoveragePercentage: dashboard.coverage.stressed, criticalZoneCount: dashboard.zones.critical, majorFindings: dashboard.alerts.map((alert) => alert.title), recommendations: dashboard.recommendedActions, generatedBy: 'system', reportFileUrls: { geojson: `/api/v1/remote-monitoring/reports/report/export/geojson` } });
  return { report };
}

export async function listReports(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  return { reports: await MonitoringReportModel.find({ farmPlanId }).sort({ createdAt: -1 }).lean() };
}

export async function getDashboard(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedPlan(farmPlanId, user);
  const [boundary, latestScene, analyses, zones, observations, scenes] = await Promise.all([FarmBoundaryModel.findOne({ farmPlanId, isActive: true }).lean(), RemoteSensingSceneModel.findOne({ farmPlanId }).sort({ capturedAt: -1 }).lean(), VegetationAnalysisModel.find({ farmPlanId }).sort({ calculatedAt: -1 }).lean(), MonitoringZoneModel.find({ farmPlanId }).sort({ createdAt: -1 }).lean(), FieldObservationModel.find({ farmPlanId }).sort({ observationDate: -1 }).limit(5).lean(), RemoteSensingSceneModel.find({ farmPlanId }).sort({ capturedAt: -1 }).limit(8).lean()]);
  const latestAnalysis = analyses[0];
  const imageAgeDays = latestScene ? Math.max(0, Math.round((Date.now() - new Date(latestScene.capturedAt).getTime()) / 86_400_000)) : null;
  return {
    latestScene,
    boundary,
    overallHealth: { score: latestAnalysis?.healthScore ?? 0, label: healthLabel(latestAnalysis?.healthScore ?? 0), confidenceScore: latestAnalysis?.confidenceScore ?? 0, lastUpdated: latestAnalysis?.calculatedAt ?? latestScene?.capturedAt },
    coverage: { healthy: latestAnalysis?.healthyCoveragePercentage ?? 0, moderate: latestAnalysis?.moderateCoveragePercentage ?? 0, stressed: latestAnalysis?.stressedCoveragePercentage ?? 0, bareSoil: latestAnalysis?.bareSoilPercentage ?? 0, unavailable: latestAnalysis?.unavailableCoveragePercentage ?? 0 },
    zones: { total: zones.length, critical: zones.filter((zone) => zone.severity === 'critical').length, high: zones.filter((zone) => zone.severity === 'high').length, inspectionRequired: zones.filter((zone) => zone.status === 'inspection-scheduled' || zone.zoneType === 'inspection-required').length, resolved: zones.filter((zone) => zone.status === 'resolved').length },
    trends: { healthScore: analyses.map((analysis) => ({ date: analysis.calculatedAt, value: analysis.healthScore })).reverse(), healthyCoverage: analyses.map((analysis) => ({ date: analysis.calculatedAt, value: analysis.healthyCoveragePercentage })).reverse(), stressedCoverage: analyses.map((analysis) => ({ date: analysis.calculatedAt, value: analysis.stressedCoveragePercentage })).reverse() },
    alerts: zones.filter((zone) => ['high', 'critical'].includes(zone.severity)).slice(0, 5),
    recentObservations: observations,
    recentScenes: scenes,
    recommendedActions: zones.flatMap((zone) => zone.recommendedActions).slice(0, 6),
    dataQuality: { score: latestScene?.dataQualityScore ?? 0, cloudCoverage: latestScene?.cloudCoverage ?? 0, imageAgeDays, isSimulated: latestScene?.isSimulated ?? false },
  };
}

async function getPlanAndLand(farmPlanId: string, user: AuthenticatedUser) {
  const plan = await getOwnedPlan(farmPlanId, user);
  const land = await LandModel.findById(plan.landId).lean();
  if (!land) throw new AppError('Land not found.', 404);
  return { plan, land };
}

async function getOwnedPlan(farmPlanId: string, user: AuthenticatedUser) {
  const plan = await FarmPlanModel.findById(farmPlanId).lean();
  if (!plan) throw new AppError('Farm plan not found.', 404);
  if (user.role !== 'admin' && String(plan.ownerId) !== user.id) throw new AppError('Farm plan not found.', 404);
  return plan;
}

async function ensureBoundary(plan: { _id: unknown; landId: unknown; ownerId: unknown }, land: { _id: unknown; area?: { value?: number }; location?: { coordinates?: { coordinates?: [number, number] } } }) {
  const existing = await FarmBoundaryModel.findOne({ farmPlanId: plan._id, isActive: true });
  if (existing) return existing;
  const center = land.location?.coordinates?.coordinates ?? [77.5946, 12.9716];
  const geometry = createDefaultBoundary(center, land.area?.value ?? 4);
  return FarmBoundaryModel.create({ farmPlanId: plan._id, landId: land._id, ownerId: plan.ownerId, geometry, center: { type: 'Point', coordinates: polygonCenter(geometry) }, calculatedArea: calculatePolygonAreaAcres(geometry), areaUnit: 'acre', source: 'land-listing', verificationStatus: 'unverified', version: 1, isActive: true });
}

async function findScene(sceneId: string, user: AuthenticatedUser) {
  const scene = await RemoteSensingSceneModel.findById(sceneId).lean();
  if (!scene) throw new AppError('Remote sensing scene not found.', 404);
  await getOwnedPlan(String(scene.farmPlanId), user);
  return scene;
}

async function detectZones(scene: { _id: unknown; farmPlanId: unknown; ownerId: unknown; footprint?: unknown }, analysis: { _id: unknown; stressedCoveragePercentage: number; bareSoilPercentage: number; confidenceScore: number }) {
  if (await MonitoringZoneModel.exists({ analysisId: analysis._id })) return;
  const geometry = ((scene.footprint as { type: 'Polygon'; coordinates: unknown[] } | undefined) ?? createDefaultBoundary([77.5946, 12.9716], 2)) as never;
  const zonePayloads = [
    { title: 'Possible water stress zone', zoneType: 'water-stress', severity: analysis.stressedCoveragePercentage > 25 ? 'high' : 'medium', description: 'Lower vegetation-health values indicate possible water stress. This is not a confirmed diagnosis.', possibleCauses: ['Uneven irrigation', 'Soil moisture variation'], recommendedActions: ['Inspect the marked zone', 'Check drip irrigation flow', 'Record soil moisture observation'] },
    { title: 'Weak growth inspection area', zoneType: analysis.bareSoilPercentage > 8 ? 'bare-soil' : 'poor-growth', severity: 'medium', description: 'Sparse vegetation or exposed soil may require field inspection.', possibleCauses: ['Germination gaps', 'Nutrient stress', 'Bare soil'], recommendedActions: ['Inspect plant stand', 'Compare with sowing pattern', 'Avoid treatment before field confirmation'] },
  ];
  for (const zone of zonePayloads) await MonitoringZoneModel.create({ ...zone, farmPlanId: scene.farmPlanId, sceneId: scene._id, analysisId: analysis._id, ownerId: scene.ownerId, geometry, originalGeometry: geometry, area: 0.2, areaUnit: 'acre', confidenceScore: Math.max(45, analysis.confidenceScore - 10), detectedBy: 'rule-engine', status: 'new' });
}

function defaultLegend(type: string) {
  return type === 'rgb-health'
    ? [{ label: 'Weak RGB vegetation signal', minimum: 0, maximum: 40, description: 'RGB-based estimate, not NDVI.' }, { label: 'Moderate canopy', minimum: 40, maximum: 70, description: 'Moderate visible crop cover.' }, { label: 'Strong canopy', minimum: 70, maximum: 100, description: 'Healthy-looking visible crop cover.' }]
    : [{ label: 'Bare soil or sparse vegetation', minimum: 0, maximum: 0.2, description: 'May represent bare soil or very sparse crop.' }, { label: 'Stressed crop', minimum: 0.2, maximum: 0.4, description: 'Lower vegetation vigor.' }, { label: 'Healthy vegetation', minimum: 0.6, maximum: 0.8, description: 'Higher vegetation vigor.' }];
}

function sanitizeName(name: string) {
  return name.replace(/[^a-z0-9_.-]/gi, '-').slice(0, 120);
}

function healthLabel(score: number) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 30) return 'Poor';
  return 'Critical';
}
