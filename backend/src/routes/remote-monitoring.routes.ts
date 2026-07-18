import multer from 'multer';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '@/config/env.js';
import {
  analysisController,
  boundaryHistoryController,
  comparisonsController,
  createBoundaryController,
  createComparisonController,
  createDroneSurveyController,
  createObservationController,
  createZoneTaskController,
  dashboardController,
  dismissZoneController,
  droneSurveyController,
  droneSurveysController,
  generateReportController,
  getBoundaryController,
  observationsController,
  planAnalysesController,
  processDroneSurveyController,
  reportsController,
  requestSatelliteController,
  resolveZoneController,
  reviewZoneController,
  satelliteScenesController,
  sceneController,
  scenesController,
  submitBoundaryVerificationController,
  updateBoundaryController,
  uploadDroneImagesController,
  vegetationAnalysisController,
  zonesController,
} from '@/controllers/remote-monitoring.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import {
  analysisParamSchema,
  boundaryParamSchema,
  boundarySchema,
  comparisonSchema,
  droneSurveySchema,
  farmPlanParamSchema,
  reportSchema,
  satelliteRequestSchema,
  sceneParamSchema,
  surveyParamSchema,
  vegetationRequestSchema,
  zoneParamSchema,
  observationSchema,
} from '@/validators/remote-monitoring.validator.js';

export const remoteMonitoringRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.remoteMonitoringMaxImageSizeMb * 1024 * 1024, files: env.remoteMonitoringMaxImagesPerSurvey } });
const satelliteLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

remoteMonitoringRouter.use(authenticate);
remoteMonitoringRouter.get('/plans/:farmPlanId/boundary', validateRequest({ params: farmPlanParamSchema }), asyncHandler(getBoundaryController));
remoteMonitoringRouter.post('/plans/:farmPlanId/boundary', validateRequest({ params: farmPlanParamSchema, body: boundarySchema }), asyncHandler(createBoundaryController));
remoteMonitoringRouter.patch('/boundaries/:boundaryId', validateRequest({ params: boundaryParamSchema, body: boundarySchema }), asyncHandler(updateBoundaryController));
remoteMonitoringRouter.post('/boundaries/:boundaryId/submit-verification', validateRequest({ params: boundaryParamSchema }), asyncHandler(submitBoundaryVerificationController));
remoteMonitoringRouter.get('/boundaries/:boundaryId/history', validateRequest({ params: boundaryParamSchema }), asyncHandler(boundaryHistoryController));
remoteMonitoringRouter.get('/plans/:farmPlanId/satellite/scenes', validateRequest({ params: farmPlanParamSchema }), asyncHandler(satelliteScenesController));
remoteMonitoringRouter.post('/plans/:farmPlanId/satellite/request', satelliteLimiter, validateRequest({ params: farmPlanParamSchema, body: satelliteRequestSchema }), asyncHandler(requestSatelliteController));
remoteMonitoringRouter.get('/satellite/scenes/:sceneId', validateRequest({ params: sceneParamSchema }), asyncHandler(sceneController));
remoteMonitoringRouter.post('/satellite/scenes/:sceneId/process', validateRequest({ params: sceneParamSchema, body: vegetationRequestSchema }), asyncHandler(vegetationAnalysisController));
remoteMonitoringRouter.get('/satellite/scenes/:sceneId/status', validateRequest({ params: sceneParamSchema }), asyncHandler(sceneController));
remoteMonitoringRouter.post('/plans/:farmPlanId/drone-surveys', validateRequest({ params: farmPlanParamSchema, body: droneSurveySchema }), asyncHandler(createDroneSurveyController));
remoteMonitoringRouter.get('/plans/:farmPlanId/drone-surveys', validateRequest({ params: farmPlanParamSchema }), asyncHandler(droneSurveysController));
remoteMonitoringRouter.get('/drone-surveys/:surveyId', validateRequest({ params: surveyParamSchema }), asyncHandler(droneSurveyController));
remoteMonitoringRouter.patch('/drone-surveys/:surveyId', validateRequest({ params: surveyParamSchema }), asyncHandler(droneSurveyController));
remoteMonitoringRouter.delete('/drone-surveys/:surveyId', validateRequest({ params: surveyParamSchema }), asyncHandler(droneSurveyController));
remoteMonitoringRouter.post('/drone-surveys/:surveyId/images', validateRequest({ params: surveyParamSchema }), upload.array('images'), asyncHandler(uploadDroneImagesController));
remoteMonitoringRouter.post('/drone-surveys/:surveyId/orthomosaic', validateRequest({ params: surveyParamSchema }), upload.single('orthomosaic'), asyncHandler(uploadDroneImagesController));
remoteMonitoringRouter.post('/drone-surveys/:surveyId/process', validateRequest({ params: surveyParamSchema }), asyncHandler(processDroneSurveyController));
remoteMonitoringRouter.get('/drone-surveys/:surveyId/status', validateRequest({ params: surveyParamSchema }), asyncHandler(droneSurveyController));
remoteMonitoringRouter.get('/plans/:farmPlanId/scenes', validateRequest({ params: farmPlanParamSchema }), asyncHandler(scenesController));
remoteMonitoringRouter.get('/scenes/:sceneId', validateRequest({ params: sceneParamSchema }), asyncHandler(sceneController));
remoteMonitoringRouter.get('/scenes/:sceneId/layers', validateRequest({ params: sceneParamSchema }), asyncHandler(sceneController));
remoteMonitoringRouter.get('/scenes/:sceneId/analyses', validateRequest({ params: sceneParamSchema }), asyncHandler(sceneController));
remoteMonitoringRouter.post('/scenes/:sceneId/analyze', validateRequest({ params: sceneParamSchema, body: vegetationRequestSchema }), asyncHandler(vegetationAnalysisController));
remoteMonitoringRouter.post('/scenes/:sceneId/vegetation-analysis', validateRequest({ params: sceneParamSchema, body: vegetationRequestSchema }), asyncHandler(vegetationAnalysisController));
remoteMonitoringRouter.get('/scenes/:sceneId/processing-status', validateRequest({ params: sceneParamSchema }), asyncHandler(sceneController));
remoteMonitoringRouter.get('/analyses/:analysisId', validateRequest({ params: analysisParamSchema }), asyncHandler(analysisController));
remoteMonitoringRouter.get('/plans/:farmPlanId/analyses', validateRequest({ params: farmPlanParamSchema }), asyncHandler(planAnalysesController));
remoteMonitoringRouter.get('/plans/:farmPlanId/health-trend', validateRequest({ params: farmPlanParamSchema }), asyncHandler(planAnalysesController));
remoteMonitoringRouter.get('/plans/:farmPlanId/zones', validateRequest({ params: farmPlanParamSchema }), asyncHandler(zonesController));
remoteMonitoringRouter.post('/zones/:zoneId/review', validateRequest({ params: zoneParamSchema }), asyncHandler(reviewZoneController));
remoteMonitoringRouter.post('/zones/:zoneId/create-task', validateRequest({ params: zoneParamSchema }), asyncHandler(createZoneTaskController));
remoteMonitoringRouter.post('/zones/:zoneId/resolve', validateRequest({ params: zoneParamSchema }), asyncHandler(resolveZoneController));
remoteMonitoringRouter.post('/zones/:zoneId/dismiss', validateRequest({ params: zoneParamSchema }), asyncHandler(dismissZoneController));
remoteMonitoringRouter.post('/plans/:farmPlanId/observations', validateRequest({ params: farmPlanParamSchema, body: observationSchema }), asyncHandler(createObservationController));
remoteMonitoringRouter.get('/plans/:farmPlanId/observations', validateRequest({ params: farmPlanParamSchema }), asyncHandler(observationsController));
remoteMonitoringRouter.post('/plans/:farmPlanId/comparisons', validateRequest({ params: farmPlanParamSchema, body: comparisonSchema }), asyncHandler(createComparisonController));
remoteMonitoringRouter.get('/plans/:farmPlanId/comparisons', validateRequest({ params: farmPlanParamSchema }), asyncHandler(comparisonsController));
remoteMonitoringRouter.get('/plans/:farmPlanId/dashboard', validateRequest({ params: farmPlanParamSchema }), asyncHandler(dashboardController));
remoteMonitoringRouter.post('/plans/:farmPlanId/reports', validateRequest({ params: farmPlanParamSchema, body: reportSchema }), asyncHandler(generateReportController));
remoteMonitoringRouter.get('/plans/:farmPlanId/reports', validateRequest({ params: farmPlanParamSchema }), asyncHandler(reportsController));

