import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationBell } from '@/components/realtime/NotificationBell.jsx';
import { ActivityPage } from '@/pages/ActivityPage.jsx';
import { NotificationsPage } from '@/pages/NotificationsPage.jsx';

const mocks = vi.hoisted(() => ({
  authState: { isAuthenticated: true, isLoading: false, user: { id: 'user1', role: 'owner' } },
  notifications: null,
  unread: null,
  preferences: null,
  activities: null,
  readNotification: { mutate: vi.fn() },
  readAll: { isPending: false, mutate: vi.fn() },
  deleteNotification: { mutate: vi.fn() },
  updatePreferences: { isPending: false, mutate: vi.fn() },
}));

vi.mock('@/context/AuthContext.jsx', () => ({ useAuth: () => mocks.authState }));
vi.mock('@/hooks/useSocket.js', () => ({
  useNotificationsSocket: vi.fn(),
  useActivitySocket: vi.fn(),
}));
vi.mock('@/hooks/useRealtime.js', () => ({
  useNotifications: () => ({ isLoading: false, isError: false, data: mocks.notifications }),
  useUnreadNotifications: () => ({ isLoading: false, isError: false, data: mocks.unread }),
  useNotificationPreferences: () => ({ isLoading: false, data: mocks.preferences }),
  useReadNotification: () => mocks.readNotification,
  useReadAllNotifications: () => mocks.readAll,
  useDeleteNotification: () => mocks.deleteNotification,
  useUpdateNotificationPreferences: () => mocks.updatePreferences,
  useActivities: () => ({ isLoading: false, isError: false, data: mocks.activities }),
}));

function renderPage(ui, initialEntries = ['/']) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('realtime frontend pages', () => {
  beforeEach(() => {
    mocks.notifications = {
      notifications: [{ _id: 'n1', title: 'Task assigned', message: 'Irrigation starts tomorrow.', type: 'task', priority: 'high', isRead: false, createdAt: new Date().toISOString() }],
      unreadCount: 1,
    };
    mocks.unread = mocks.notifications;
    mocks.preferences = { preferences: { inApp: true, email: true, push: true, taskNotifications: true, weatherAlerts: true, diseaseAlerts: true, agreementNotifications: true, adminMessages: true } };
    mocks.activities = { activities: [{ _id: 'a1', entityType: 'farm', action: 'created-task', title: 'Created irrigation task', description: 'Irrigation scheduled.', createdAt: new Date().toISOString() }] };
    mocks.readNotification.mutate.mockReset();
    mocks.readAll.mutate.mockReset();
    mocks.deleteNotification.mutate.mockReset();
    mocks.updatePreferences.mutate.mockReset();
  });

  it('renders notification center and read action', async () => {
    renderPage(<Routes><Route path="/notifications" element={<NotificationsPage />} /></Routes>, ['/notifications']);
    expect(screen.getByText('Live updates across Hopt It')).toBeInTheDocument();
    expect(screen.getAllByText('Task assigned').length).toBeGreaterThan(0);
    await userEvent.click(screen.getAllByRole('button', { name: /read/i }).at(-1));
    expect(mocks.readNotification.mutate).toHaveBeenCalledWith('n1');
  });

  it('renders notification bell unread count', async () => {
    renderPage(<NotificationBell />);
    await userEvent.click(screen.getByLabelText('Open notifications'));
    expect(screen.getByText('Live updates')).toBeInTheDocument();
    expect(screen.getByText('Task assigned')).toBeInTheDocument();
  });

  it('renders activity timeline', () => {
    renderPage(<Routes><Route path="/activity" element={<ActivityPage />} /></Routes>, ['/activity']);
    expect(screen.getByText('Every farm event, in order')).toBeInTheDocument();
    expect(screen.getByText('Created irrigation task')).toBeInTheDocument();
  });
});
