import { z } from 'zod';

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.');
const position = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const polygon = z.object({ type: z.literal('Polygon'), coordinates: z.array(z.array(position).min(4)).min(1) });

export const farmPlanParamSchema = z.object({ farmPlanId: mongoId });
export const boundaryParamSchema = z.object({ boundaryId: mongoId });
export const sceneParamSchema = z.object({ sceneId: mongoId });
export const surveyParamSchema = z.object({ surveyId: mongoId });
export const analysisParamSchema = z.object({ analysisId: mongoId });
export const zoneParamSchema = z.object({ zoneId: mongoId });
export const observationParamSchema = z.object({ observationId: mongoId });
export const comparisonParamSchema = z.object({ comparisonId: mongoId });
export const reportParamSchema = z.object({ reportId: mongoId });

export const boundarySchema = z.object({
  geometry: polygon,
  source: z.enum(['land-listing', 'manual-draw', 'uploaded-geojson', 'admin-verified']).default('manual-draw'),
  reason: z.string().trim().max(500).optional(),
});

export const satelliteSceneQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  maximumCloudCoverage: z.coerce.number().min(0).max(100).optional(),
  minimumResolution: z.coerce.number().min(0).optional(),
  provider: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export const satelliteRequestSchema = z.object({
  dateRange: z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }),
  maximumCloudCoverage: z.coerce.number().min(0).max(100).default(60),
  analysisTypes: z.array(z.enum(['ndvi', 'moisture', 'rgb-health', 'combined'])).default(['ndvi']),
});

export const droneSurveySchema = z.object({
  title: z.string().trim().min(2).max(180),
  surveyDate: z.coerce.date(),
  operatorName: z.string().trim().max(120).optional(),
  droneModel: z.string().trim().max(120).optional(),
  cameraModel: z.string().trim().max(120).optional(),
  altitudeMeters: z.coerce.number().min(0).optional(),
  flightNotes: z.string().trim().max(2000).optional(),
});

export const vegetationRequestSchema = z.object({
  analysisType: z.enum(['ndvi', 'ndre', 'gndvi', 'moisture', 'thermal', 'rgb-health', 'combined']),
});

export const zoneReviewSchema = z.object({ notes: z.string().trim().max(1000).optional() });
export const zoneTaskSchema = z.object({ title: z.string().trim().min(2).max(180).optional(), assignedWorkerId: mongoId.optional() });
export const zoneAssignWorkerSchema = z.object({ assignedWorkerId: mongoId });

export const observationSchema = z.object({
  monitoringZoneId: mongoId.optional(),
  taskId: mongoId.optional(),
  observationDate: z.coerce.date().default(() => new Date()),
  title: z.string().trim().min(2).max(180),
  notes: z.string().trim().max(3000).optional(),
  observedCondition: z.enum(['healthy', 'dry', 'waterlogged', 'nutrient-deficiency', 'possible-disease', 'possible-pest', 'weed-growth', 'physical-damage', 'unknown']),
  severity: z.enum(['none', 'low', 'medium', 'high', 'critical']).default('none'),
  imageUrls: z.array(z.string().trim()).default([]),
  coordinates: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }).optional(),
  recommendedFollowUp: z.string().trim().max(1200).optional(),
});

export const comparisonSchema = z.object({ baselineSceneId: mongoId, comparisonSceneId: mongoId });
export const reportSchema = z.object({ reportType: z.enum(['scene-analysis', 'weekly-monitoring', 'monthly-monitoring', 'comparison', 'inspection', 'complete']).default('weekly-monitoring') });

export type BoundaryInput = z.infer<typeof boundarySchema>;
export type SatelliteRequestInput = z.infer<typeof satelliteRequestSchema>;
export type DroneSurveyInput = z.infer<typeof droneSurveySchema>;
export type VegetationRequestInput = z.infer<typeof vegetationRequestSchema>;
export type ObservationInput = z.infer<typeof observationSchema>;
export type ComparisonInput = z.infer<typeof comparisonSchema>;
export type ReportInput = z.infer<typeof reportSchema>;

