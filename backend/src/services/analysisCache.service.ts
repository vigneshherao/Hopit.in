import crypto from 'node:crypto';
import { DiseaseAnalysisModel } from '@/models/disease-analysis.model.js';
import { DiseaseImageModel } from '@/models/disease-image.model.js';
import { DiseaseRecommendationModel } from '@/models/disease-recommendation.model.js';

export function createDiseaseCacheKey(input: { hashes: string[]; cropName: string; weatherSummary?: string }) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({ hashes: [...input.hashes].sort(), cropName: input.cropName.toLowerCase().trim(), weatherSummary: input.weatherSummary?.toLowerCase().trim() ?? '' }))
    .digest('hex');
}

export async function findCachedDiseaseAnalysis(cacheKey: string, ownerId: string) {
  const analysis = await DiseaseAnalysisModel.findOne({ cacheKey, ownerId, analysisStatus: 'completed' }).lean();
  if (!analysis) return null;
  const [images, recommendations] = await Promise.all([
    DiseaseImageModel.find({ analysisId: analysis._id }).lean(),
    DiseaseRecommendationModel.find({ analysisId: analysis._id }).lean(),
  ]);
  return { analysis, images, recommendations, cached: true };
}
