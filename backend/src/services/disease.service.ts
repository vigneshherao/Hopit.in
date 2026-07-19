import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudinary } from '@/config/cloudinary.js';
import { env } from '@/config/env.js';
import { DiseaseAnalysisModel } from '@/models/disease-analysis.model.js';
import { DiseaseImageModel } from '@/models/disease-image.model.js';
import { DiseaseRecommendationModel } from '@/models/disease-recommendation.model.js';
import { DiseaseTimelineModel } from '@/models/disease-timeline.model.js';
import { FarmPlanModel } from '@/models/farm-plan.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import { createDiseaseCacheKey, findCachedDiseaseAnalysis } from '@/services/analysisCache.service.js';
import { buildDiseasePrompt } from '@/services/disease.prompts.js';
import { getAIProvider } from '@/services/ai-provider.service.js';
import { validateDiseaseImage, type ValidatedDiseaseImage } from '@/services/imageHash.service.js';
import type { AuthenticatedUser } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';
import { parseAIJson } from '@/utils/parse-ai-json.js';
import { diseaseAIResponseSchema, type DiseaseAnalyzeBody, type DiseaseHistoryQuery } from '@/validators/disease.validator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localDiseaseUploadRoot = path.resolve(__dirname, '../../uploads/disease');

export async function analyzeDisease(files: Express.Multer.File[], input: DiseaseAnalyzeBody, user: AuthenticatedUser) {
  if (!files.length) throw new AppError('At least one crop image is required.', 400);
  const plan = input.farmPlanId ? await getOwnedFarmPlan(input.farmPlanId, user) : null;
  const validated = files.map((file) => validateDiseaseImage(file));
  ensureNoDuplicateImages(validated);

  const cacheKey = createDiseaseCacheKey({ hashes: validated.map((item) => item.hash), cropName: input.cropName, weatherSummary: input.weatherSummary ?? plan?.weatherNotes });
  const cached = await findCachedDiseaseAnalysis(cacheKey, user.id);
  if (cached) return cached;

  const previousHistory = await DiseaseAnalysisModel.find({ ownerId: user.id, cropName: input.cropName }).select('diseaseName severity cropHealthScore createdAt').sort({ createdAt: -1 }).limit(5).lean();
  const prompt = buildDiseasePrompt({
    cropName: sanitizeText(input.cropName, 80) ?? input.cropName,
    farmerState: sanitizeText(input.farmerState, 80),
    weatherSummary: sanitizeText(input.weatherSummary ?? plan?.weatherNotes, 500),
    uploadedImages: validated.map((image) => ({ mimeType: image.mimeType, width: image.width, height: image.height, size: image.size, hash: image.hash })),
    previousHistory,
  });
  const raw = await getAIProvider().generateJsonWithImages({
    ...prompt,
    responseFormatName: 'crop-disease-detection',
    images: files.map((file) => ({ mimeType: file.mimetype, base64: file.buffer.toString('base64') })),
  });
  const aiResult = validateAIResponse(raw.content);

  const analysis = await DiseaseAnalysisModel.create({
    ownerId: user.id,
    farmPlanId: plan?._id,
    landId: plan?.landId,
    cropName: sanitizeText(input.cropName, 80),
    analysisStatus: 'completed',
    analysisProvider: raw.provider,
    analysisVersion: '2026-07',
    diseaseName: aiResult.disease,
    summary: aiResult.summary,
    confidenceScore: aiResult.confidenceScore,
    severity: aiResult.severity,
    cropHealthScore: aiResult.cropHealthScore,
    symptoms: aiResult.symptoms,
    causes: aiResult.causes,
    organicTreatment: aiResult.organicTreatment,
    chemicalTreatment: aiResult.chemicalTreatment,
    prevention: aiResult.prevention,
    monitoringAdvice: aiResult.monitoringAdvice,
    estimatedRecoveryDays: aiResult.estimatedRecoveryDays,
    estimatedTreatmentCost: aiResult.estimatedTreatmentCost,
    weatherRisk: aiResult.weatherRisk,
    notes: 'AI crop image analysis is advisory and not guaranteed. Confirm critical decisions with a local agronomist.',
    processingTimeMs: raw.durationMs,
    cacheKey,
  });

  const images = [];
  for (const [index, file] of files.entries()) {
    const stored = await storeDiseaseImage(file, validated[index], analysis._id.toString());
    images.push(await DiseaseImageModel.create({ analysisId: analysis._id, ...stored, uploadedAt: new Date() }));
  }

  const recommendations = await DiseaseRecommendationModel.insertMany(
    aiResult.recommendations.map((recommendation) => ({ analysisId: analysis._id, ...recommendation })),
  );
  if (plan?._id) {
    await DiseaseTimelineModel.create({ farmPlanId: plan._id, analysisId: analysis._id, status: aiResult.severity, healthScore: aiResult.cropHealthScore });
  }
  await notifyDiseaseResult(user.id, analysis._id.toString(), aiResult);

  return { analysis, images, recommendations, cached: false };
}

export async function listDiseaseHistory(query: DiseaseHistoryQuery, user: AuthenticatedUser) {
  const filter: Record<string, unknown> = user.role === 'admin' ? {} : { ownerId: user.id };
  if (query.farmPlanId) filter.farmPlanId = query.farmPlanId;
  if (query.cropName) filter.cropName = { $regex: escapeRegex(query.cropName), $options: 'i' };
  if (query.severity) filter.severity = query.severity;
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    DiseaseAnalysisModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    DiseaseAnalysisModel.countDocuments(filter),
  ]);
  const imageGroups = await DiseaseImageModel.find({ analysisId: { $in: items.map((item) => item._id) } }).lean();
  return {
    analyses: items.map((item) => ({ ...item, images: imageGroups.filter((image) => String(image.analysisId) === String(item._id)) })),
    pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) || 1 },
  };
}

export async function getDiseaseAnalysis(id: string, user: AuthenticatedUser) {
  const analysis = await findAnalysisForUser(id, user);
  const [images, recommendations, timeline] = await Promise.all([
    DiseaseImageModel.find({ analysisId: analysis._id }).lean(),
    DiseaseRecommendationModel.find({ analysisId: analysis._id }).lean(),
    DiseaseTimelineModel.find({ analysisId: analysis._id }).sort({ createdAt: 1 }).lean(),
  ]);
  return { analysis, images, recommendations, timeline };
}

export async function deleteDiseaseAnalysis(id: string, user: AuthenticatedUser) {
  const analysis = await findAnalysisForUser(id, user);
  await Promise.all([
    DiseaseAnalysisModel.deleteOne({ _id: analysis._id }),
    DiseaseImageModel.deleteMany({ analysisId: analysis._id }),
    DiseaseRecommendationModel.deleteMany({ analysisId: analysis._id }),
    DiseaseTimelineModel.deleteMany({ analysisId: analysis._id }),
  ]);
  return { deleted: true };
}

export async function diseaseStatistics(user: AuthenticatedUser) {
  const filter = user.role === 'admin' ? {} : { ownerId: user.id };
  const analyses = await DiseaseAnalysisModel.find(filter).lean();
  const totalAnalyses = analyses.length;
  const healthyCrops = analyses.filter((analysis) => analysis.severity === 'Healthy').length;
  const diseasedCrops = totalAnalyses - healthyCrops;
  const averageHealthScore = totalAnalyses ? Math.round(analyses.reduce((sum, item) => sum + item.cropHealthScore, 0) / totalAnalyses) : 0;
  const diseaseCounts = analyses.reduce<Record<string, number>>((acc, item) => {
    acc[item.diseaseName] = (acc[item.diseaseName] ?? 0) + 1;
    return acc;
  }, {});
  const mostCommonDisease = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const recoveryRate = totalAnalyses ? Math.round((analyses.filter((item) => item.cropHealthScore >= 80).length / totalAnalyses) * 100) : 0;
  return { totalAnalyses, healthyCrops, diseasedCrops, averageHealthScore, mostCommonDisease, recoveryRate };
}

export async function latestDiseaseAnalysis(user: AuthenticatedUser) {
  const filter = user.role === 'admin' ? {} : { ownerId: user.id };
  const analysis = await DiseaseAnalysisModel.findOne(filter).sort({ createdAt: -1 }).lean();
  if (!analysis) return { analysis: null, images: [], recommendations: [] };
  const [images, recommendations] = await Promise.all([
    DiseaseImageModel.find({ analysisId: analysis._id }).lean(),
    DiseaseRecommendationModel.find({ analysisId: analysis._id }).lean(),
  ]);
  return { analysis, images, recommendations };
}

export async function farmDiseaseHistory(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedFarmPlan(farmPlanId, user);
  const analyses = await DiseaseAnalysisModel.find({ farmPlanId }).sort({ createdAt: -1 }).lean();
  const timeline = await DiseaseTimelineModel.find({ farmPlanId }).sort({ createdAt: 1 }).lean();
  return { analyses, timeline };
}

async function getOwnedFarmPlan(farmPlanId: string, user: AuthenticatedUser) {
  const plan = await FarmPlanModel.findById(farmPlanId).lean();
  if (!plan) throw new AppError('Farm plan not found.', 404);
  if (user.role !== 'admin' && String(plan.ownerId) !== user.id) throw new AppError('Farm plan not found.', 404);
  return plan;
}

async function findAnalysisForUser(id: string, user: AuthenticatedUser) {
  const analysis = await DiseaseAnalysisModel.findById(id).lean();
  if (!analysis) throw new AppError('Disease analysis not found.', 404);
  if (user.role !== 'admin' && String(analysis.ownerId) !== user.id) throw new AppError('Disease analysis not found.', 404);
  return analysis;
}

function validateAIResponse(content: string) {
  const parsed = parseAIJson(content, 'AI disease analysis returned invalid JSON. Please retry.');
  const result = diseaseAIResponseSchema.safeParse(parsed);
  if (!result.success) throw new AppError('AI disease analysis returned malformed output. Please retry.', 502);
  return result.data;
}

async function storeDiseaseImage(file: Express.Multer.File, image: ValidatedDiseaseImage, analysisId: string) {
  if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, { folder: `hopit/disease/${analysisId}`, resource_type: 'image' });
    return { imageUrl: uploaded.secure_url, thumbnailUrl: uploaded.secure_url, compressedUrl: uploaded.secure_url, imageHash: image.hash, mimeType: image.mimeType, width: image.width, height: image.height, size: image.size };
  }
  const folder = path.join(localDiseaseUploadRoot, analysisId);
  await fs.mkdir(folder, { recursive: true });
  const extension = image.mimeType === 'image/png' ? 'png' : image.mimeType === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${Date.now()}-${image.hash.slice(0, 12)}.${extension}`;
  const filePath = path.join(folder, filename);
  await fs.writeFile(filePath, file.buffer);
  const url = `/uploads/disease/${analysisId}/${filename}`;
  return { imageUrl: url, thumbnailUrl: url, compressedUrl: url, imageHash: image.hash, mimeType: image.mimeType, width: image.width, height: image.height, size: image.size };
}

async function notifyDiseaseResult(userId: string, analysisId: string, result: { disease: string; severity: string; cropHealthScore: number }) {
  const title = result.severity === 'Healthy' ? 'Crop looks healthy' : result.severity === 'Critical' ? 'Critical crop disease risk' : 'Crop disease analysis ready';
  await NotificationModel.create({
    userId,
    type: result.severity === 'Healthy' ? 'healthy-crop' : result.severity === 'Critical' ? 'critical-disease' : 'disease-detected',
    title,
    message: `${result.disease} detected with ${result.severity.toLowerCase()} severity and ${result.cropHealthScore}% health score.`,
    data: { analysisId },
  });
}

function ensureNoDuplicateImages(images: ValidatedDiseaseImage[]) {
  const hashes = new Set<string>();
  for (const image of images) {
    if (hashes.has(image.hash)) throw new AppError('Duplicate images in the same upload are not allowed.', 400);
    hashes.add(image.hash);
  }
}

function sanitizeText(value: string | undefined, maxLength: number) {
  return value?.replace(/[{}<>`$]/g, '').replace(/system prompt|developer message|ignore previous|jailbreak|api key/gi, '[filtered]').slice(0, maxLength).trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
