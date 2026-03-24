import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DeleteConfirmPopup from './DeleteConfirmPopup';

jest.mock('../../../api/client', () => ({
  apiClient: {
    delete: jest.fn(),
  },
}));

jest.mock('../DashboardComponent/DashboardHelpers', () => ({
  extractTodoList: jest.fn(),
  toDisplayOrder: jest.fn(),
}));

// eslint-disable-next-line import/first
import { apiClient } from '../../../api/client';
// eslint-disable-next-line import/first
import { extractTodoList, toDisplayOrder } from '../DashboardComponent/DashboardHelpers';

function renderPopup(props = {}) {
  const setTodo = jest.fn();
  const onCancel = jest.fn();
  const onDeleted = jest.fn();

  render(
    <DeleteConfirmPopup
      todoId={9}
      token="t"
      setTodo={setTodo}
      onCancel={onCancel}
      onDeleted={onDeleted}
      {...props}
    />
  );

  return { setTodo, onCancel, onDeleted };
}

describe('DeleteConfirmPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Confirm popup + its buttons', () => {
    renderPopup();

    expect(screen.getByRole('dialog', { name: /delete confirmation/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this todo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('Cancel button calls onCancel', async () => {
    const { onCancel } = renderPopup();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('Delete API fails when todoId is missing', async () => {
    renderPopup({ todoId: null });

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(apiClient.delete).not.toHaveBeenCalled();
  });

  test('Delete API fails when token is missing', async () => {
    renderPopup({ token: null });

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(apiClient.delete).not.toHaveBeenCalled();
  });

  test('Deletes successfully + calls onDeleted', async () => {
    const apiData = [{ id: 2 }, { id: 1 }];
    const extracted = [{ id: 2 }, { id: 1 }];
    const ordered = [{ id: 1 }, { id: 2 }];

    apiClient.delete.mockResolvedValueOnce({ data: apiData });
    extractTodoList.mockReturnValueOnce(extracted);
    toDisplayOrder.mockReturnValueOnce(ordered);

    const { setTodo, onDeleted } = renderPopup({ todoId: '9', token: 'tk' });

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/todo/deleteTodo', {
        data: {
          todoId: 9,
          token: 'tk',
        },
      });
    });

    expect(extractTodoList).toHaveBeenCalledWith(apiData);
    expect(toDisplayOrder).toHaveBeenCalledWith(extracted);
    expect(setTodo).toHaveBeenCalledWith(ordered);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  test('API error message + does not call onDeleted', async () => {
    apiClient.delete.mockRejectedValueOnce({ response: { data: { message: 'Delete failed' } } });

    const { setTodo, onDeleted } = renderPopup();

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(await screen.findByText('Delete failed')).toBeInTheDocument();
    expect(setTodo).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
