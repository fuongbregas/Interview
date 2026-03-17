import React from 'react';
import { apiClient } from '../../../api/client';
import { extractTodoList, toDisplayOrder } from '../DashboardComponent/DashboardHelpers';
import './DeleteConfirmPopup.css';

const DeleteConfirmPopup = ({ todoId, userId, setTodo, onCancel, onDeleted }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleConfirm = async () => {
    if (!todoId || !userId) return;

    try {
      setLoading(true);
      setError('');

      const res = await apiClient.delete('/todo/deleteTodo', {
        data: {
          todoId: Number(todoId),
          userId: Number(userId),
        },
      });

      const data = extractTodoList(res?.data);
      setTodo(toDisplayOrder(data));

      if (typeof onDeleted === 'function') onDeleted();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete todo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-delete-popup-backdrop" role="dialog" aria-modal="true" aria-label="Delete confirmation">
      <div className="dash-delete-popup">
        <p className="dash-delete-popup-text">Are you sure you want to delete this todo?</p>
        {error ? <p className="dash-delete-popup-error">{error}</p> : null}
        <div className="dash-delete-popup-actions">
          <button
            type="button"
            className="dash-delete-confirm-btn"
            onClick={handleConfirm}
            disabled={loading}
          >Confirm</button>
          <button
            type="button"
            className="dash-delete-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmPopup;