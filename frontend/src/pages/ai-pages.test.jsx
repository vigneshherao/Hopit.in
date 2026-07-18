import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AiAnalyzerPage } from '@/pages/AiAnalyzerPage.jsx';
import { AiHistoryPage } from '@/pages/AiHistoryPage.jsx';
import { AiResultsPage } from '@/pages/AiResultsPage.jsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx';

const mocks = vi.hoisted(() => ({
  authState: { isAuthenticated: true, isLoading: false, user: { id: 'u1', role: 'owner' } },
  cropMutation: { isPending: false, error: null, mutateAsync: vi.fn() },
  chatMutation: { isPending: false, error: null, mutateAsync: vi.fn() },
  historyItem: null,
  historyList: [],
  deleteMutation: { mutate: vi.fn() },
}));

vi.mock('@/context/AuthContext.jsx', () => ({ useAuth: () => mocks.authState }));
vi.mock('@/hooks/useLands.js', () => ({
  useMyLands: () => ({ data: { lands: [{ _id: 'land1', title: 'Mandya farm', location: { district: 'Mandya', state: 'Karnataka' }, area: { value: 5, unit: 'acre' }, landDetails: { soilType: 'loamy' } }] } }),
}));
vi.mock('@/hooks/useAI.js', () => ({
  useCropRecommendation: () => mocks.cropMutation,
  useAIChat: () => mocks.chatMutation,
  useAIHistoryItem: () => ({ isLoading: false, data: { history: mocks.historyItem } }),
  useAIHistory: () => ({ isLoading: false, data: { items: mocks.historyList } }),
  useDeleteAIHistory: () => mocks.deleteMutation,
}));

function renderPage(ui, initialEntries = ['/']) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

function recommendationHistory() {
  return {
    _id: 'hist1',
    feature: 'crop-recommendation',
    createdAt: new Date().toISOString(),
    landId: { _id: 'land1', title: 'Mandya farm', slug: 'mandya-farm' },
    response: {
      summary: 'Tomato is the strongest recommendation for this land.',
      topRecommendedCrop: 'Tomato',
      recommendations: ['Tomato', 'Okra', 'Groundnut', 'Marigold', 'Finger millet'].map((crop, index) => ({
        cropName: crop,
        suitabilityScore: 90 - index,
        reason: `${crop} fits the land.`,
        estimatedDuration: '100 days',
        waterRequirement: 'medium',
        investmentRange: { minimum: 40000, maximum: 90000 },
        expectedRevenueRange: { minimum: 120000, maximum: 220000 },
        expectedProfitRange: { minimum: 60000, maximum: 130000 },
        roiRange: { minimum: 45, maximum: 90 },
        marketDemand: 'high',
        majorRisks: ['Pests'],
        soilPreparation: ['Compost'],
        irrigationPlan: ['Drip irrigation'],
        fertilizerPlan: ['NPK'],
        labourRequirement: '2 workers per acre',
      })),
    },
  };
}

describe('AI analyzer frontend', () => {
  beforeEach(() => {
    mocks.authState.isAuthenticated = true;
    mocks.authState.isLoading = false;
    mocks.cropMutation.isPending = false;
    mocks.cropMutation.error = null;
    mocks.cropMutation.mutateAsync.mockReset();
    mocks.chatMutation.mutateAsync.mockReset();
    mocks.historyItem = recommendationHistory();
    mocks.historyList = [recommendationHistory()];
  });

  it('protects analyzer route', () => {
    mocks.authState.isAuthenticated = false;
    renderPage(
      <Routes>
        <Route path="/ai-analyzer" element={<ProtectedRoute><AiAnalyzerPage /></ProtectedRoute>} />
        <Route path="/login" element={<div>Login route</div>} />
      </Routes>,
      ['/ai-analyzer'],
    );
    expect(screen.getByText('Login route')).toBeInTheDocument();
  });

  it('renders analyzer form and conditional validation', async () => {
    renderPage(<AiAnalyzerPage />);
    expect(screen.getByText('Turn land conditions into crop and profit recommendations.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /soil & location/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findAllByText('Required without a selected land.')).not.toHaveLength(0);
  });

  it('shows loading animation stage', () => {
    mocks.cropMutation.isPending = true;
    renderPage(<AiAnalyzerPage />);
    expect(screen.getByText('Analysing soil')).toBeInTheDocument();
  });

  it('renders provider error state', () => {
    mocks.cropMutation.error = { message: 'AI provider is not configured.' };
    renderPage(<AiAnalyzerPage />);
    expect(screen.getByText('AI provider is not configured.')).toBeInTheDocument();
  });

  it('renders results with crop comparison and chat', async () => {
    mocks.chatMutation.mutateAsync.mockResolvedValue({ response: { answer: 'Tomato is suitable because water and market demand are strong.' } });
    renderPage(<Routes><Route path="/ai-results/:id" element={<AiResultsPage />} /></Routes>, ['/ai-results/hist1']);
    expect(screen.getAllByText('Tomato').length).toBeGreaterThan(0);
    expect(screen.getByText('Crop comparison')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/ask what to cultivate/i), 'Why tomato?');
    await userEvent.click(screen.getByRole('button', { name: /send ai chat/i }));
    expect(await screen.findByText(/Tomato is suitable/)).toBeInTheDocument();
  });

  it('renders AI history page', () => {
    renderPage(<AiHistoryPage />);
    expect(screen.getByText('Saved land intelligence')).toBeInTheDocument();
    expect(screen.getByText(/Mandya farm/)).toBeInTheDocument();
  });
});
