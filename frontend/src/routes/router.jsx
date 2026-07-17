import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout.jsx';
import { AgreementPage } from '@/pages/AgreementPage.jsx';
import { AiPage } from '@/pages/AiPage.jsx';
import { ApplicationDetailPage } from '@/pages/ApplicationDetailPage.jsx';
import { DashboardPage } from '@/pages/DashboardPage.jsx';
import { HomePage } from '@/pages/HomePage.jsx';
import { LandApplyPage } from '@/pages/LandApplyPage.jsx';
import { LandCreatePage } from '@/pages/LandCreatePage.jsx';
import { LandDetailPage } from '@/pages/LandDetailPage.jsx';
import { LandEditPage } from '@/pages/LandEditPage.jsx';
import { LandsPage } from '@/pages/LandsPage.jsx';
import { LoginPage } from '@/pages/LoginPage.jsx';
import { MyLandDetailPage } from '@/pages/MyLandDetailPage.jsx';
import { MyLandsPage } from '@/pages/MyLandsPage.jsx';
import { MyApplicationsPage } from '@/pages/MyApplicationsPage.jsx';
import { NotFoundPage } from '@/pages/NotFoundPage.jsx';
import { ProfilePage } from '@/pages/ProfilePage.jsx';
import { ReceivedApplicationsPage } from '@/pages/ReceivedApplicationsPage.jsx';
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
      {
        path: 'lands/new',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <LandCreatePage />
          </RoleRoute>
        ),
      },
      {
        path: 'lands/:id/edit',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <LandEditPage />
          </RoleRoute>
        ),
      },
      {
        path: 'lands/:identifier/apply',
        element: (
          <RoleRoute allowedRoles={['farmer', 'owner', 'admin']}>
            <LandApplyPage />
          </RoleRoute>
        ),
      },
      { path: 'lands/:identifier', element: <LandDetailPage /> },
      {
        path: 'my-lands',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <MyLandsPage />
          </RoleRoute>
        ),
      },
      {
        path: 'my-lands/:id',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <MyLandDetailPage />
          </RoleRoute>
        ),
      },
      {
        path: 'my-applications',
        element: (
          <RoleRoute allowedRoles={['farmer', 'owner', 'admin']}>
            <MyApplicationsPage />
          </RoleRoute>
        ),
      },
      {
        path: 'my-applications/:id',
        element: (
          <RoleRoute allowedRoles={['farmer', 'owner', 'admin']}>
            <ApplicationDetailPage />
          </RoleRoute>
        ),
      },
      {
        path: 'received-applications',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <ReceivedApplicationsPage />
          </RoleRoute>
        ),
      },
      {
        path: 'received-applications/:id',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <ApplicationDetailPage />
          </RoleRoute>
        ),
      },
      {
        path: 'agreements/:id',
        element: (
          <ProtectedRoute>
            <AgreementPage />
          </ProtectedRoute>
        ),
      },
      { path: 'workers', element: <WorkersPage /> },
      { path: 'ai', element: <AiPage /> },
      { path: 'not-found', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
