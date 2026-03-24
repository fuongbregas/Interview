import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Login from './Login';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearAuthError, login } from '../../store/authSlice';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('./Register', () => {
  // eslint-disable-next-line react/prop-types
  return function MockRegister({ onClose }) {
    return (
      <div>
        <p>Mock Register Form</p>
        <button type="button" onClick={onClose}>Close Register</button>
      </div>
    );
  };
});

jest.mock('../../store/authSlice', () => {
  const mockLogin = jest.fn();
  mockLogin.fulfilled = { match: jest.fn() };
  const mockClearAuthError = jest.fn(() => ({ type: 'auth/clearAuthError' }));
  return {
    login: mockLogin,
    clearAuthError: mockClearAuthError,
  };
});

function renderLogin() {
  return render(<Login />);
}

describe('Login', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthError.mockReturnValue({ type: 'auth/clearAuthError' });
    useNavigate.mockReturnValue(mockNavigate);
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation((selector) => selector({ auth: { status: 'idle', error: null } }));
  });

  test('Login button is disabled when form is empty', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toHaveValue('');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
  });

  test('Enable Login button when username and password are filled', () => {
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: '   ' } });
    fireEvent.change(passwordInput, { target: { value: 'secret' } });
    expect(loginButton).toBeDisabled();

    fireEvent.change(usernameInput, { target: { value: 'alice' } });
    expect(loginButton).toBeEnabled();

    fireEvent.change(passwordInput, { target: { value: '   ' } });
    expect(loginButton).toBeDisabled();
  });

  test('Disable Login button when auth status is loading', () => {
    useSelector.mockImplementation((selector) => selector({ auth: { status: 'loading', error: null } }));

    renderLogin();

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });

  test('Navigates to dashboard after logging in', async () => {
    const loginThunkAction = { type: 'auth/login/pending' };
    login.mockReturnValueOnce(loginThunkAction);

    const resultAction = { type: 'auth/login/fulfilled' };
    mockDispatch.mockResolvedValueOnce(resultAction);
    login.fulfilled.match.mockReturnValueOnce(true);

    renderLogin();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ userName: 'alice', password: 'secret' });
      expect(mockDispatch).toHaveBeenCalledWith(loginThunkAction);
    });

    expect(login.fulfilled.match).toHaveBeenCalledWith(resultAction);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  test('Fails navigate when login fails', async () => {
    const loginThunkAction = { type: 'auth/login/pending' };
    const rejectedAction = { type: 'auth/login/rejected' };

    login.mockReturnValueOnce(loginThunkAction);
    mockDispatch.mockResolvedValueOnce(rejectedAction);
    login.fulfilled.match.mockReturnValueOnce(false);

    renderLogin();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(loginThunkAction);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('Error from auth state', () => {
    useSelector.mockImplementation((selector) => selector({ auth: { status: 'failed', error: 'Invalid credentials' } }));

    renderLogin();

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  test('Cancel button is clicked in Register', () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(clearAuthError).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth/clearAuthError' }));
    expect(screen.getByText(/mock register form/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close register/i }));
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});
