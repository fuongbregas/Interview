import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AddComponent from './AddComponent';
import { useSelector } from 'react-redux';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../../api/client', () => ({
  apiClient: {
    post: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('../PopupComponent/DeleteConfirmPopup', () => {
  return function MockDeleteConfirmPopup({ onCancel, onDeleted }) {
    return (
      <div data-testid="delete-popup">
        <button type="button" onClick={onCancel}>Mock Cancel Delete</button>
        <button type="button" onClick={onDeleted}>Mock Confirm Delete</button>
      </div>
    );
  };
});

import { apiClient } from '../../../api/client';

const defaultAuth = { token: 'token' };

function renderAddComponent(props = {}) {
  const onClose = jest.fn();
  const setTodo = jest.fn();

  const view = render(
    <AddComponent
      onClose={onClose}
      setTodo={setTodo}
      taskOrder={7}
      todo={null}
      {...props}
    />
  );

  return { ...view, onClose, setTodo };
}

describe('AddComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockReturnValue(defaultAuth);
  });

  test('Renders Add Todo and enables Create button when required fields are filled', () => {
    const { onClose } = renderAddComponent();

    expect(screen.getByRole('heading', { name: /add todo/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete todo/i })).not.toBeInTheDocument();

    const createBtn = screen.getByRole('button', { name: /create todo/i });
    expect(createBtn).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/todo name/i), { target: { value: 'My task' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-03-20' } });

    expect(createBtn).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Creates todo successfully + closes form', async () => {
    const responseTodos = [
      { id: 1, taskName: 'A', taskDesc: 'desc', dueDate: '2026-03-20', taskOrder: 0 },
      { id: 2, taskName: 'B', taskDesc: 'desc', dueDate: '2026-03-21', taskOrder: 3 },
    ];
    apiClient.post.mockResolvedValue({ data: responseTodos });

    const { onClose, setTodo } = renderAddComponent({ taskOrder: 5 });

    fireEvent.change(screen.getByLabelText(/todo name/i), { target: { value: '  New todo  ' } });
    fireEvent.change(screen.getByLabelText(/todo description/i), { target: { value: '  desc here  ' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-03-25' } });

    fireEvent.click(screen.getByRole('button', { name: /create todo/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/todo/addTodolist', {
        todoName: 'New todo',
        todoDesc: 'desc here',
        dueDate: '2026-03-25',
        token: 'token',
        taskOrder: 5,
      });
    });

    expect(setTodo).toHaveBeenCalledTimes(1);
    expect(setTodo.mock.calls[0][0][0].id).toBe(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Add todo API fails', async () => {
    apiClient.post.mockRejectedValue({ response: { data: { message: 'Create failed' } } });

    const { onClose } = renderAddComponent();

    fireEvent.change(screen.getByLabelText(/todo name/i), { target: { value: 'Task' } });
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-03-20' } });

    fireEvent.click(screen.getByRole('button', { name: /create todo/i }));

    expect(await screen.findByText('Create failed')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('Updates todo successfully', async () => {
    apiClient.put.mockResolvedValue({
      data: [{ id: 10, taskName: 'Updated', taskDesc: 'D', dueDate: '2026-04-01', taskOrder: 1 }],
    });

    const todo = {
      id: 10,
      taskName: 'Existing title',
      taskDesc: 'Existing desc',
      taskDate: '2026-03-20T00:00:00.000Z',
      taskOrder: 4,
    };

    const { onClose, setTodo } = renderAddComponent({ todo });

    expect(screen.getByRole('heading', { name: /update todo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/todo name/i)).toHaveValue('Existing title');
    expect(screen.getByLabelText(/todo description/i)).toHaveValue('Existing desc');
    expect(screen.getByLabelText(/due date/i)).toHaveValue('2026-03-20');
    expect(screen.getByRole('button', { name: /delete todo/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/todo name/i), { target: { value: 'Updated title' } });
    fireEvent.click(screen.getByRole('button', { name: /update todo/i }));

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith('/todo/updateTodo', {
        todoId: 10,
        todoName: 'Updated title',
        todoDesc: 'Existing desc',
        dueDate: '2026-03-20',
        token: 'token',
        taskOrder: 4,
      });
    });

    expect(setTodo).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Update todo API fails without message', async () => {
    apiClient.put.mockRejectedValue(new Error('Network down'));

    const todo = {
      id: 5,
      taskName: 'Title',
      taskDesc: 'Desc',
      taskDate: '2026-03-20',
      taskOrder: 2,
    };

    renderAddComponent({ todo });

    fireEvent.click(screen.getByRole('button', { name: /update todo/i }));

    expect(await screen.findByText('Network down')).toBeInTheDocument();
  });

  test('Opens delete popup + cancel/deleted actions', () => {
    const todo = {
      id: 5,
      taskName: 'Title',
      taskDesc: 'Desc',
      taskDate: '2026-03-20',
      taskOrder: 2,
    };

    const { onClose } = renderAddComponent({ todo });

    fireEvent.click(screen.getByRole('button', { name: /delete todo/i }));
    expect(screen.getByTestId('delete-popup')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mock cancel delete/i }));
    expect(screen.queryByTestId('delete-popup')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /delete todo/i }));
    fireEvent.click(screen.getByRole('button', { name: /mock confirm delete/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});