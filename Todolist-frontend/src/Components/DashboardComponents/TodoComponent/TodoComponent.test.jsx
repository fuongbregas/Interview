import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TodoComponent from './TodoComponent';

function makeTodo(overrides = {}) {
  return {
    id: 1,
    taskName: 'Task A',
    taskDate: '2026-03-20',
    taskDesc: 'Task description',
    ...overrides,
  };
}

describe('TodoComponent', () => {
  test('Not render if no todo', () => {
    const { container } = render(<TodoComponent todo={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('Show title, date, description, and drag handle by default', () => {
    render(<TodoComponent todo={makeTodo()} />);

    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('2026-03-20')).toBeInTheDocument();
    expect(screen.getByText('Task description')).toBeInTheDocument();
    expect(screen.getByLabelText(/drag to reorder/i)).toBeInTheDocument();
  });

  test('Description is empty', () => {
    render(<TodoComponent todo={makeTodo({ taskDesc: '' })} />);

    expect(screen.queryByText('Task description')).not.toBeInTheDocument();
  });

  test('Hide drag handle when searching', () => {
    render(<TodoComponent todo={makeTodo()} showDragHandle={false} />);

    expect(screen.queryByLabelText(/drag to reorder/i)).not.toBeInTheDocument();
  });

  test('Applies dragging class when isDragging is true', () => {
    render(<TodoComponent todo={makeTodo()} isDragging />);

    const card = screen.getByRole('button', { name: /task a/i });
    expect(card).toHaveClass('todo-card');
    expect(card).toHaveClass('todo-dragging');
  });

  test('When user click a todo', () => {
    const onClick = jest.fn();
    render(<TodoComponent todo={makeTodo()} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: /task a/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('Drag handle click stops propagation and calls dragHandleProps.onClick', () => {
    const onCardClick = jest.fn();
    const onHandleClick = jest.fn();

    render(
      <TodoComponent
        todo={makeTodo()}
        onClick={onCardClick}
        dragHandleProps={{ onClick: onHandleClick }}
      />
    );

    fireEvent.click(screen.getByLabelText(/drag to reorder/i));

    expect(onHandleClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });
});