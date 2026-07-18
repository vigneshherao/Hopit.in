import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLayout } from '@/layouts/AdminLayout.jsx';
import { AdminDashboardPage, AdminUserDetailPage, AdminUsersPage, AdminVerificationsPage } from '@/pages/AdminPages.jsx';
import { RoleRoute } from '@/routes/RoleRoute.jsx';

const mocks = vi.hoisted(() => ({
  authState: { isAuthenticated: true, isLoading: false, user: { id: 'admin1', role: 'admin' } },
  overview: {
    users: { total: 12, active: 10, newToday: 1, newThisWeek: 4 },
    lands: { published: 6 },
    alerts: { pendingVerifications: 2, failedLogins: 1 },
    workers: { verified: 3 },
  },
  users: [{ id: 'user1', name: 'Owner One', role: 'owner', isActive: true, createdAt: new Date().toISOString() }],
  userDetail: {
    user: { id: 'user1', name: 'Owner One', role: 'owner', isActive: true, createdAt: new Date().toISOString() },
    verifications: [],
    notes: [],
    sessions: [],
  },
  verifications: [{ _id: 'ver1', verificationType: 'identity', status: 'pending', userId: { name: 'Owner One' } }],
}));

vi.mock('@/context/AuthContext.jsx', () => ({ useAuth: () => mocks.authState }));
vi.mock('@/hooks/useAdmin.js', () => ({
  useAdminMe: () => ({ data: { profile: { displayName: 'Admin One', adminCode: 'ADM-1' }, roles: [{ id: 'r1', name: 'Super Admin' }], permissions: ['users.view'], preferences: { digestFrequency: 'instant', channels: ['in-app'], categories: {} }, security: { require2fa: false, impersonationEnabled: false } } }),
  useAdminOverview: () => ({ data: mocks.overview, isLoading: false, isError: false }),
  useAdminUsers: () => ({ data: { users: mocks.users }, isLoading: false, isError: false }),
  useAdminUser: () => ({ data: mocks.userDetail, isLoading: false, isError: false }),
  useChangeAdminUserStatus: () => ({ mutate: vi.fn(), isPending: false }),
  useAdminVerifications: () => ({ data: { verifications: mocks.verifications }, isLoading: false, isError: false }),
  useAdminVerification: () => ({ data: { verification: mocks.verifications[0] }, isLoading: false, isError: false }),
  useUpdateAdminVerification: () => ({ mutate: vi.fn(), isPending: false }),
  useAdminAccounts: () => ({ data: { admins: [] }, isLoading: false, isError: false }),
  useAdminRoles: () => ({ data: { roles: [] }, isLoading: false, isError: false }),
  useAdminPermissions: () => ({ data: { permissions: [] }, isLoading: false, isError: false }),
  useAdminAuditLogs: () => ({ data: { logs: [] }, isLoading: false, isError: false }),
  useAdminSavedViews: () => ({ data: { views: [] }, isLoading: false, isError: false }),
}));

function renderPage(ui, initialEntries = ['/admin']) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('admin frontend pages', () => {
  beforeEach(() => {
    mocks.authState.isAuthenticated = true;
    mocks.authState.user = { id: 'admin1', role: 'admin' };
  });

  it('protects admin layout by role', () => {
    mocks.authState.user = { id: 'farmer1', role: 'farmer' };
    renderPage(
      <Routes>
        <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminLayout /></RoleRoute>} />
        <Route path="/dashboard" element={<div>Dashboard route</div>} />
      </Routes>,
    );
    expect(screen.getByText('Dashboard route')).toBeInTheDocument();
  });

  it('renders admin dashboard metrics', () => {
    renderPage(<AdminDashboardPage />);
    expect(screen.getByText('Admin overview')).toBeInTheDocument();
    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders users page with directory rows', () => {
    renderPage(<AdminUsersPage />);
    expect(screen.getByText('User directory')).toBeInTheDocument();
    expect(screen.getByText('Owner One')).toBeInTheDocument();
  });

  it('renders user detail actions and empty sections', () => {
    renderPage(<Routes><Route path="/admin/users/:userId" element={<AdminUserDetailPage />} /></Routes>, ['/admin/users/user1']);
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suspend' })).toBeInTheDocument();
    expect(screen.getByText('No verification records')).toBeInTheDocument();
  });

  it('renders verification queue', () => {
    renderPage(<AdminVerificationsPage />);
    expect(screen.getByText('Verification queue')).toBeInTheDocument();
    expect(screen.getByText('identity')).toBeInTheDocument();
  });
});
