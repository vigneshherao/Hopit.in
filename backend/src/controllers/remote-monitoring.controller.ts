import type { Request, Response } from 'express';
import {
  boundaryHistory,
  createBoundary,
  createComparison,
  createDroneSurvey,
  createObservation,
  createTaskFromZone,
  createVegetationAnalysis,
  generateReport,
  getAnalysis,
  getBoundary,
  getDashboard,
  getDroneSurvey,
  getScene,
  listAnalyses,
  listComparisons,
  listDroneSurveys,
  listObservations,
  listReports,
  listSatelliteScenes,
  listScenes,
  listZones,
  processDroneSurvey,
  requestSatelliteScenes,
  submitBoundaryVerification,
  updateBoundary,
  updateZoneStatus,
  uploadDroneImages,
} from '@/services/remote-monitoring.service.js';
import { sendSuccess } from '@/utils/api-response.js';
import type { BoundaryInput, ComparisonInput, DroneSurveyInput, ObservationInput, ReportInput, SatelliteRequestInput, VegetationRequestInput } from '@/validators/remote-monitoring.validator.js';

export async function getBoundaryController(req: Request, res: Response) { sendSuccess(res, 200, 'Farm boundary fetched.', await getBoundary(String(req.params.farmPlanId), req.user!)); }
export async function createBoundaryController(req: Request, res: Response) { sendSuccess(res, 201, 'Farm boundary saved.', await createBoundary(String(req.params.farmPlanId), req.body as BoundaryInput, req.user!)); }
export async function updateBoundaryController(req: Request, res: Response) { sendSuccess(res, 200, 'Farm boundary updated.', await updateBoundary(String(req.params.boundaryId), req.body as BoundaryInput, req.user!)); }
export async function submitBoundaryVerificationController(req: Request, res: Response) { sendSuccess(res, 200, 'Farm boundary submitted for verification.', await submitBoundaryVerification(String(req.params.boundaryId), req.user!)); }
export async function boundaryHistoryController(req: Request, res: Response) { sendSuccess(res, 200, 'Boundary history fetched.', await boundaryHistory(String(req.params.boundaryId), req.user!)); }
export async function satelliteScenesController(req: Request, res: Response) { sendSuccess(res, 200, 'Satellite scenes fetched.', await listSatelliteScenes(String(req.params.farmPlanId), req.user!)); }
export async function requestSatelliteController(req: Request, res: Response) { sendSuccess(res, 201, 'Satellite scene request processed.', await requestSatelliteScenes(String(req.params.farmPlanId), req.body as SatelliteRequestInput, req.user!)); }
export async function sceneController(req: Request, res: Response) { sendSuccess(res, 200, 'Scene fetched.', await getScene(String(req.params.sceneId), req.user!)); }
export async function scenesController(req: Request, res: Response) { sendSuccess(res, 200, 'Scenes fetched.', await listScenes(String(req.params.farmPlanId), req.user!)); }
export async function createDroneSurveyController(req: Request, res: Response) { sendSuccess(res, 201, 'Drone survey created.', await createDroneSurvey(String(req.params.farmPlanId), req.body as DroneSurveyInput, req.user!)); }
export async function droneSurveysController(req: Request, res: Response) { sendSuccess(res, 200, 'Drone surveys fetched.', await listDroneSurveys(String(req.params.farmPlanId), req.user!)); }
export async function droneSurveyController(req: Request, res: Response) { sendSuccess(res, 200, 'Drone survey fetched.', await getDroneSurvey(String(req.params.surveyId), req.user!)); }
export async function uploadDroneImagesController(req: Request, res: Response) { sendSuccess(res, 201, 'Drone images uploaded.', await uploadDroneImages(String(req.params.surveyId), req.files as Express.Multer.File[], req.user!)); }
export async function processDroneSurveyController(req: Request, res: Response) { sendSuccess(res, 200, 'Drone survey processed.', await processDroneSurvey(String(req.params.surveyId), req.user!)); }
export async function vegetationAnalysisController(req: Request, res: Response) { sendSuccess(res, 201, 'Vegetation analysis created.', await createVegetationAnalysis(String(req.params.sceneId), req.body as VegetationRequestInput, req.user!)); }
export async function planAnalysesController(req: Request, res: Response) { sendSuccess(res, 200, 'Vegetation analyses fetched.', await listAnalyses(String(req.params.farmPlanId), req.user!)); }
export async function analysisController(req: Request, res: Response) { sendSuccess(res, 200, 'Vegetation analysis fetched.', await getAnalysis(String(req.params.analysisId), req.user!)); }
export async function zonesController(req: Request, res: Response) { sendSuccess(res, 200, 'Monitoring zones fetched.', await listZones(String(req.params.farmPlanId), req.user!)); }
export async function reviewZoneController(req: Request, res: Response) { sendSuccess(res, 200, 'Monitoring zone reviewed.', await updateZoneStatus(String(req.params.zoneId), 'reviewed', req.user!)); }
export async function resolveZoneController(req: Request, res: Response) { sendSuccess(res, 200, 'Monitoring zone resolved.', await updateZoneStatus(String(req.params.zoneId), 'resolved', req.user!)); }
export async function dismissZoneController(req: Request, res: Response) { sendSuccess(res, 200, 'Monitoring zone dismissed.', await updateZoneStatus(String(req.params.zoneId), 'dismissed', req.user!)); }
export async function createZoneTaskController(req: Request, res: Response) { sendSuccess(res, 201, 'Monitoring task created.', await createTaskFromZone(String(req.params.zoneId), req.body, req.user!)); }
export async function createObservationController(req: Request, res: Response) { sendSuccess(res, 201, 'Field observation created.', await createObservation(String(req.params.farmPlanId), req.body as ObservationInput, req.user!)); }
export async function observationsController(req: Request, res: Response) { sendSuccess(res, 200, 'Field observations fetched.', await listObservations(String(req.params.farmPlanId), req.user!)); }
export async function createComparisonController(req: Request, res: Response) { sendSuccess(res, 201, 'Imagery comparison created.', await createComparison(String(req.params.farmPlanId), req.body as ComparisonInput, req.user!)); }
export async function comparisonsController(req: Request, res: Response) { sendSuccess(res, 200, 'Imagery comparisons fetched.', await listComparisons(String(req.params.farmPlanId), req.user!)); }
export async function dashboardController(req: Request, res: Response) { sendSuccess(res, 200, 'Remote monitoring dashboard fetched.', await getDashboard(String(req.params.farmPlanId), req.user!)); }
export async function generateReportController(req: Request, res: Response) { sendSuccess(res, 201, 'Monitoring report generated.', await generateReport(String(req.params.farmPlanId), req.body as ReportInput, req.user!)); }
export async function reportsController(req: Request, res: Response) { sendSuccess(res, 200, 'Monitoring reports fetched.', await listReports(String(req.params.farmPlanId), req.user!)); }

