import { createBrowserRouter } from 'react-router-dom';
import { ActivityPage } from '@/pages/ActivityPage.jsx';
import { AppLayout } from '@/layouts/AppLayout.jsx';
import { AgreementPage } from '@/pages/AgreementPage.jsx';
import { AiAnalyzerPage } from '@/pages/AiAnalyzerPage.jsx';
import { AiHistoryPage } from '@/pages/AiHistoryPage.jsx';
import { AiPage } from '@/pages/AiPage.jsx';
import { AiResultsPage } from '@/pages/AiResultsPage.jsx';
import { ApplicationDetailPage } from '@/pages/ApplicationDetailPage.jsx';
import { DashboardPage } from '@/pages/DashboardPage.jsx';
import { FarmJobCreatePage } from '@/pages/FarmJobCreatePage.jsx';
import { FarmJobDetailPage } from '@/pages/FarmJobDetailPage.jsx';
import { FarmJobsPage } from '@/pages/FarmJobsPage.jsx';
import { FarmAssistantPage } from '@/pages/FarmAssistantPage.jsx';
import { FarmManagementDetailPage } from '@/pages/FarmManagementDetailPage.jsx';
import { FarmManagementPage } from '@/pages/FarmManagementPage.jsx';
import { FarmCalendarPage } from '@/pages/FarmCalendarPage.jsx';
import { FarmDiseasePage } from '@/pages/FarmDiseasePage.jsx';
import { FarmInsightsPage } from '@/pages/FarmInsightsPage.jsx';
import { FarmMonitoringPage } from '@/pages/FarmMonitoringPage.jsx';
import { FarmPlannerDetailPage } from '@/pages/FarmPlannerDetailPage.jsx';
import { FarmPlannerPage } from '@/pages/FarmPlannerPage.jsx';
import { FarmProgressReportCreatePage } from '@/pages/FarmProgressReportCreatePage.jsx';
import { FarmTasksPage } from '@/pages/FarmTasksPage.jsx';
import { FarmWeatherPage } from '@/pages/FarmWeatherPage.jsx';
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
import { MyFarmJobsPage } from '@/pages/MyFarmJobsPage.jsx';
import { MyJobApplicationsPage } from '@/pages/MyJobApplicationsPage.jsx';
import { MessagesPage } from '@/pages/MessagesPage.jsx';
import { NotFoundPage } from '@/pages/NotFoundPage.jsx';
import { NotificationsPage } from '@/pages/NotificationsPage.jsx';
import { ProfilePage } from '@/pages/ProfilePage.jsx';
import { ReceivedApplicationsPage } from '@/pages/ReceivedApplicationsPage.jsx';
import { RegisterPage } from '@/pages/RegisterPage.jsx';
import { RoleDashboardPage } from '@/pages/RoleDashboardPage.jsx';
import { WorkerBookingDetailPage } from '@/pages/WorkerBookingDetailPage.jsx';
import { WorkerBookingsPage } from '@/pages/WorkerBookingsPage.jsx';
import { WorkerDashboardPage } from '@/pages/WorkerDashboardPage.jsx';
import { WorkerDetailPage } from '@/pages/WorkerDetailPage.jsx';
import { WorkerProfileEditPage } from '@/pages/WorkerProfileEditPage.jsx';
import { WorkerProfilePage } from '@/pages/WorkerProfilePage.jsx';
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
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'messages/:conversationId',
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'support/messages',
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'activity',
        element: (
          <ProtectedRoute>
            <ActivityPage />
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
      {
        path: 'agreements/:agreementId/chat',
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      { path: 'workers', element: <WorkersPage /> },
      { path: 'workers/:id', element: <WorkerDetailPage /> },
      {
        path: 'worker/profile',
        element: (
          <RoleRoute allowedRoles={['worker', 'admin']}>
            <WorkerProfilePage />
          </RoleRoute>
        ),
      },
      {
        path: 'worker/profile/edit',
        element: (
          <RoleRoute allowedRoles={['worker', 'admin']}>
            <WorkerProfileEditPage />
          </RoleRoute>
        ),
      },
      {
        path: 'worker/dashboard',
        element: (
          <RoleRoute allowedRoles={['worker', 'admin']}>
            <WorkerDashboardPage />
          </RoleRoute>
        ),
      },
      { path: 'farm-jobs', element: <FarmJobsPage /> },
      {
        path: 'farm-jobs/new',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <FarmJobCreatePage />
          </RoleRoute>
        ),
      },
      {
        path: 'farm-jobs/:id/edit',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <FarmJobCreatePage />
          </RoleRoute>
        ),
      },
      { path: 'farm-jobs/:identifier', element: <FarmJobDetailPage /> },
      {
        path: 'my-farm-jobs',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <MyFarmJobsPage />
          </RoleRoute>
        ),
      },
      {
        path: 'my-job-applications',
        element: (
          <RoleRoute allowedRoles={['worker', 'admin']}>
            <MyJobApplicationsPage />
          </RoleRoute>
        ),
      },
      {
        path: 'worker-bookings',
        element: (
          <ProtectedRoute>
            <WorkerBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'worker-bookings/:id',
        element: (
          <ProtectedRoute>
            <WorkerBookingDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-management',
        element: (
          <ProtectedRoute>
            <FarmManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-management/:id',
        element: (
          <ProtectedRoute>
            <FarmManagementDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-management/:id/reports/new',
        element: (
          <RoleRoute allowedRoles={['worker', 'admin']}>
            <FarmProgressReportCreatePage />
          </RoleRoute>
        ),
      },
      {
        path: 'farm-planner',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <FarmPlannerPage />
          </RoleRoute>
        ),
      },
      {
        path: 'farm-planner/:id',
        element: (
          <RoleRoute allowedRoles={['owner', 'admin']}>
            <FarmPlannerDetailPage />
          </RoleRoute>
        ),
      },
      {
        path: 'farm-planner/:id/tasks',
        element: (
          <ProtectedRoute>
            <FarmTasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-planner/:farmPlanId/chat',
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks/:taskId/chat',
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-planner/:id/calendar',
        element: (
          <ProtectedRoute>
            <FarmCalendarPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-planner/:id/assistant',
        element: (
          <ProtectedRoute>
            <FarmAssistantPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-planner/:id/insights',
        element: (
          <ProtectedRoute>
            <FarmInsightsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-planner/:id/disease',
        element: (
          <ProtectedRoute>
            <FarmDiseasePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-planner/:id/weather',
        element: (
          <ProtectedRoute>
            <FarmWeatherPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-planner/:id/weather/forecast',
        element: (
          <ProtectedRoute>
            <FarmWeatherPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-planner/:id/weather/alerts',
        element: (
          <ProtectedRoute>
            <FarmWeatherPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'farm-planner/:id/weather/insights',
        element: (
          <ProtectedRoute>
            <FarmWeatherPage />
          </ProtectedRoute>
        ),
      },
      ...['monitoring', 'monitoring/map', 'monitoring/scenes', 'monitoring/drone-surveys', 'monitoring/drone-surveys/new', 'monitoring/zones', 'monitoring/observations', 'monitoring/comparison', 'monitoring/reports'].map((path) => ({
        path: `farm-planner/:farmPlanId/${path}`,
        element: (
          <ProtectedRoute>
            <FarmMonitoringPage />
          </ProtectedRoute>
        ),
      })),
      {
        path: 'farm-planner/:farmPlanId/monitoring/scenes/:sceneId',
        element: (
          <ProtectedRoute>
            <FarmMonitoringPage />
          </ProtectedRoute>
        ),
      },
      { path: 'ai', element: <AiPage /> },
      {
        path: 'ai-analyzer',
        element: (
          <ProtectedRoute>
            <AiAnalyzerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'ai-results/:id',
        element: (
          <ProtectedRoute>
            <AiResultsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'ai-history',
        element: (
          <ProtectedRoute>
            <AiHistoryPage />
          </ProtectedRoute>
        ),
      },
      { path: 'not-found', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
