import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FarmAssistantPage } from '@/pages/FarmAssistantPage.jsx';
import { FarmInsightsPage } from '@/pages/FarmInsightsPage.jsx';
import { FarmPlannerDetailPage } from '@/pages/FarmPlannerDetailPage.jsx';
import { FarmPlannerPage } from '@/pages/FarmPlannerPage.jsx';
import { FarmCalendarPage } from '@/pages/FarmCalendarPage.jsx';
import { FarmTasksPage } from '@/pages/FarmTasksPage.jsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx';

const mocks = vi.hoisted(() => ({
  authState: { isAuthenticated: true, isLoading: false, user: { role: 'owner' } },
  generatePlan: { isPending: false, error: null, mutateAsync: vi.fn() },
  updatePlan: { mutate: vi.fn() },
  recalculatePlan: { isPending: false, mutate: vi.fn() },
  plans: [],
  dashboard: null,
  taskBoard: null,
  calendar: null,
  updateTask: { mutate: vi.fn() },
  createTask: { mutate: vi.fn() },
  deleteTask: { mutate: vi.fn() },
  completeTask: { mutate: vi.fn() },
  startTask: { mutate: vi.fn() },
  cancelTask: { mutate: vi.fn() },
  updateCalendarEvent: { mutate: vi.fn() },
  assistantChat: { isPending: false, error: null, mutateAsync: vi.fn() },
  analyzeFarm: { isPending: false, mutate: vi.fn() },
  generateReport: { isPending: false, mutateAsync: vi.fn() },
  insights: null,
  recommendations: null,
  forecast: null,
}));

vi.mock('@/context/AuthContext.jsx', () => ({ useAuth: () => mocks.authState }));
vi.mock('@/hooks/useLands.js', () => ({
  useMyLands: () => ({ data: { lands: [{ _id: 'land1', title: 'Mandya farm', location: { district: 'Mandya' } }] } }),
}));
vi.mock('@/hooks/useFarmPlanner.js', () => ({
  useFarmPlans: () => ({ isLoading: false, data: { plans: mocks.plans } }),
  useGeneratePlan: () => mocks.generatePlan,
  useFarmDashboard: () => ({ isLoading: false, data: mocks.dashboard }),
  useUpdatePlan: () => mocks.updatePlan,
  useRecalculatePlan: () => mocks.recalculatePlan,
}));
vi.mock('@/hooks/useFarmTasks.js', () => ({
  useTaskBoard: () => ({ isLoading: false, data: mocks.taskBoard }),
  useFarmCalendar: () => ({ isLoading: false, data: mocks.calendar }),
  useUpdateTask: () => mocks.updateTask,
  useCreateTask: () => mocks.createTask,
  useDeleteTask: () => mocks.deleteTask,
  useCompleteTask: () => mocks.completeTask,
  useStartTask: () => mocks.startTask,
  useCancelTask: () => mocks.cancelTask,
  useUpdateCalendarEvent: () => mocks.updateCalendarEvent,
}));
vi.mock('@/hooks/useAssistant.js', () => ({
  useAssistantChat: () => mocks.assistantChat,
  useAnalyzeFarm: () => mocks.analyzeFarm,
  useGenerateReport: () => mocks.generateReport,
  useFarmInsights: () => ({ isLoading: false, data: mocks.insights }),
  useFarmRecommendations: () => ({ isLoading: false, data: mocks.recommendations }),
  useForecast: () => ({ isLoading: false, data: mocks.forecast }),
}));

function renderPage(ui, initialEntries = ['/']) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

function farmPlan() {
  return {
    _id: 'plan1',
    planTitle: 'Tomato execution plan',
    description: 'A complete tomato cultivation plan.',
    selectedCrop: 'Tomato',
    selectedSeason: 'monsoon',
    status: 'draft',
    currentStage: 'planning',
    riskLevel: 'medium',
    riskScore: 42,
    farmDurationDays: 110,
    expectedHarvestDate: new Date().toISOString(),
    estimatedInvestment: 80000,
    estimatedRevenue: 180000,
    estimatedProfit: 100000,
    expectedROI: 125,
    progress: { percentage: 15, completedStages: [], nextAction: 'Prepare land' },
    labourRequirement: { totalWorkers: 3 },
    equipmentRequirement: { items: ['Tractor'] },
    waterRequirement: { level: 'medium' },
    versions: [{ version: 1, estimatedInvestment: 80000, expectedROI: 125 }],
    landId: { title: 'Mandya farm' },
    AIRecommendation: {
      landPreparation: ['Plough field'],
      fertilizerSchedule: [{ day: 10, item: 'Compost', quantity: '2 tons' }],
      pesticideSchedule: [{ stage: 'Growth', treatment: 'Neem spray' }],
      waterSchedule: [{ stage: 'Sowing', frequency: 'Daily' }],
      harvestSchedule: { steps: ['Harvest ripe fruits'] },
      riskAnalysis: { mitigation: ['Use traps'] },
      timeline: [{ stage: 'Preparation', expectedCost: 20000, progressWeight: 20 }],
    },
  };
}

function farmTasks() {
  return [
    { _id: 'task1', title: 'Land Cleaning', category: 'Land Preparation', priority: 'High', status: 'Scheduled', progress: 0, startDate: new Date().toISOString(), endDate: new Date().toISOString() },
    { _id: 'task2', title: 'Sowing', category: 'Sowing', priority: 'High', status: 'In Progress', progress: 35, startDate: new Date().toISOString(), endDate: new Date().toISOString(), assignedWorker: { name: 'Ravi' } },
    { _id: 'task3', title: 'Harvest', category: 'Harvesting', priority: 'Critical', status: 'Completed', progress: 100, startDate: new Date().toISOString(), endDate: new Date().toISOString() },
  ];
}

describe('farm planner frontend', () => {
  beforeEach(() => {
    mocks.authState.isAuthenticated = true;
    mocks.generatePlan.isPending = false;
    mocks.generatePlan.error = null;
    mocks.generatePlan.mutateAsync.mockReset();
    mocks.plans = [farmPlan()];
    mocks.dashboard = {
      plan: farmPlan(),
      dashboard: {
        charts: {
          investmentRevenue: [
            { name: 'Investment', value: 80000 },
            { name: 'Revenue', value: 180000 },
            { name: 'Profit', value: 100000 },
          ],
          timeline: [{ name: 'Preparation', cost: 20000, progress: 20 }],
        },
      },
    };
    const tasks = farmTasks();
    mocks.taskBoard = {
      tasks,
      board: {
        Pending: [],
        Scheduled: [tasks[0]],
        'In Progress': [tasks[1]],
        Completed: [tasks[2]],
        Cancelled: [],
      },
      widgets: { today: 2, thisWeek: 3, overdue: 0, completedPercentage: 33, pendingPercentage: 33 },
    };
    mocks.calendar = { events: [{ _id: 'event1', title: 'Land Cleaning', description: 'Prepare land', startDate: new Date().toISOString(), endDate: new Date().toISOString(), eventColor: '#059669' }] };
    mocks.assistantChat.isPending = false;
    mocks.assistantChat.error = null;
    mocks.assistantChat.mutateAsync.mockReset();
    mocks.assistantChat.mutateAsync.mockResolvedValue({
      conversation: { _id: 'conversation1' },
      messages: [
        { _id: 'message1', sender: 'user', content: 'How is my farm doing?' },
        { _id: 'message2', sender: 'assistant', content: 'Your farm is healthy and on track.' },
      ],
      response: { answer: 'Your farm is healthy and on track.', confidenceScore: 88 },
    });
    mocks.analyzeFarm.isPending = false;
    mocks.analyzeFarm.mutate.mockReset();
    mocks.generateReport.isPending = false;
    mocks.generateReport.mutateAsync.mockReset();
    mocks.insights = {
      health: { score: 78, label: 'Good' },
      insights: [{ _id: 'insight1', title: 'Delayed tasks need attention', priority: 'High', category: 'Task', description: 'Two tasks are delayed.', recommendation: 'Reassign labour today.', confidenceScore: 92 }],
      grouped: { Critical: [], High: [{ _id: 'insight1', title: 'Delayed tasks need attention', priority: 'High', category: 'Task', description: 'Two tasks are delayed.', recommendation: 'Reassign labour today.', confidenceScore: 92 }], Medium: [], Low: [] },
    };
    mocks.recommendations = { recommendations: [{ title: 'Delayed tasks need attention', priority: 'High', category: 'Task', action: 'Reassign labour today.', confidenceScore: 92 }] };
    mocks.forecast = { forecasts: [{ forecastType: 'Harvest', prediction: 'Harvest remains on schedule.', confidence: 86 }] };
  });

  it('protects farm planner route', () => {
    mocks.authState.isAuthenticated = false;
    renderPage(
      <Routes>
        <Route path="/farm-planner" element={<ProtectedRoute><FarmPlannerPage /></ProtectedRoute>} />
        <Route path="/login" element={<div>Login route</div>} />
      </Routes>,
      ['/farm-planner'],
    );
    expect(screen.getByText('Login route')).toBeInTheDocument();
  });

  it('renders planner page and validates generate form', async () => {
    renderPage(<FarmPlannerPage />);
    expect(screen.getByText('Convert crop recommendations into a farming execution plan.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /generate plan/i }));
    expect(await screen.findByText('Select a land.')).toBeInTheDocument();
  });

  it('shows generation loading state', () => {
    mocks.generatePlan.isPending = true;
    renderPage(<FarmPlannerPage />);
    expect(screen.getByText('Building execution timeline')).toBeInTheDocument();
  });

  it('renders planner dashboard charts and metrics', () => {
    renderPage(<Routes><Route path="/farm-planner/:id" element={<FarmPlannerDetailPage />} /></Routes>, ['/farm-planner/plan1']);
    expect(screen.getByText('Tomato execution plan')).toBeInTheDocument();
    expect(screen.getByText('Investment, revenue and profit')).toBeInTheDocument();
    expect(screen.getByText('Execution resources')).toBeInTheDocument();
    expect(screen.getByText('Plan versions')).toBeInTheDocument();
  });

  it('renders task Kanban and updates status by drag and drop', () => {
    renderPage(<Routes><Route path="/farm-planner/:id/tasks" element={<FarmTasksPage />} /></Routes>, ['/farm-planner/plan1/tasks']);
    expect(screen.getByText('Farm execution board')).toBeInTheDocument();
    expect(screen.getByText('Land Cleaning')).toBeInTheDocument();
    const card = screen.getByText('Land Cleaning').closest('article');
    const completedColumn = screen.getByTestId('task-column-Completed');
    const dataTransfer = { data: {}, setData(key, value) { this.data[key] = value; }, getData(key) { return this.data[key]; } };
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.drop(completedColumn, { dataTransfer });
    expect(mocks.updateTask.mutate).toHaveBeenCalledWith({ id: 'task1', payload: { status: 'Completed' } });
  });

  it('renders calendar view and events', () => {
    renderPage(<Routes><Route path="/farm-planner/:id/calendar" element={<FarmCalendarPage />} /></Routes>, ['/farm-planner/plan1/calendar']);
    expect(screen.getByText('Calendar and timeline')).toBeInTheDocument();
    expect(screen.getByText('Land Cleaning')).toBeInTheDocument();
  });

  it('renders assistant chat and sends a suggested question', async () => {
    renderPage(<Routes><Route path="/farm-planner/:id/assistant" element={<FarmAssistantPage />} /></Routes>, ['/farm-planner/plan1/assistant']);
    expect(screen.getByText('Ask what your farm needs next')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'What should I do today?' }));
    expect(mocks.assistantChat.mutateAsync).toHaveBeenCalledWith({ farmPlanId: 'plan1', conversationId: null, message: 'What should I do today?' });
    expect(await screen.findByText('Your farm is healthy and on track.')).toBeInTheDocument();
  });

  it('renders insights dashboard and triggers AI analysis', async () => {
    renderPage(<Routes><Route path="/farm-planner/:id/insights" element={<FarmInsightsPage />} /></Routes>, ['/farm-planner/plan1/insights']);
    expect(screen.getByText('Decision support for this farm')).toBeInTheDocument();
    expect(screen.getAllByText('Delayed tasks need attention').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: /ai analyze/i }));
    expect(mocks.analyzeFarm.mutate).toHaveBeenCalledWith({ farmPlanId: 'plan1', focus: 'weekly-advice' });
  });
});
