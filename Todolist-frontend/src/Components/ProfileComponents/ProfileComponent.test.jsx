import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProfileComponent from './ProfileComponent';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../api/client', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import { apiClient } from '../../api/client';

function renderProfile() {
  return render(<ProfileComponent />);
}

function neverResolvingPromise() {
  return new Promise(() => {});
}

describe('ProfileComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useSelector.mockReturnValue({ token: 't' });
  });

  test('Pre-fills username', async () => {
    apiClient.get.mockResolvedValueOnce({ data: 'alice' });

    renderProfile();

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/user/getUserName', {
        params: { token: 't' },
        headers: { Authorization: 'Bearer t' },
      });
    });

    expect(await screen.findByDisplayValue('alice')).toBeInTheDocument();
  });

  test('Fails to load username if token is missing', () => {
    useSelector.mockReturnValue({});

    renderProfile();

    expect(apiClient.get).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/user name/i)).toHaveValue('');
  });

  test('Update button is disabled', async () => {
    apiClient.get.mockReturnValueOnce(neverResolvingPromise());
    renderProfile();

    const submitBtn = screen.getByRole('button', { name: /update profile/i });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/user name/i), { target: { value: 'alice' } });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    expect(submitBtn).toBeEnabled();
  });

  test('Submits update, shows success, and redirects to dashboard', async () => {
    jest.useFakeTimers();
    apiClient.get.mockReturnValueOnce(neverResolvingPromise());
    apiClient.put.mockResolvedValueOnce({ data: { userName: 'alice-updated' } });

    renderProfile();

    fireEvent.change(screen.getByLabelText(/user name/i), { target: { value: '  alice-updated  ' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update profile/i }));
    });

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith('/user/update', {
        token: 't',
        userName: 'alice-updated',
        password: 'secret123',
      });
    });

    expect(await screen.findByText(/profile updated successfully/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
    expect(screen.getByLabelText(/user name/i)).toHaveValue('alice-updated');

    act(() => {
      jest.advanceTimersByTime(900);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    jest.useRealTimers();
  });

  test('Fails to update user', async () => {
    apiClient.get.mockReturnValueOnce(neverResolvingPromise());
    apiClient.put.mockRejectedValueOnce({ response: { data: { message: 'Update denied' } } });

    renderProfile();

    fireEvent.change(screen.getByLabelText(/user name/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'bad' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update profile/i }));
    });

    expect(await screen.findByText('Update denied')).toBeInTheDocument();
  });

  test('Cancel button clicked, navigates to dashboard', () => {
    apiClient.get.mockReturnValueOnce(neverResolvingPromise());
    renderProfile();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});