import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../lib/api', () => ({
  apiFetch: vi.fn(),
  setStoredAuth: vi.fn(),
  getStoredToken: vi.fn(() => null),
  getStoredUser: vi.fn(() => null),
  clearStoredAuth: vi.fn(),
}));

import LoginPage from './page';
import { apiFetch, setStoredAuth } from '../../lib/api';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('submits credentials and stores auth on success', async () => {
    const mockRes = {
      id: '1', email: 'test@test.com', name: 'Test', role: 'BUYER',
      accessToken: 'tok', refreshToken: 'ref',
    };
    vi.mocked(apiFetch).mockResolvedValueOnce(mockRes);

    render(<LoginPage />);

    const emailInput = screen.getByRole('textbox');
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: { email: 'test@test.com', password: 'Password123!' },
      });
    });

    expect(setStoredAuth).toHaveBeenCalledWith('tok', 'ref', {
      id: '1', email: 'test@test.com', name: 'Test', role: 'BUYER',
    });
  });

  it('shows error on failed login', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<LoginPage />);

    const emailInput = screen.getByRole('textbox');
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'bad@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows link to registration', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });
});
