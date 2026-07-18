import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FarmPlannerDetailPage } from '@/pages/FarmPlannerDetailPage.jsx';
import { FarmPlannerPage } from '@/pages/FarmPlannerPage.jsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx';

const mocks = vi.hoisted(() => ({
  authState: { isAuthenticated: true, isLoading: false, user: { role: 'owner' } },
  generatePlan: { isPending: false, error: null, mutateAsync: vi.fn() },
  updatePlan: { mutate: vi.fn() },
  recalculatePlan: { isPending: false, mutate: vi.fn() },
  plans: [],
  dashboard: null,
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
});
