import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx';
import { RoleRoute } from '@/routes/RoleRoute.jsx';

const authState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => authState,
}));

describe('protected routes', () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.isLoading = false;
    authState.user = null;
  });

  it('redirects unauthenticated users to login', () => {
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Private page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login route')).toBeInTheDocument();
  });

  it('rejects users without the required role', () => {
    authState.isAuthenticated = true;
    authState.user = { name: 'Demo Worker', role: 'worker' };

    render(
      <MemoryRouter initialEntries={['/owner']}>
        <Routes>
          <Route
            path="/owner"
            element={
              <RoleRoute allowedRoles={['owner']}>
                <div>Owner page</div>
              </RoleRoute>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard route')).toBeInTheDocument();
  });
});
