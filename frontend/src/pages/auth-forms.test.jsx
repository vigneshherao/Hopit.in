import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '@/pages/LoginPage.jsx';
import { RegisterPage } from '@/pages/RegisterPage.jsx';

const authState = {
  isAuthenticated: false,
  user: null,
  login: vi.fn(),
  register: vi.fn(),
};

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => authState,
}));

function renderWithRouter(component) {
  return render(<MemoryRouter>{component}</MemoryRouter>);
}

describe('auth forms', () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.user = null;
    authState.login = vi.fn();
    authState.register = vi.fn();
  });

  it('validates the login form', async () => {
    renderWithRouter(<LoginPage />);

    await userEvent.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    expect(authState.login).not.toHaveBeenCalled();
  });

  it('validates the registration form', async () => {
    renderWithRouter(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/full name/i), 'A');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'invalid');
    await userEvent.type(screen.getByLabelText(/phone/i), '123');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'weak');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required.')).toBeInTheDocument();
    });
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid Indian mobile number.')).toBeInTheDocument();
    expect(authState.register).not.toHaveBeenCalled();
  });
});
