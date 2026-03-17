import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavBar from './NavBar';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../store/authSlice', () => ({
  logout: jest.fn(),
  selectAuth: jest.fn(),
}));

describe('NavBar', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('Not rendered if auth is null', () => {
    useSelector.mockReturnValue(null);

    const { container } = render(<NavBar />);
    expect(container.firstChild).toBeNull();
  });

  test('Navigates to /profile when Profile button clicked', async () => {
    useSelector.mockReturnValue({ userId: 1 });

    render(<NavBar />);
    await userEvent.click(screen.getByRole('button', { name: /profile/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('Logout + navigates to /login when Logout button clicked', async () => {
    useSelector.mockReturnValue({ userId: 1 });
    logout.mockReturnValue({ type: 'auth/logout' });

    render(<NavBar />);
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'auth/logout' });
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});