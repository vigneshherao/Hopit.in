import { env } from '@/config/env.js';
import { AssistantConversationModel } from '@/models/assistant-conversation.model.js';
import { AssistantMessageModel } from '@/models/assistant-message.model.js';
import { FarmForecastModel } from '@/models/farm-forecast.model.js';
import { FarmInsightModel } from '@/models/farm-insight.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import { getAIProvider } from '@/services/ai-provider.service.js';
import { buildAnalysisPrompt, buildFarmChatPrompt, buildReportPrompt } from '@/services/ai-assistant.prompts.js';
import { buildFarmAssistantContext, getOwnedFarmPlan } from '@/services/ai-assistant.context-builder.js';
import type { AuthenticatedUser } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';
import { parseAIJson } from '@/utils/parse-ai-json.js';
import {
  assistantAnalyzeResponseSchema,
  assistantChatResponseSchema,
  assistantReportResponseSchema,
  type AssistantAnalyzeInput,
  type AssistantChatInput,
  type AssistantQuery,
  type AssistantReportInput,
} from '@/validators/assistant.validator.js';

export async function chatWithFarmAssistant(input: AssistantChatInput, user: AuthenticatedUser) {
  await enforceAssistantLimit(user.id);
  const context = await buildFarmAssistantContext(input.farmPlanId, user);
  const question = sanitizeText(input.message, 1200);
  const conversation = await findOrCreateConversation(input, user, question);
  const prompt = buildFarmChatPrompt(context, question);
  const raw = await getAIProvider().generateJson({ ...prompt, responseFormatName: 'farm-assistant-chat' });
  const structured = validateJson(raw.content, assistantChatResponseSchema);

  await AssistantMessageModel.create({ conversationId: conversation._id, sender: 'user', content: question, tokens: estimateTokens(question) });
  const assistantMessage = await AssistantMessageModel.create({
    conversationId: conversation._id,
    sender: 'assistant',
    content: structured.answer,
    tokens: estimateTokens(raw.content),
    provider: raw.provider,
    processingTime: raw.durationMs,
  });
  await AssistantConversationModel.updateOne({ _id: conversation._id }, { $set: { lastMessage: structured.answer.slice(0, 500), updatedAt: new Date() } });

  const messages = await AssistantMessageModel.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).limit(80).lean();
  return { conversation, message: assistantMessage, messages, response: structured };
}

export async function analyzeFarmWithAssistant(input: AssistantAnalyzeInput, user: AuthenticatedUser) {
  await enforceAssistantLimit(user.id);
  const context = await buildFarmAssistantContext(input.farmPlanId, user);
  const prompt = buildAnalysisPrompt(context, input.focus);
  const raw = await getAIProvider().generateJson({ ...prompt, responseFormatName: 'farm-assistant-analysis' });
  const structured = validateJson(raw.content, assistantAnalyzeResponseSchema);
  await replaceInsights(input.farmPlanId, structured.insights);
  await notifyCriticalInsights(input.farmPlanId, user.id, structured.insights);
  return { analysis: structured, provider: raw.provider, model: raw.model, durationMs: raw.durationMs };
}

export async function getFarmInsights(farmPlanId: string, user: AuthenticatedUser) {
  const context = await buildFarmAssistantContext(farmPlanId, user);
  const generated = buildDeterministicInsights(context);
  if (generated.length) await replaceInsights(farmPlanId, generated);
  const insights = await FarmInsightModel.find({ farmPlanId, status: { $ne: 'dismissed' } }).sort({ priority: 1, createdAt: -1 }).lean();
  return { health: context.healthScore, insights, grouped: groupByPriority(insights), recommendations: generated.map((insight) => insight.recommendation) };
}

export async function getFarmRecommendations(farmPlanId: string, user: AuthenticatedUser) {
  const context = await buildFarmAssistantContext(farmPlanId, user);
  const insights = buildDeterministicInsights(context);
  return {
    health: context.healthScore,
    recommendations: insights.map((insight) => ({
      title: insight.title,
      priority: insight.priority,
      category: insight.category,
      action: insight.recommendation,
      confidenceScore: insight.confidenceScore,
    })),
  };
}

export async function getFarmForecast(farmPlanId: string, user: AuthenticatedUser) {
  const context = await buildFarmAssistantContext(farmPlanId, user);
  const forecasts = buildDeterministicForecasts(context);
  await replaceForecasts(farmPlanId, forecasts);
  return { health: context.healthScore, forecasts };
}

export async function generateFarmReport(input: AssistantReportInput, user: AuthenticatedUser) {
  await enforceAssistantLimit(user.id);
  const context = await buildFarmAssistantContext(input.farmPlanId, user);
  const prompt = buildReportPrompt(context, input.reportType, input.format);
  const raw = await getAIProvider().generateJson({ ...prompt, responseFormatName: 'farm-assistant-report' });
  const structured = validateJson(raw.content, assistantReportResponseSchema);
  return { report: structured, provider: raw.provider, model: raw.model, durationMs: raw.durationMs };
}

export async function listAssistantConversations(query: AssistantQuery, user: AuthenticatedUser) {
  const filter: Record<string, unknown> = user.role === 'admin' ? {} : { ownerId: user.id };
  if (query.search) filter.title = { $regex: escapeRegex(query.search), $options: 'i' };
  const conversations = await AssistantConversationModel.find(filter).sort({ updatedAt: -1 }).limit(query.limit).lean();
  return { conversations };
}

async function findOrCreateConversation(input: AssistantChatInput, user: AuthenticatedUser, question: string) {
  const plan = await getOwnedFarmPlan(input.farmPlanId, user);
  if (input.conversationId) {
    const conversation = await AssistantConversationModel.findById(input.conversationId);
    if (!conversation) throw new AppError('Conversation not found.', 404);
    if (user.role !== 'admin' && String(conversation.ownerId) !== user.id) throw new AppError('Conversation not found.', 404);
    if (String(conversation.farmPlanId) !== input.farmPlanId) throw new AppError('Conversation does not belong to this farm plan.', 400);
    return conversation;
  }
  return AssistantConversationModel.create({
    ownerId: plan.ownerId,
    farmPlanId: plan._id,
    title: question.length > 70 ? `${question.slice(0, 67)}...` : question,
    lastMessage: question,
  });
}

async function enforceAssistantLimit(userId: string) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const count = await AssistantMessageModel.countDocuments({ sender: 'user', createdAt: { $gte: since }, conversationId: { $exists: true } }).populate({
    path: 'conversationId',
    match: { ownerId: userId },
  });
  if (count >= env.aiDailyRequestLimit) throw new AppError('Daily AI assistant request limit reached. Please try again tomorrow.', 429);
}

async function replaceInsights(farmPlanId: string, insights: { title: string; category: string; priority: string; description: string; recommendation: string; confidenceScore: number }[]) {
  await FarmInsightModel.deleteMany({ farmPlanId, status: 'open' });
  if (!insights.length) return;
  await FarmInsightModel.insertMany(
    insights.map((insight) => ({
      farmPlanId,
      title: insight.title,
      category: normalizeInsightCategory(insight.category),
      priority: insight.priority,
      description: insight.description,
      recommendation: insight.recommendation,
      confidenceScore: insight.confidenceScore,
      status: 'open',
    })),
  );
}

async function replaceForecasts(farmPlanId: string, forecasts: { forecastType: string; prediction: string; confidence: number; estimatedDate?: Date | string; metadata?: Record<string, unknown> }[]) {
  await FarmForecastModel.deleteMany({ farmPlanId });
  await FarmForecastModel.insertMany(
    forecasts.map((forecast) => ({
      ...forecast,
      farmPlanId,
      estimatedDate: forecast.estimatedDate ? new Date(forecast.estimatedDate) : undefined,
    })),
  );
}

async function notifyCriticalInsights(farmPlanId: string, ownerId: string, insights: { title: string; priority: string; recommendation: string }[]) {
  const critical = insights.find((insight) => insight.priority === 'Critical');
  if (!critical) return;
  await NotificationModel.create({
    userId: ownerId,
    type: 'farm-assistant-critical-insight',
    title: critical.title,
    message: critical.recommendation,
    metadata: { farmPlanId },
  });
}

function buildDeterministicInsights(context: Record<string, unknown>) {
  const taskSummary = context.taskSummary as { overdue: number; completionRate: number; pending: number } | undefined;
  const farmSummary = context.farmSummary as { daysToHarvest: number; riskScore: number; riskLevel: string } | undefined;
  const budgetSummary = context.budgetSummary as { expectedROI: number; estimatedProfit: number } | undefined;
  const insights = [];

  if ((taskSummary?.overdue ?? 0) > 0) {
    insights.push({
      title: 'Delayed tasks need attention',
      category: 'Task',
      priority: (taskSummary?.overdue ?? 0) > 5 ? 'Critical' : 'High',
      description: `${taskSummary?.overdue ?? 0} tasks are overdue and may affect crop timing.`,
      recommendation: 'Review overdue tasks today, unblock dependencies and reassign labour where needed.',
      confidenceScore: 92,
    });
  }
  if ((farmSummary?.daysToHarvest ?? 99) <= 10) {
    insights.push({
      title: 'Harvest window is near',
      category: 'Harvest',
      priority: 'High',
      description: `Expected harvest is in ${farmSummary?.daysToHarvest ?? 0} days.`,
      recommendation: 'Prepare crates, workers, transport, buyer calls and storage before harvest starts.',
      confidenceScore: 88,
    });
  }
  if ((farmSummary?.riskScore ?? 0) >= 65) {
    insights.push({
      title: 'Farm risk is elevated',
      category: 'Risk',
      priority: 'High',
      description: `Current plan risk is ${farmSummary?.riskLevel ?? 'high'} with score ${farmSummary?.riskScore ?? 0}.`,
      recommendation: 'Prioritize disease inspection, drainage checks and market price monitoring this week.',
      confidenceScore: 84,
    });
  }
  if ((budgetSummary?.expectedROI ?? 0) < 35) {
    insights.push({
      title: 'ROI needs review',
      category: 'Profit',
      priority: 'Medium',
      description: `Expected ROI is ${budgetSummary?.expectedROI ?? 0}%, which leaves limited margin.`,
      recommendation: 'Compare input costs, negotiate labour rates and avoid non-essential equipment expenses.',
      confidenceScore: 80,
    });
  }
  if ((taskSummary?.completionRate ?? 0) >= 75 && (farmSummary?.daysToHarvest ?? 99) > 10) {
    insights.push({
      title: 'Execution is on track',
      category: 'General',
      priority: 'Low',
      description: `Task completion is ${taskSummary?.completionRate ?? 0}%.`,
      recommendation: 'Continue weekly checks and keep upcoming irrigation and disease monitoring on schedule.',
      confidenceScore: 86,
    });
  }
  if (!insights.length) {
    insights.push({
      title: 'Farm plan is stable',
      category: 'General',
      priority: 'Low',
      description: 'No critical operational issues were detected from the current planner and task data.',
      recommendation: 'Keep the task calendar updated so recommendations remain accurate.',
      confidenceScore: 76,
    });
  }
  return insights;
}

function buildDeterministicForecasts(context: Record<string, unknown>) {
  const farmSummary = context.farmSummary as { expectedHarvestDate: Date; daysToHarvest: number; riskScore: number } | undefined;
  const budgetSummary = context.budgetSummary as { estimatedInvestment: number; estimatedRevenue: number; estimatedProfit: number; expectedROI: number } | undefined;
  const taskSummary = context.taskSummary as { completionRate: number; overdue: number } | undefined;
  return [
    {
      forecastType: 'Harvest',
      prediction: `Expected harvest remains around ${new Date(farmSummary?.expectedHarvestDate ?? new Date()).toLocaleDateString('en-IN')}.`,
      confidence: Math.max(55, 90 - (taskSummary?.overdue ?? 0) * 4),
      estimatedDate: farmSummary?.expectedHarvestDate,
      metadata: { reasoning: 'Based on farm plan harvest date and current task delays.', recommendations: ['Keep harvest preparation tasks visible this week.'] },
    },
    {
      forecastType: 'Profit',
      prediction: `Estimated profit is ${budgetSummary?.estimatedProfit ?? 0} INR if the plan stays on schedule.`,
      confidence: 78,
      metadata: { assumptions: ['No live expense or income module data is available.'], recommendations: ['Record real expenses when that module is available.'] },
    },
    {
      forecastType: 'ROI',
      prediction: `Expected ROI is ${budgetSummary?.expectedROI ?? 0}%.`,
      confidence: 76,
      metadata: { reasoning: 'Uses estimated investment and revenue stored in the farm plan.' },
    },
    {
      forecastType: 'Risk',
      prediction: `Risk score is ${farmSummary?.riskScore ?? 0}; overdue tasks add operational pressure.`,
      confidence: 82,
      metadata: { possibleRisks: ['Task delays', 'Weather variability', 'Market price shifts'], recommendations: ['Resolve overdue critical tasks first.'] },
    },
    {
      forecastType: 'Labour',
      prediction: `Labour demand will rise near harvest, especially if completion is only ${taskSummary?.completionRate ?? 0}%.`,
      confidence: 74,
      metadata: { recommendations: ['Shortlist workers before harvest week.'] },
    },
  ];
}

function groupByPriority<T extends { priority: string }>(items: T[]) {
  return {
    Critical: items.filter((item) => item.priority === 'Critical'),
    High: items.filter((item) => item.priority === 'High'),
    Medium: items.filter((item) => item.priority === 'Medium'),
    Low: items.filter((item) => item.priority === 'Low'),
  };
}

function validateJson<T>(content: string, schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } }) {
  const parsed = parseAIJson(content, 'AI assistant returned invalid JSON. Please retry.');
  const result = schema.safeParse(parsed);
  if (!result.success) throw new AppError('AI assistant returned malformed output. Please retry.', 502);
  return result.data;
}

function sanitizeText(value: string, maxLength: number) {
  return value.replace(/[{}<>`$]/g, '').replace(/system prompt|developer message|ignore previous|jailbreak|api key/gi, '[filtered]').slice(0, maxLength).trim();
}

function estimateTokens(value: string) {
  return Math.ceil(value.length / 4);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeInsightCategory(category: string) {
  const allowed = ['Finance', 'Weather', 'Crop', 'Task', 'Harvest', 'Water', 'Worker', 'Equipment', 'Disease', 'Profit', 'General'];
  return allowed.includes(category) ? category : 'General';
}
