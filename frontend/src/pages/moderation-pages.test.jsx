import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModerationDetailPage, ModerationQueuePage } from '@/pages/ModerationPages.jsx';

const mocks = vi.hoisted(() => ({
  queue: [
    {
      _id: 'mod1',
      status: 'pending-review',
      priority: 'high',
      flagsCount: 1,
      landId: {
        _id: 'land1',
        slug: 'demo-land',
        title: 'Demo moderation land',
        location: { district: 'Mandya', state: 'Karnataka' },
        area: { value: 5, unit: 'acre' },
        transactionTypes: ['lease'],
        media: { images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'] },
      },
    },
  ],
  detail: {
    moderation: {
      _id: 'mod1',
      status: 'under-verification',
      priority: 'high',
      checklist: [{ item: 'owner-name', result: 'pass' }, { item: 'ownership-documents', result: 'needs-review' }],
      documentReviews: [{ type: 'ownership-certificate', name: 'Ownership proof', reviewStatus: 'pending', ocrStatus: 'not-started' }],
      timeline: [{ event: 'submitted', message: 'Submitted for moderation.', createdAt: new Date().toISOString() }],
      landId: {
        title: 'Demo moderation land',
        description: 'A land listing ready for moderation.',
        status: 'pending-verification',
        location: { district: 'Mandya', state: 'Karnataka' },
        area: { value: 5, unit: 'acre' },
        landDetails: { waterAvailability: 'adequate' },
        media: { images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'] },
        viewCount: 12,
      },
    },
    decisions: [],
    versions: [{ _id: 'v1', version: 1, reason: 'Initial snapshot', createdAt: new Date().toISOString(), diff: [] }],
    flags: [],
  },
  mutate: vi.fn(),
}));

vi.mock('@/hooks/useModeration.js', () => ({
  useModerationQueue: () => ({ data: { queue: mocks.queue }, isLoading: false, isError: false }),
  useModeration: () => ({ data: mocks.detail, isLoading: false, isError: false }),
  useAssignModerator: () => ({ mutate: mocks.mutate, isPending: false }),
  useApproveListing: () => ({ mutate: mocks.mutate, isPending: false }),
  useRejectListing: () => ({ mutate: mocks.mutate, isPending: false }),
  useRequestRevision: () => ({ mutate: mocks.mutate, isPending: false }),
  useEscalateListing: () => ({ mutate: mocks.mutate, isPending: false }),
}));

function renderPage(ui, initialEntries = ['/admin/moderation']) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('moderation frontend pages', () => {
  beforeEach(() => mocks.mutate.mockReset());

  it('renders queue cards', () => {
    renderPage(<ModerationQueuePage />);
    expect(screen.getByText('Moderation queue')).toBeInTheDocument();
    expect(screen.getByText('Demo moderation land')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('renders review detail panels', () => {
    renderPage(<Routes><Route path="/admin/moderation/:moderationId" element={<ModerationDetailPage />} /></Routes>, ['/admin/moderation/mod1']);
    expect(screen.getAllByText('Demo moderation land').length).toBeGreaterThan(0);
    expect(screen.getByText('Checklist')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Version history')).toBeInTheDocument();
  });
});
