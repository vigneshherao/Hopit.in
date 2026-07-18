import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NegotiationTimeline } from '@/components/applications/NegotiationTimeline.jsx';
import { AgreementPage } from '@/pages/AgreementPage.jsx';
import { LandApplyPage } from '@/pages/LandApplyPage.jsx';
import { MyApplicationsPage } from '@/pages/MyApplicationsPage.jsx';
import { ReceivedApplicationsPage } from '@/pages/ReceivedApplicationsPage.jsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx';

let authState = { isAuthenticated: true, isLoading: false, user: { id: 'farmer1', role: 'farmer' } };
const createApplication = vi.fn();

const land = {
  _id: 'land1',
  title: 'Mandya lease land',
  slug: 'mandya-lease-land',
  ownerId: 'owner1',
  transactionTypes: ['lease', 'rent'],
  purposes: ['agriculture'],
  location: { district: 'Mandya', state: 'Karnataka' },
};

vi.mock('@/context/AuthContext.jsx', () => ({ useAuth: () => authState }));
vi.mock('@/hooks/useLands.js', () => ({
  useLand: () => ({ isLoading: false, data: { land } }),
}));
vi.mock('@/hooks/useApplications.js', () => ({
  useCreateApplication: () => ({ mutateAsync: createApplication }),
  useMyApplications: () => ({
    data: { applications: [{ _id: 'app1', status: 'submitted', applicationType: 'lease', proposal: { title: 'Lease proposal' }, negotiation: { currentRound: 1 }, landId: land }] },
  }),
  useReceivedApplications: () => ({
    data: { applications: [{ _id: 'app1', status: 'submitted', applicationType: 'lease', proposal: { title: 'Lease proposal' }, applicantId: { name: 'Farmer' }, landId: land }] },
  }),
  useApplicationStatistics: () => ({ data: { statistics: { total: 1, submitted: 1, shortlisted: 0, accepted: 0 } } }),
  useSubmitApplication: () => ({ mutate: vi.fn() }),
  useWithdrawApplication: () => ({ mutate: vi.fn() }),
  useReviewApplication: () => ({ mutate: vi.fn() }),
  useShortlistApplication: () => ({ mutate: vi.fn() }),
  useAgreement: () => ({
    isLoading: false,
    data: {
      agreement: {
        _id: 'agr1',
        status: 'review-pending',
        version: 1,
        terms: { landTitle: 'Mandya lease land', landLocation: 'Mandya', landAreaValue: 5, landAreaUnit: 'acre', ownerParticipation: false },
        generatedSummary: 'Draft summary',
        legalDisclaimer: 'This is a platform-generated draft summary and is not legal advice or a legally executed agreement.',
      },
    },
  }),
  useConfirmAgreement: () => ({ mutate: vi.fn() }),
  useRequestAgreementChanges: () => ({ mutate: vi.fn() }),
}));

function renderApp(ui, initialEntries = ['/']) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('application workflow frontend', () => {
  beforeEach(() => {
    createApplication.mockResolvedValue({ application: { _id: 'app1' } });
    authState = { isAuthenticated: true, isLoading: false, user: { id: 'farmer1', role: 'farmer' } };
  });

  it('shows compatible application types on apply page', () => {
    renderApp(<Routes><Route path="/lands/:identifier/apply" element={<LandApplyPage />} /></Routes>, ['/lands/mandya-lease-land/apply']);
    expect(screen.getByText('Apply for Mandya lease land')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Lease' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Rent' })).toBeInTheDocument();
  });

  it('validates and submits the application form', async () => {
    renderApp(<Routes><Route path="/lands/:identifier/apply" element={<LandApplyPage />} /></Routes>, ['/lands/mandya-lease-land/apply']);
    await userEvent.type(screen.getByLabelText(/proposal title/i), 'Lease proposal');
    await userEvent.type(screen.getByLabelText(/summary/i), 'A serious lease proposal for vegetable farming.');
    await userEvent.type(screen.getByLabelText(/intended use/i), 'Vegetable farming');
    await userEvent.type(screen.getByLabelText(/duration months/i), '24');
    await userEvent.type(screen.getByLabelText(/annual lease/i), '360000');
    await userEvent.click(screen.getByRole('button', { name: /submit application/i }));
    expect(createApplication).toHaveBeenCalled();
  });

  it('renders my and received application pages', () => {
    renderApp(<MyApplicationsPage />);
    expect(screen.getByText('My applications')).toBeInTheDocument();
    expect(screen.getByText('Lease proposal')).toBeInTheDocument();
    renderApp(<ReceivedApplicationsPage />);
    expect(screen.getByText('Received applications')).toBeInTheDocument();
  });

  it('renders negotiation timeline controls', () => {
    renderApp(<NegotiationTimeline negotiations={[{ round: 1, action: 'counter-offer', createdByRole: 'owner', proposedTerms: { monthlyRent: 10000 } }]} canAccept onAccept={vi.fn()} onCounter={vi.fn()} />);
    expect(screen.getByText(/Round 1/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept terms/i })).toBeEnabled();
  });

  it('renders agreement disclaimer and protects anonymous routes', () => {
    renderApp(<Routes><Route path="/agreements/:id" element={<AgreementPage />} /></Routes>, ['/agreements/agr1']);
    expect(screen.getByText(/not legal advice/i)).toBeInTheDocument();
    authState = { isAuthenticated: false, isLoading: false, user: null };
    renderApp(
      <Routes>
        <Route path="/private" element={<ProtectedRoute><div>Private</div></ProtectedRoute>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>,
      ['/private'],
    );
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
