import React from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../../store/authSlice';
import { apiClient } from '../../../api/client';
import { extractTodoList, toDisplayOrder } from '../DashboardComponent/DashboardHelpers';
import DeleteConfirmPopup from '../PopupComponent/DeleteConfirmPopup';
import './AddComponent.css';

const AddComponent = ({ onClose, setTodo, taskOrder, todo }) => {
    const auth = useSelector(selectAuth);
    const ownerId = auth?.userId;
    const [form, setForm] = React.useState({
        todoName: '',
        todoDescription: '',
        dueDate: '',
    });
    const [submitting, setSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState('');
    const isEditMode = Boolean(todo); // If no todo is passed, it is Add Todo, else Edit Todo
    const [showDeletePopup, setShowDeletePopup] = React.useState(false);

    React.useEffect(() => {
        if (!todo) {
            setForm({
                todoName: '',
                todoDescription: '',
                dueDate: '',
            });
            return;
        }

        const formattedDate = String(todo?.dueDate || todo?.taskDate || '').slice(0, 10);
        setForm({
            todoName: todo?.taskName || '',
            todoDescription: todo?.taskDesc || '',
            dueDate: formattedDate,
        });
    }, [todo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Disable Create/Update button if name and due date are not provided
    const isCreateDisabled = submitting || !form.todoName.trim() || !form.dueDate;

    const handleCreateTodo = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setSubmitError('');

            const res = await apiClient.post('/todo/addTodolist', {
                todoName: form.todoName.trim(),
                todoDesc: form.todoDescription.trim(),
                dueDate: form.dueDate,
                ownerId: Number(ownerId),
                taskOrder: Number(taskOrder),
            });

            const data = extractTodoList(res?.data);
            setTodo(toDisplayOrder(data ?? []));
            onClose();

        } catch (error) {
            setSubmitError(error?.response?.data?.message || error?.message || 'Failed to add todo');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateTodo = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setSubmitError('');

            const res = await apiClient.put('/todo/updateTodo', {
                todoId: Number(todo.id),
                todoName: form.todoName.trim(),
                todoDesc: form.todoDescription.trim(),
                dueDate: form.dueDate,
                ownerId: Number(ownerId),
                taskOrder: Number(todo.taskOrder),
            });
            const data = extractTodoList(res?.data);
            setTodo(toDisplayOrder(data ?? []));
            onClose();
        } catch (error) {
            setSubmitError(error?.response?.data?.message || error?.message || 'Failed to update todo');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="dash-add-page">
            <h2 className="dash-add-title">{isEditMode ? 'Update Todo' : 'Add Todo'}</h2>
            <form className="dash-add-panel" onSubmit={isEditMode ? handleUpdateTodo : handleCreateTodo}>
                <div className="dash-add-field">
                    <label htmlFor="todo-name" className="dash-add-label">Todo Name</label>
                    <input
                        id="todo-name"
                        name="todoName"
                        type="text"
                        className="dash-add-input"
                        value={form.todoName}
                        onChange={handleChange}
                    />
                </div>

                <div className="dash-add-field">
                    <label htmlFor="todo-description" className="dash-add-label">Todo Description</label>
                    <textarea
                        id="todo-description"
                        name="todoDescription"
                        className="dash-add-textarea"
                        rows={4}
                        value={form.todoDescription}
                        onChange={handleChange}
                    />
                </div>

                <div className="dash-add-field">
                    <label htmlFor="due-date" className="dash-add-label">Due Date</label>
                    <input
                        id="due-date"
                        name="dueDate"
                        type="date"
                        className="dash-add-input"
                        value={form.dueDate}
                        onChange={handleChange}
                    />
                </div>

                {submitError ? <p className="dash-add-error">{submitError}</p> : null}

                <div className="dash-add-actions">
                    <button type="submit" className="dash-add-create-btn" disabled={isCreateDisabled}>
                        {submitting ? (isEditMode ? 'Updating…' : 'Creating…') : (isEditMode ? 'Update todo' : 'Create Todo')}
                    </button>
                    {isEditMode ? (
                        <button
                            type="button"
                            onClick={() => setShowDeletePopup(true)}
                            className="dash-add-delete-btn"
                            disabled={submitting}
                        >Delete Todo</button>
                    ) : null}
                    <button
                        type="button"
                        className="dash-add-cancel-btn"
                        onClick={onClose}
                        disabled={submitting}
                    >Cancel</button>
                </div>
            </form>

            {showDeletePopup ? (
                <DeleteConfirmPopup
                    todoId={todo?.id}
                    userId={ownerId}
                    setTodo={setTodo}
                    onCancel={() => setShowDeletePopup(false)}
                    onDeleted={() => {
                        setShowDeletePopup(false);
                        onClose();
                    }}
                />
            ) : null}
        </div>
    );
};

export default AddComponent;