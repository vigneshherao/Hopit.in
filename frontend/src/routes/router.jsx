import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout.jsx';
import { AiPage } from '@/pages/AiPage.jsx';
import { DashboardPage } from '@/pages/DashboardPage.jsx';
import { HomePage } from '@/pages/HomePage.jsx';
import { LandDetailPage } from '@/pages/LandDetailPage.jsx';
import { LandsPage } from '@/pages/LandsPage.jsx';
import { LoginPage } from '@/pages/LoginPage.jsx';
import { NotFoundPage } from '@/pages/NotFoundPage.jsx';
import { ProfilePage } from '@/pages/ProfilePage.jsx';
import { RegisterPage } from '@/pages/RegisterPage.jsx';
import { RoleDashboardPage } from '@/pages/RoleDashboardPage.jsx';
import { WorkersPage } from '@/pages/WorkersPage.jsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx';
import { RoleRoute } from '@/routes/RoleRoute.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/owner',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <RoleDashboardPage role="owner" />
          </RoleRoute>
        ),
      },
      {
        path: 'dashboard/farmer',
        element: (
          <RoleRoute allowedRoles={['farmer', 'admin']}>
            <RoleDashboardPage role="farmer" />
          </RoleRoute>
        ),
      },
      {
        path: 'dashboard/worker',
        element: (
          <RoleRoute allowedRoles={['worker', 'admin']}>
            <RoleDashboardPage role="worker" />
          </RoleRoute>
        ),
      },
      {
        path: 'dashboard/admin',
        element: (
          <RoleRoute allowedRoles={['admin']}>
            <RoleDashboardPage role="admin" />
          </RoleRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: 'lands', element: <LandsPage /> },
      { path: 'lands/:id', element: <LandDetailPage /> },
      { path: 'workers', element: <WorkersPage /> },
      { path: 'ai', element: <AiPage /> },
      { path: 'not-found', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
