import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import DashboardComponent from './DashboardComponent';
import { arrayMove } from '../../../utils/arrayMove';
import authReducer, { setAuth } from '../../../store/authSlice';

jest.mock('../../../api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// eslint-disable-next-line import/first
import { apiClient } from '../../../api/client';

function renderWithStore(preloadedAuth) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        auth: preloadedAuth,
        status: 'idle',
        error: null,
      },
    },
  });

  const view = render(
    <Provider store={store}>
      <DashboardComponent />
    </Provider>
  );

  return { store, ...view };
}

function makeTodos(count) {
  return Array.from({ length: count }).map((_, idx) => ({
    id: idx + 1,
    taskName: `Task ${idx + 1}`,
    taskDesc: `Desc ${idx + 1}`,
    taskOrder: `K${idx + 1}`,
    taskDate: '2026-03-20',
    ownerId: 1,
  }));
}

function defer() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('DashboardComponent', () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.post.mockReset();
  });

  test('arrayMove supports negative/out-of-range indices', () => {
    expect(arrayMove([1, 2, 3], -1, 0)).toEqual([3, 1, 2]);
    expect(arrayMove([1, 2, 3], 0, -1)).toEqual([2, 1, 3]);
    expect(arrayMove([1, 2, 3], 99, 0)).toEqual([1, 2, 3]);
  });

  test('renders nothing when not authenticated', () => {
    apiClient.get.mockResolvedValue({ data: [] });
    renderWithStore(null);
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  });

  test('does not fetch when auth has no userId (ownerId missing)', async () => {
    apiClient.get.mockResolvedValue({ data: makeTodos(1) });

    renderWithStore({ token: 't' });
    expect(apiClient.get).not.toHaveBeenCalled();
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  test('fetches todo list on load and renders items', async () => {
    const todos = makeTodos(2);
    apiClient.get.mockResolvedValue({ data: todos });

    renderWithStore({ userId: 1, token: 't' });

    expect(apiClient.get).toHaveBeenCalledWith('/todo/getTodoList', { params: { ownerId: 1 } });

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('accepts { todos: [] } response shape', async () => {
    apiClient.get.mockResolvedValue({ data: { todos: makeTodos(1) } });
    renderWithStore({ userId: 1, token: 't' });

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
  });

  test('treats unknown object response shape as empty list', async () => {
    apiClient.get.mockResolvedValue({ data: {} });
    renderWithStore({ userId: 1, token: 't' });

    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  test('shows loading then hides it after fetch resolves', async () => {
    const d = defer();
    apiClient.get.mockReturnValueOnce(d.promise);

    renderWithStore({ userId: 1, token: 't' });

    expect(screen.getByText(/loading todos/i)).toBeInTheDocument();
    d.resolve({ data: [] });
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/loading todos/i)).not.toBeInTheDocument();
  });

  test('shows error when todo fetch fails', async () => {
    apiClient.get.mockRejectedValue({ response: { data: { message: 'Boom' } } });
    renderWithStore({ userId: 1, token: 't' });

    expect(await screen.findByText('Boom')).toBeInTheDocument();
    expect(screen.queryByText(/no todos yet/i)).not.toBeInTheDocument();
  });

  test('uses error.message when todo fetch fails without response', async () => {
    apiClient.get.mockRejectedValue(new Error('Network down'));
    renderWithStore({ userId: 1, token: 't' });
    expect(await screen.findByText('Network down')).toBeInTheDocument();
  });

  test('uses default message when todo fetch fails with no details', async () => {
    apiClient.get.mockRejectedValue({});
    renderWithStore({ userId: 1, token: 't' });
    expect(await screen.findByText(/failed to load todo list/i)).toBeInTheDocument();
  });

  test('does not set state after unmount when fetch resolves (cancelled path)', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    const d = defer();
    apiClient.get.mockReturnValueOnce(d.promise);

    const { unmount } = renderWithStore({ userId: 1, token: 't' });
    unmount();

    d.resolve({ data: makeTodos(1) });
    await Promise.resolve();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('does not set state after unmount when fetch rejects (cancelled catch path)', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    const d = defer();
    apiClient.get.mockReturnValueOnce(d.promise);

    const { unmount } = renderWithStore({ userId: 1, token: 't' });
    unmount();

    d.reject({ response: { data: { message: 'Nope' } } });
    await Promise.resolve();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('shows empty message when list is empty', async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    renderWithStore({ userId: 1, token: 't' });

    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  test('paginates when more than 5 todos', async () => {
    apiClient.get.mockResolvedValue({ data: makeTodos(8) });
    renderWithStore({ userId: 1, token: 't' });

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
    // page 1 should not show task 8 (page size is 7)
    expect(screen.queryByText('Task 8')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText('Task 8')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /prev/i }));
    expect(await screen.findByText('Task 1')).toBeInTheDocument();
  });

  test('drop on item without starting drag does not commit a move', async () => {
    apiClient.get.mockResolvedValue({ data: makeTodos(2) });
    apiClient.post.mockResolvedValue({ data: {} });
    renderWithStore({ userId: 1, token: 't' });

    await screen.findByText('Task 1');

    const item = document.querySelectorAll('.dash-item')[0];
    fireEvent.drop(item, { preventDefault: jest.fn() });

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  test('drag start catches dataTransfer errors and drag end clears dragging state', async () => {
    apiClient.get.mockResolvedValue({ data: makeTodos(1) });
    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('Task 1');

    const handle = screen.getAllByLabelText(/drag to reorder/i)[0];
    fireEvent.dragStart(handle, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: () => {
          throw new Error('nope');
        },
      },
    });

    fireEvent.dragEnd(handle);
  });

  test('drag over item without active drag does not preventDefault', async () => {
    apiClient.get.mockResolvedValue({ data: makeTodos(1) });
    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('Task 1');

    const item = document.querySelectorAll('.dash-item')[0];
    const preventDefault = jest.fn();
    fireEvent.dragOver(item, { preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('drag over then drop on item commits move (handleDropCommit path)', async () => {
    const todos = [
      { id: 1, taskName: 'A', taskDesc: '', taskOrder: 'K1', taskDate: '2026-03-20', ownerId: 1 },
      { id: 2, taskName: 'B', taskDesc: '', taskOrder: 'K2', taskDate: '2026-03-20', ownerId: 1 },
      { id: 3, taskName: 'C', taskDesc: '', taskOrder: 'K3', taskDate: '2026-03-20', ownerId: 1 },
    ];

    apiClient.get.mockResolvedValue({ data: todos });
    apiClient.post.mockResolvedValue({ data: {} });
    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('A');

    const handleB = screen.getAllByLabelText(/drag to reorder/i)[1];
    fireEvent.dragStart(handleB, {
      dataTransfer: { effectAllowed: 'move', setData: jest.fn() },
    });

    const item0 = document.querySelectorAll('.dash-item')[0];
    fireEvent.dragOver(item0, { preventDefault: jest.fn() });
    fireEvent.drop(item0, { preventDefault: jest.fn() });

    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    // After dragging B to top display order: [B, A, C]
    // Backend payload keeps top as biggest taskOrder: [2,1,0]
    expect(apiClient.post).toHaveBeenCalledWith('/todo/moveTodolist', {
      ownerId: 1,
      todolistEntityList: expect.arrayContaining([
        expect.objectContaining({ id: 2, taskOrder: 2 }),
        expect.objectContaining({ id: 1, taskOrder: 1 }),
        expect.objectContaining({ id: 3, taskOrder: 0 }),
      ]),
    });
  });

  test('dragOver on same index does not reorder (fromIndex === targetIndex)', async () => {
    apiClient.get.mockResolvedValue({ data: makeTodos(3) });
    apiClient.post.mockResolvedValue({ data: {} });
    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('Task 1');

    const handle1 = screen.getAllByLabelText(/drag to reorder/i)[0];
    fireEvent.dragStart(handle1, { dataTransfer: { effectAllowed: 'move', setData: jest.fn() } });

    const item0 = document.querySelectorAll('.dash-item')[0];
    fireEvent.dragOver(item0, { preventDefault: jest.fn() });

    const titles = Array.from(document.querySelectorAll('.todo-title')).map((n) => n.textContent);
    expect(titles).toEqual(['Task 1', 'Task 2', 'Task 3']);
  });

  test('dragOver after todos change does not reorder when dragging id is missing (fromIndex < 0)', async () => {
    const owner1Todos = makeTodos(2);
    const owner2Todos = [
      { id: 10, taskName: 'X', taskDesc: '', taskOrder: 'X1', taskDate: '2026-03-20', ownerId: 2 },
      { id: 11, taskName: 'Y', taskDesc: '', taskOrder: 'Y1', taskDate: '2026-03-20', ownerId: 2 },
    ];

    apiClient.get
      .mockResolvedValueOnce({ data: owner1Todos })
      .mockResolvedValueOnce({ data: owner2Todos });
    apiClient.post.mockResolvedValue({ data: {} });

    const { store } = renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('Task 1');

    const handle1 = screen.getAllByLabelText(/drag to reorder/i)[0];
    fireEvent.dragStart(handle1, { dataTransfer: { effectAllowed: 'move', setData: jest.fn() } });

    act(() => {
      store.dispatch(setAuth({ userId: 2, token: 't' }));
    });
    await screen.findByText('X');

    const item0 = document.querySelectorAll('.dash-item')[0];
    fireEvent.dragOver(item0, { preventDefault: jest.fn() });

    const titles = Array.from(document.querySelectorAll('.todo-title')).map((n) => n.textContent);
    expect(titles).toEqual(['X', 'Y']);
  });

  test('drop commit is a no-op when order is unchanged', async () => {
    const todos = [
      { id: 1, taskName: 'A', taskDesc: '', taskOrder: 'K1', taskDate: '2026-03-20', ownerId: 1 },
      { id: 2, taskName: 'B', taskDesc: '', taskOrder: 'K2', taskDate: '2026-03-20', ownerId: 1 },
    ];

    apiClient.get.mockResolvedValue({ data: todos });
    apiClient.post.mockResolvedValue({ data: {} });
    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('A');

    const handleA = screen.getAllByLabelText(/drag to reorder/i)[0];
    fireEvent.dragStart(handleA, {
      dataTransfer: { effectAllowed: 'move', setData: jest.fn() },
    });

    const item0 = document.querySelectorAll('.dash-item')[0];
    fireEvent.drop(item0, { preventDefault: jest.fn() });
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  test('drop on item without active drag id returns early', async () => {
    apiClient.get.mockResolvedValue({ data: makeTodos(1) });
    apiClient.post.mockResolvedValue({ data: {} });
    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('Task 1');

    const item = document.querySelectorAll('.dash-item')[0];
    fireEvent.drop(item, { preventDefault: jest.fn() });
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  test('drop on item when dragging id not in todos does not call move API (todoIndex < 0)', async () => {
    const owner1Todos = [
      { id: 1, taskName: 'A1', taskDesc: '', taskOrder: 'A', taskDate: '2026-03-20', ownerId: 1 },
      { id: 2, taskName: 'B1', taskDesc: '', taskOrder: 'B', taskDate: '2026-03-20', ownerId: 1 },
      { id: 3, taskName: 'C1', taskDesc: '', taskOrder: 'C', taskDate: '2026-03-20', ownerId: 1 },
    ];
    const owner2Todos = [
      { id: 10, taskName: 'A2', taskDesc: '', taskOrder: 'X', taskDate: '2026-03-20', ownerId: 2 },
      { id: 11, taskName: 'B2', taskDesc: '', taskOrder: 'Y', taskDate: '2026-03-20', ownerId: 2 },
    ];

    apiClient.get
      .mockResolvedValueOnce({ data: owner1Todos })
      .mockResolvedValueOnce({ data: owner2Todos });
    apiClient.post.mockResolvedValue({ data: {} });

    const { store } = renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('A1');

    const handleB1 = screen.getAllByLabelText(/drag to reorder/i)[1];
    fireEvent.dragStart(handleB1, {
      dataTransfer: { effectAllowed: 'move', setData: jest.fn() },
    });

    act(() => {
      store.dispatch(setAuth({ userId: 2, token: 't' }));
    });
    expect(await screen.findByText('A2')).toBeInTheDocument();

    const item = document.querySelectorAll('.dash-item')[0];
    fireEvent.drop(item, { preventDefault: jest.fn() });

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  test('last item dragOver + drop handlers are wired', async () => {
    const todos = [
      { id: 1, taskName: 'A', taskDesc: '', taskOrder: 'K1', taskDate: '2026-03-20', ownerId: 1 },
      { id: 2, taskName: 'B', taskDesc: '', taskOrder: 'K2', taskDate: '2026-03-20', ownerId: 1 },
      { id: 3, taskName: 'C', taskDesc: '', taskOrder: 'K3', taskDate: '2026-03-20', ownerId: 1 },
    ];

    apiClient.get.mockResolvedValue({ data: todos });
    apiClient.post.mockResolvedValue({ data: {} });
    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('A');

    const handleA = screen.getAllByLabelText(/drag to reorder/i)[0];
    fireEvent.dragStart(handleA, {
      dataTransfer: { effectAllowed: 'move', setData: jest.fn() },
    });

    const items = document.querySelectorAll('.dash-item');
    const bottomItem = items[items.length - 1];

    fireEvent.dragOver(bottomItem, { preventDefault: jest.fn() });

    await waitFor(() => {
      const titles = Array.from(document.querySelectorAll('.todo-title')).map((n) => n.textContent);
      expect(titles).toEqual(['B', 'C', 'A']);
    });

    fireEvent.drop(bottomItem, { preventDefault: jest.fn() });
    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
  });

  test('move API failure shows moveError and reverts order', async () => {
    const todos = [
      { id: 1, taskName: 'A', taskDesc: '', taskOrder: 'K1', taskDate: '2026-03-20', ownerId: 1 },
      { id: 2, taskName: 'B', taskDesc: '', taskOrder: 'K2', taskDate: '2026-03-20', ownerId: 1 },
      { id: 3, taskName: 'C', taskDesc: '', taskOrder: 'K3', taskDate: '2026-03-20', ownerId: 1 },
    ];

    apiClient.get.mockResolvedValue({ data: todos });
    apiClient.post.mockRejectedValue({ response: { data: { message: 'Failed move' } } });

    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('A');

    const handleB = screen.getAllByLabelText(/drag to reorder/i)[1];
    fireEvent.dragStart(handleB, {
      dataTransfer: { effectAllowed: 'move', setData: jest.fn() },
    });

    const item0 = document.querySelectorAll('.dash-item')[0];
    fireEvent.dragOver(item0, { preventDefault: jest.fn() });
    fireEvent.drop(item0, { preventDefault: jest.fn() });

    expect(await screen.findByText('Failed move')).toBeInTheDocument();
    // should revert to original order (A before B)
    const itemsText = Array.from(document.querySelectorAll('.todo-title')).map((n) => n.textContent);
    expect(itemsText[0]).toBe('A');
  });

  test('move error uses error.message when response message is missing', async () => {
    const todos = [
      { id: 1, taskName: 'A', taskDesc: '', taskOrder: 'K1', taskDate: '2026-03-20', ownerId: 1 },
      { id: 2, taskName: 'B', taskDesc: '', taskOrder: 'K2', taskDate: '2026-03-20', ownerId: 1 },
    ];
    apiClient.get.mockResolvedValue({ data: todos });
    apiClient.post.mockRejectedValue(new Error('Move broke'));

    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('A');

    const handleB = screen.getAllByLabelText(/drag to reorder/i)[1];
    fireEvent.dragStart(handleB, { dataTransfer: { effectAllowed: 'move', setData: jest.fn() } });
    const item0 = document.querySelectorAll('.dash-item')[0];
    fireEvent.dragOver(item0, { preventDefault: jest.fn() });
    fireEvent.drop(item0, { preventDefault: jest.fn() });

    expect(await screen.findByText('Move broke')).toBeInTheDocument();
  });

  test('move error uses default message when no details provided', async () => {
    const todos = [
      { id: 1, taskName: 'A', taskDesc: '', taskOrder: 'K1', taskDate: '2026-03-20', ownerId: 1 },
      { id: 2, taskName: 'B', taskDesc: '', taskOrder: 'K2', taskDate: '2026-03-20', ownerId: 1 },
    ];
    apiClient.get.mockResolvedValue({ data: todos });
    apiClient.post.mockRejectedValue({});

    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('A');

    const handleB = screen.getAllByLabelText(/drag to reorder/i)[1];
    fireEvent.dragStart(handleB, { dataTransfer: { effectAllowed: 'move', setData: jest.fn() } });
    const item0 = document.querySelectorAll('.dash-item')[0];
    fireEvent.dragOver(item0, { preventDefault: jest.fn() });
    fireEvent.drop(item0, { preventDefault: jest.fn() });

    expect(await screen.findByText(/failed to move todo/i)).toBeInTheDocument();
  });

  test('drop commit uses current todos when beforeDragTodos is null', async () => {
    const originalUseState = React.useState;
    let callIndex = 0;

    const spy = jest.spyOn(React, 'useState').mockImplementation((init) => {
      callIndex += 1;
      // 5th useState call in the component is `draggingId`.
      if (callIndex === 5) return originalUseState(1);
      // 6th is `beforeDragTodos` (leave it null).
      return originalUseState(init);
    });

    try {
      const todos = [
        { id: 1, taskName: 'A', taskDesc: '', taskOrder: 'K1', taskDate: '2026-03-20', ownerId: 1 },
        { id: 2, taskName: 'B', taskDesc: '', taskOrder: 'K2', taskDate: '2026-03-20', ownerId: 1 },
      ];
      apiClient.get.mockResolvedValue({ data: todos });
      apiClient.post.mockResolvedValue({ data: {} });

      renderWithStore({ userId: 1, token: 't' });
      await screen.findByText('A');

      const item0 = document.querySelectorAll('.dash-item')[0];
      fireEvent.drop(item0, { preventDefault: jest.fn() });
      await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    } finally {
      spy.mockRestore();
    }
  });

  test('move failure does not revert when previousTodos is missing', async () => {
    const originalUseState = React.useState;
    let callIndex = 0;

    const spy = jest.spyOn(React, 'useState').mockImplementation((init) => {
      callIndex += 1;
      // 5th useState call in the component is `draggingId`.
      if (callIndex === 5) return originalUseState(1);
      // 6th is `beforeDragTodos` (leave it null/undefined so previousTodos is falsy).
      if (callIndex === 6) return originalUseState(null);
      return originalUseState(init);
    });

    try {
      const todos = [
        { id: 1, taskName: 'A', taskDesc: '', taskOrder: 'K1', taskDate: '2026-03-20', ownerId: 1 },
        { id: 2, taskName: 'B', taskDesc: '', taskOrder: 'K2', taskDate: '2026-03-20', ownerId: 1 },
      ];
      apiClient.get.mockResolvedValue({ data: todos });
      apiClient.post.mockRejectedValue({ response: { data: { message: 'No revert' } } });

      renderWithStore({ userId: 1, token: 't' });
      await screen.findByText('A');

      const item0 = document.querySelectorAll('.dash-item')[0];
      fireEvent.drop(item0, { preventDefault: jest.fn() });

      expect(await screen.findByText('No revert')).toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  test('commitMove uses ?? null fallbacks for undefined neighbor keys', async () => {
    const todos = [
      { id: 1, taskName: 'A', taskDesc: '', taskOrder: undefined, taskDate: '2026-03-20', ownerId: 1 },
      { id: 2, taskName: 'B', taskDesc: '', taskOrder: 'BKEY', taskDate: '2026-03-20', ownerId: 1 },
      { id: 3, taskName: 'C', taskDesc: '', taskOrder: undefined, taskDate: '2026-03-20', ownerId: 1 },
    ];

    apiClient.get.mockResolvedValue({ data: todos });
    apiClient.post.mockResolvedValue({ data: {} });
    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('A');

    const handleB = screen.getAllByLabelText(/drag to reorder/i)[1];
    fireEvent.dragStart(handleB, { dataTransfer: { effectAllowed: 'move', setData: jest.fn() } });

    // Move B to top via first item drop target.
    const item0 = document.querySelectorAll('.dash-item')[0];
    fireEvent.dragOver(item0, { preventDefault: jest.fn() });
    fireEvent.drop(item0, { preventDefault: jest.fn() });
    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    expect(apiClient.post).toHaveBeenLastCalledWith('/todo/moveTodolist', {
      ownerId: 1,
      todolistEntityList: expect.arrayContaining([
        expect.objectContaining({ id: 2, taskOrder: 2 }),
      ]),
    });
  });

  test('commitMove uses ?? null for nextKey when previous neighbor has no taskOrder', async () => {
    const todos = [
      { id: 1, taskName: 'B', taskDesc: '', taskOrder: 'BKEY', taskDate: '2026-03-20', ownerId: 1 },
      { id: 2, taskName: 'A', taskDesc: '', taskOrder: undefined, taskDate: '2026-03-20', ownerId: 1 },
      { id: 3, taskName: 'C', taskDesc: '', taskOrder: 'CKEY', taskDate: '2026-03-20', ownerId: 1 },
    ];

    apiClient.get.mockResolvedValue({ data: todos });
    apiClient.post.mockResolvedValue({ data: {} });
    renderWithStore({ userId: 1, token: 't' });
    await screen.findByText('B');

    const handleB = screen.getAllByLabelText(/drag to reorder/i)[0];
    fireEvent.dragStart(handleB, { dataTransfer: { effectAllowed: 'move', setData: jest.fn() } });

    // Drag B onto the item at index 1 so it ends up [A,B,C]
    const item1 = document.querySelectorAll('.dash-item')[1];
    fireEvent.dragOver(item1, { preventDefault: jest.fn() });
    fireEvent.drop(item1, { preventDefault: jest.fn() });

    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    expect(apiClient.post).toHaveBeenLastCalledWith('/todo/moveTodolist', {
      ownerId: 1,
      todolistEntityList: expect.arrayContaining([
        expect.objectContaining({ id: 1, taskOrder: 1 }),
      ]),
    });
  });

  test('drag drop calls moveTodolist with ownerId + todolistEntityList payload', async () => {
    const todos = [
      { id: 7, taskName: 'A', taskDesc: '', taskOrder: 'V', taskDate: '2026-03-20', ownerId: 1 },
      { id: 8, taskName: 'B', taskDesc: '', taskOrder: 'VV', taskDate: '2026-03-20', ownerId: 1 },
      { id: 9, taskName: 'C', taskDesc: '', taskOrder: 'VVV', taskDate: '2026-03-20', ownerId: 1 },
    ];

    apiClient.get.mockResolvedValue({ data: todos });
    apiClient.post.mockResolvedValue({ data: {} });

    renderWithStore({ userId: 1, token: 't' });
    expect(await screen.findByText('A')).toBeInTheDocument();

    // Start dragging item B via its drag handle
    const handles = screen.getAllByLabelText(/drag to reorder/i);
    const handleB = handles[1];
    fireEvent.dragStart(handleB, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: jest.fn(),
      },
    });

    // Drop on first item to place B at top.
    const items = document.querySelectorAll('.dash-item');
    expect(items.length).toBeGreaterThan(0);
    fireEvent.dragOver(items[0], { preventDefault: jest.fn() });
    fireEvent.drop(items[0], { preventDefault: jest.fn() });

    await waitFor(() => expect(apiClient.post).toHaveBeenCalled());

    // After dropping B to top, display order is [B, A, C]
    // Backend payload keeps top as biggest taskOrder: B=2, A=1, C=0
    expect(apiClient.post).toHaveBeenCalledWith('/todo/moveTodolist', {
      ownerId: 1,
      todolistEntityList: expect.arrayContaining([
        expect.objectContaining({ id: 8, taskOrder: 2 }),
        expect.objectContaining({ id: 7, taskOrder: 1 }),
        expect.objectContaining({ id: 9, taskOrder: 0 }),
      ]),
    });
  });

  test('clamps page down when page > totalPages', async () => {
    const originalUseState = React.useState;
    let callIndex = 0;

    const spy = jest.spyOn(React, 'useState').mockImplementation((init) => {
      callIndex += 1;
      // 8th useState call in the component is `page`.
      if (callIndex === 8) return originalUseState(2);
      return originalUseState(init);
    });

    try {
      apiClient.get.mockResolvedValue({ data: [] });
      renderWithStore({ userId: 1, token: 't' });

      expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });
});
