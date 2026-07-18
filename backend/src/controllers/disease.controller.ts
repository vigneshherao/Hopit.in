import type { Request, Response } from 'express';
import {
  analyzeDisease,
  deleteDiseaseAnalysis,
  diseaseStatistics,
  farmDiseaseHistory,
  getDiseaseAnalysis,
  latestDiseaseAnalysis,
  listDiseaseHistory,
} from '@/services/disease.service.js';
import { sendSuccess } from '@/utils/api-response.js';
import type { DiseaseAnalyzeBody, DiseaseHistoryQuery } from '@/validators/disease.validator.js';

export async function analyzeDiseaseController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 201, 'Disease analysis completed.', await analyzeDisease(req.files as Express.Multer.File[], req.body as DiseaseAnalyzeBody, req.user!));
}

export async function analyzeMultipleDiseaseController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 201, 'Disease analysis completed.', await analyzeDisease(req.files as Express.Multer.File[], req.body as DiseaseAnalyzeBody, req.user!));
}

export async function diseaseHistoryController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Disease history fetched.', await listDiseaseHistory(req.query as unknown as DiseaseHistoryQuery, req.user!));
}

export async function diseaseAnalysisController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Disease analysis fetched.', await getDiseaseAnalysis(String(req.params.id), req.user!));
}

export async function deleteDiseaseAnalysisController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Disease analysis deleted.', await deleteDiseaseAnalysis(String(req.params.id), req.user!));
}

export async function diseaseStatisticsController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Disease statistics fetched.', await diseaseStatistics(req.user!));
}

export async function latestDiseaseAnalysisController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Latest disease analysis fetched.', await latestDiseaseAnalysis(req.user!));
}

export async function farmDiseaseHistoryController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm disease history fetched.', await farmDiseaseHistory(String(req.params.farmPlanId), req.user!));
}

