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
import { WorkersPage } from '@/pages/WorkersPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'lands', element: <LandsPage /> },
      { path: 'lands/:id', element: <LandDetailPage /> },
      { path: 'workers', element: <WorkersPage /> },
      { path: 'ai', element: <AiPage /> },
      { path: 'not-found', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
