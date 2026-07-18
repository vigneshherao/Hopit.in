import { FarmCalendarEventModel } from '@/models/farm-calendar-event.model.js';
import { FarmPlanModel, type FarmPlanDocument } from '@/models/farm-plan.model.js';
import { FarmTaskModel } from '@/models/farm-task.model.js';
import { LandModel } from '@/models/land.model.js';
import { AppError } from '@/utils/app-error.js';
import type { AuthenticatedUser } from '@/types/http.js';

export async function getOwnedFarmPlan(farmPlanId: string, user: AuthenticatedUser) {
  const plan = await FarmPlanModel.findById(farmPlanId).lean();
  if (!plan) throw new AppError('Farm plan not found.', 404);
  if (user.role !== 'admin' && String(plan.ownerId) !== user.id) throw new AppError('Farm plan not found.', 404);
  return plan;
}

export async function buildFarmAssistantContext(farmPlanId: string, user: AuthenticatedUser) {
  const plan = await getOwnedFarmPlan(farmPlanId, user);
  const [land, tasks, events] = await Promise.all([
    LandModel.findById(plan.landId).select('title slug location area landDetails nearbyFacilities pricing status verification').lean(),
    FarmTaskModel.find({ farmPlanId: plan._id }).select('title category priority status startDate endDate completedAt progress estimatedDuration').sort({ startDate: 1 }).lean(),
    FarmCalendarEventModel.find({ farmPlanId: plan._id }).select('title startDate endDate allDay').sort({ startDate: 1 }).limit(30).lean(),
  ]);

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const completedTasks = tasks.filter((task) => task.status === 'Completed');
  const pendingTasks = tasks.filter((task) => !['Completed', 'Cancelled', 'Skipped'].includes(task.status));
  const overdueTasks = pendingTasks.filter((task) => new Date(task.endDate) < now);
  const upcomingTasks = pendingTasks.filter((task) => new Date(task.startDate) <= nextWeek).slice(0, 10);
  const completionRate = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const daysToHarvest = Math.ceil((new Date(plan.expectedHarvestDate).getTime() - now.getTime()) / 86_400_000);
  const healthScore = calculateHealthScore(plan, completionRate, overdueTasks.length);

  return {
    farmPlanId: String(plan._id),
    generatedAt: now.toISOString(),
    healthScore,
    landSummary: land
      ? {
          title: land.title,
          slug: land.slug,
          location: land.location ? { city: land.location.city, district: land.location.district, state: land.location.state } : undefined,
          area: land.area,
          soilType: land.landDetails?.soilType,
          waterAvailability: land.landDetails?.waterAvailability,
          irrigationAvailable: land.landDetails?.irrigationAvailable,
          roadAccess: land.landDetails?.roadAccess,
          status: land.status,
        }
      : { unavailable: true },
    farmSummary: {
      title: plan.planTitle,
      crop: plan.selectedCrop,
      season: plan.selectedSeason,
      status: plan.status,
      currentStage: plan.currentStage,
      startDate: plan.startDate,
      expectedHarvestDate: plan.expectedHarvestDate,
      daysToHarvest,
      progress: plan.progress,
      riskLevel: plan.riskLevel,
      riskScore: plan.riskScore,
      weatherNotes: plan.weatherNotes,
    },
    taskSummary: {
      total: tasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      overdue: overdueTasks.length,
      completionRate,
      upcomingTasks: upcomingTasks.map((task) => compactTask(task)),
      completedTasks: completedTasks.slice(-8).map((task) => compactTask(task)),
      overdueTasks: overdueTasks.slice(0, 8).map((task) => compactTask(task)),
    },
    calendarSummary: {
      upcomingEvents: events.filter((event) => new Date(event.endDate) >= now).slice(0, 12).map((event) => ({
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay,
      })),
    },
    budgetSummary: {
      estimatedInvestment: plan.estimatedInvestment,
      estimatedRevenue: plan.estimatedRevenue,
      estimatedProfit: plan.estimatedProfit,
      expectedROI: plan.expectedROI,
      expensesTracked: false,
      revenueTracked: false,
    },
    expenseSummary: { unavailable: true, reason: 'Expense records are not present in this project workspace yet.' },
    revenueSummary: { unavailable: true, reason: 'Income records are not present in this project workspace yet.' },
    harvestSummary: {
      expectedHarvestDate: plan.expectedHarvestDate,
      daysToHarvest,
      readiness: daysToHarvest <= 10 ? 'harvest-window-near' : daysToHarvest <= 30 ? 'prepare-harvest-logistics' : 'monitor-growth',
    },
    weatherSummary: { notes: plan.weatherNotes ?? 'No external weather feed is configured.' },
    roiSummary: {
      expectedROI: plan.expectedROI,
      expectedProfit: plan.estimatedProfit,
      label: plan.expectedROI >= 80 ? 'strong' : plan.expectedROI >= 35 ? 'moderate' : 'needs-review',
    },
    aiRecommendationSummary: summarizeRecommendation(plan),
  };
}

function compactTask(task: { title: string; category: string; priority: string; status: string; startDate: Date; endDate: Date; progress: number }) {
  return {
    title: task.title,
    category: task.category,
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    endDate: task.endDate,
    progress: task.progress,
  };
}

function calculateHealthScore(plan: FarmPlanDocument | Record<string, unknown>, completionRate: number, overdueCount: number) {
  const riskScore = typeof plan.riskScore === 'number' ? plan.riskScore : 50;
  const roi = typeof plan.expectedROI === 'number' ? plan.expectedROI : 0;
  let score = 55 + completionRate * 0.25 + Math.min(roi, 100) * 0.15 - riskScore * 0.25 - overdueCount * 4;
  if (plan.status === 'active') score += 5;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, label: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Average' : score >= 30 ? 'Poor' : 'Critical' };
}

function summarizeRecommendation(plan: Record<string, unknown>) {
  const recommendation = plan.AIRecommendation as Record<string, unknown> | undefined;
  if (!recommendation) return { unavailable: true };
  return {
    landPreparation: Array.isArray(recommendation.landPreparation) ? recommendation.landPreparation.slice(0, 6) : [],
    seedRecommendation: recommendation.seedRecommendation,
    waterSchedule: Array.isArray(recommendation.waterSchedule) ? recommendation.waterSchedule.slice(0, 4) : [],
    fertilizerSchedule: Array.isArray(recommendation.fertilizerSchedule) ? recommendation.fertilizerSchedule.slice(0, 4) : [],
    harvestSchedule: recommendation.harvestSchedule,
    riskAnalysis: recommendation.riskAnalysis,
  };
}

