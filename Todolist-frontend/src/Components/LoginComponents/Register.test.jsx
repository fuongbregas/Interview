import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Register from './Register';

jest.mock('../../api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import { apiClient } from '../../api/client';

function renderRegister(props = {}) {
  const onClose = jest.fn();
  render(<Register onClose={onClose} {...props} />);
  return { onClose };
}

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Register button is disabled when form is empty', () => {
    renderRegister();

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toHaveValue('');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /register/i })).toBeDisabled();
  });

  test('Enable Submit button when username and password are filled', () => {
    renderRegister();

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: '   ' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(usernameInput, { target: { value: 'alice' } });
    expect(submitButton).toBeEnabled();

    fireEvent.change(passwordInput, { target: { value: '   ' } });
    expect(submitButton).toBeDisabled();
  });

  test('submits register successfully and closes form', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { ok: true } });
    const { onClose } = renderRegister();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/user/register', {
        userName: 'alice',
        password: 'secret',
      });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
  });

  test('cancel button calls onClose', () => {
    const { onClose } = renderRegister();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('shows backend string error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiClient.post.mockRejectedValueOnce({ response: { data: 'Username already exists' } });

    renderRegister();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText('Username already exists')).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  test('shows Registration failed when no details are provided', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiClient.post.mockRejectedValueOnce({});

    renderRegister();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/Registration failed/i)).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });
});
