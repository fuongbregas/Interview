import React from 'react';
import { render, screen } from '@testing-library/react';
import RequireAuth from './RequireAuth';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  Navigate: jest.fn(),
}));

describe('RequireAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockImplementation(mockUseLocation);
    Navigate.mockImplementation(() => null);
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });
  });

  test('renders children when redux auth exists and session auth exists', () => {
    useSelector.mockImplementation((selector) => selector({ auth: { auth: { userId: 1, token: 't' } } }));
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('session-token');

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(Navigate).not.toHaveBeenCalled();

    Storage.prototype.getItem.mockRestore();
  });

  test('redirects to login when redux auth is missing', () => {
    useSelector.mockImplementation((selector) => selector({ auth: { auth: null } }));
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('session-token');

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>
    );

    expect(Navigate.mock.calls[0][0]).toEqual({
      to: '/login',
      replace: true,
      state: { from: { pathname: '/dashboard' } },
    });

    Storage.prototype.getItem.mockRestore();
  });

  test('redirects to login when session auth is missing', () => {
    useSelector.mockImplementation((selector) => selector({ auth: { auth: { userId: 1, token: 't' } } }));
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>
    );

    expect(Navigate).toHaveBeenCalled();

    Storage.prototype.getItem.mockRestore();
  });

  test('redirects to login when sessionStorage.getItem throws', () => {
    useSelector.mockImplementation((selector) => selector({ auth: { auth: { userId: 1, token: 't' } } }));
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('session blocked');
    });

    render(
      <RequireAuth>
        <div>Protected Content</div>
      </RequireAuth>
    );

    expect(Navigate).toHaveBeenCalled();

    Storage.prototype.getItem.mockRestore();
  });
});
