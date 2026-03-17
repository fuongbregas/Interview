import React from 'react';
import './TodoComponent.css';

const TodoComponent = ({ todo, isDragging = false, dragHandleProps, onClick, showDragHandle = true }) => {
  if (!todo) return null;

  const handleClick = () => {
    if (typeof onClick === 'function') onClick();
  };

  const mergedDragHandleProps = {
    ...dragHandleProps,
    onClick: (e) => {
      e.stopPropagation();
      if (dragHandleProps?.onClick) dragHandleProps.onClick(e);
    },
  };

  return (
    <div
      className={isDragging ? 'todo-card todo-dragging' : 'todo-card'}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="Edit this todo"
    >
      <div className="todo-header">
        <div className="todo-title">{todo.taskName}</div>
        <div className="todo-date">{todo.taskDate}</div>
        {showDragHandle ? (
          <div className="todo-handle" title="Drag to reorder" aria-label="Drag to reorder" {...mergedDragHandleProps}>
            ≡
          </div>
        ) : null}
      </div>

      {todo.taskDesc ? (
        <div className="todo-desc">{todo.taskDesc}</div>
      ) : null}
    </div>
  );
};

export default TodoComponent;