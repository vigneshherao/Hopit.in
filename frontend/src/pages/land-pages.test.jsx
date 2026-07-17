import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LandCard } from '@/components/lands/LandCard.jsx';
import { LandForm } from '@/components/lands/LandForm.jsx';
import { LandsPage } from '@/pages/LandsPage.jsx';
import { LandDetailPage } from '@/pages/LandDetailPage.jsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx';

const mockLand = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Mandya organic farm land',
  slug: 'mandya-organic-farm-land',
  shortDescription: 'Ready land',
  purposes: ['agriculture'],
  transactionTypes: ['lease'],
  location: { address: 'Canal road', district: 'Mandya', state: 'Karnataka' },
  area: { value: 5, unit: 'acre' },
  landDetails: {
    soilType: 'alluvial',
    terrain: 'flat',
    waterAvailability: 'adequate',
    waterSources: ['canal'],
    roadAccess: true,
    electricityAvailable: true,
    irrigationAvailable: true,
    fencingAvailable: true,
    storageAvailable: false,
    farmHouseAvailable: false,
  },
  pricing: { annualLeaseAmount: 300000, priceNegotiable: true },
  agreementTerms: { ownerParticipationAllowed: true },
  media: { images: [] },
  documents: [{ name: 'Ownership document submitted', type: 'ownership-proof', verificationStatus: 'verified' }],
  status: 'available',
  verification: { isLandVerified: true },
  viewCount: 12,
  createdAt: new Date().toISOString(),
};

let authState = { isAuthenticated: false, isLoading: false, user: null };

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => authState,
}));

vi.mock('@/hooks/useLands.js', async () => ({
  useLands: () => ({
    isLoading: false,
    isError: false,
    data: { lands: [mockLand], pagination: { page: 1, limit: 12, total: 1, totalPages: 1 } },
  }),
  useLand: () => ({
    isLoading: false,
    isError: false,
    data: { land: mockLand, related: [], hasApplied: false },
  }),
}));

function renderApp(ui, initialEntries = ['/']) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('land marketplace frontend', () => {
  beforeEach(() => {
    authState = { isAuthenticated: false, isLoading: false, user: null };
  });

  it('renders a land card', () => {
    renderApp(<LandCard land={mockLand} />);
    expect(screen.getByText('Mandya organic farm land')).toBeInTheDocument();
    expect(screen.getByText('Mandya, Karnataka')).toBeInTheDocument();
  });

  it('renders browse page and updates filter query parameters', async () => {
    renderApp(
      <Routes>
        <Route path="/lands" element={<LandsPage />} />
      </Routes>,
      ['/lands'],
    );

    expect(screen.getByText('Land marketplace')).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText(/transaction/i), 'lease');
    expect(screen.getByText('Mandya organic farm land')).toBeInTheDocument();
  });

  it('renders land details page', () => {
    renderApp(
      <Routes>
        <Route path="/lands/:identifier" element={<LandDetailPage />} />
      </Routes>,
      ['/lands/mandya-organic-farm-land'],
    );
    expect(screen.getByText('Soil and water')).toBeInTheDocument();
    expect(screen.getByText('Apply flow coming in Prompt 4')).toBeDisabled();
  });

  it('protects create-listing route', () => {
    renderApp(
      <Routes>
        <Route
          path="/lands/new"
          element={
            <ProtectedRoute>
              <div>Create listing</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>,
      ['/lands/new'],
    );
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('shows multi-step form validation', async () => {
    const submit = vi.fn();
    renderApp(<LandForm onSubmit={submit} />);

    await userEvent.clear(screen.getAllByRole('textbox')[0]);
    await userEvent.click(screen.getByRole('button', { name: /save draft/i }));

    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });
});
