import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../../store/authSlice';
import { apiClient } from '../../../api/client';
import TodoComponent from '../TodoComponent/TodoComponent';
import PaginationComponent from '../PaginationComponent/PaginationComponent';
import AddComponent from '../AddComponent/AddComponent';
import SearchComponent from '../SearchComponent/SearchComponent';
import { arrayMove } from '../../../utils/arrayMove';
import {
    extractTodoList,
    toBackendTodolistEntityList,
    toDisplayOrder,
} from './DashboardHelpers';
import './DashboardComponent.css';

const DashboardComponent = () => {
    const auth = useSelector(selectAuth);
    const ownerId = auth?.userId;
    const [todos, setTodos] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [moveError, setMoveError] = React.useState('');
    const [draggingId, setDraggingId] = React.useState(null);
    const [beforeDragTodos, setBeforeDragTodos] = React.useState(null);
    const [showAdd, setShowAdd] = React.useState(false);
    const [selectedTodo, setSelectedTodo] = React.useState(null);
    const [searchText, setSearchText] = React.useState('');

    const pageSize = 7;
    const [page, setPage] = React.useState(1);

    const normalizedSearchText = searchText.trim().toLowerCase();
    const filteredTodos = normalizedSearchText
        ? todos.filter((todo) => {
            const name = String(todo?.taskName || '').toLowerCase();
            const desc = String(todo?.taskDesc || '').toLowerCase();
            return name.includes(normalizedSearchText) || desc.includes(normalizedSearchText);
        })
        : todos;

    const totalPages = Math.max(1, Math.ceil(filteredTodos.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const pageTodos = filteredTodos.slice(startIndex, startIndex + pageSize);
    const nextTaskOrder = todos.reduce((max, todo) => {
        const value = Number(todo?.taskOrder);
        return Number.isFinite(value) ? Math.max(max, value) : max;
    }, -1) + 1;

    const commitMove = async (nextTodos, previousTodos) => {
        if (!ownerId) return;

        const backendTodoList = toBackendTodolistEntityList(nextTodos);

        try {
            setMoveError('');
            const res = await apiClient.post('/todo/moveTodolist', {
                ownerId: Number(ownerId),
                todolistEntityList: backendTodoList,
            });

            const updatedTodos = extractTodoList(res?.data);
            if (updatedTodos) setTodos(toDisplayOrder(updatedTodos));
        } catch (e) {
            setMoveError(e?.response?.data?.message || e?.message || 'Failed to move todo');
            if (previousTodos) setTodos(previousTodos);
        }
    };

    const handleDragStart = (e, todoId) => {
        setMoveError('');
        setDraggingId(todoId);
        setBeforeDragTodos(todos);

        try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(todoId));
        } catch {
        }
    };

    const handleDragEnd = () => {
        setDraggingId(null);
    };

    const moveDraggingToIndex = (targetIndex) => {
        setTodos((prev) => {
            const fromIndex = prev.findIndex(t => String(t.id) === String(draggingId));
            if (fromIndex < 0 || fromIndex === targetIndex) return prev;
            return arrayMove(prev, fromIndex, targetIndex);
        });
    };

    const handleDragOverIndex = (e, targetIndex) => {
        if (draggingId === null || draggingId === undefined) return;
        e.preventDefault();
        moveDraggingToIndex(targetIndex);
    };

    const handleDropCommit = (e) => {
        e.preventDefault();

        if (draggingId === null || draggingId === undefined) return;

        const draggingExists = todos.some(t => String(t.id) === String(draggingId));
        if (!draggingExists) {
            setDraggingId(null);
            return;
        }

        setDraggingId(null);

        if (beforeDragTodos && beforeDragTodos.length === todos.length) {
            const beforeOrder = beforeDragTodos.map(t => t.id).join(',');
            const afterOrder = todos.map(t => t.id).join(',');
            if (beforeOrder === afterOrder) return;
        }

        const reorderedTodos = toBackendTodolistEntityList(todos);
        setTodos(reorderedTodos);
        commitMove(reorderedTodos, beforeDragTodos);
    };

    useEffect(() => {
        let cancelled = false;

        if (!ownerId) {
            setTodos([]);
            setError('');
            setLoading(false);
            return () => {
                cancelled = true;
            };
        }

        const getTodoList = async () => {
            setError('');
            setLoading(true);

            try {
                const res = await apiClient.get('/todo/getTodoList', {
                    params: { ownerId },
                });

                if (cancelled) return;

                const data = extractTodoList(res?.data);
                setTodos(toDisplayOrder(data ?? []));
            } catch (e) {
                if (cancelled) return;
                setError(e?.response?.data?.message || e?.message || 'Failed to load todo list');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        getTodoList();
        return () => {
            cancelled = true;
        };
    }, [ownerId]);

    useEffect(() => {
        setPage(1);
    }, [ownerId]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    if (!auth) return null;

    if (showAdd) {
        return (
            <div className="dash-root">
                <AddComponent
                    onClose={() => {
                        setShowAdd(false);
                        setSelectedTodo(null);
                    }}
                    setTodo={setTodos}
                    taskOrder={nextTaskOrder}
                    todo={selectedTodo}
                />
            </div>
        );
    }

    return (
        <div className="dash-root">
            <h2 className="dash-title">Dashboard</h2>
            <button
                type="button"
                className="dash-add-btn"
                onClick={() => {
                    setSelectedTodo(null);
                    setShowAdd(true);
                }}
            >
                Add Todo
            </button>

            <SearchComponent
                value={searchText}
                onChange={setSearchText}
            />

            {loading ? <p>Loading todos…</p> : null}
            {error ? <p className="dash-error">{error}</p> : null}
            {moveError ? <p className="dash-error">{moveError}</p> : null}

            {!loading && !error ? (
                <div className="dash-content">
                    <div className="dash-list">
                    {todos.length === 0 ? (
                        <p className="dash-empty">No todos yet.</p>
                    ) : (
                        <>
                            {pageTodos.map((todo, idx) => (
                                <div
                                    key={todo.id}
                                    className="dash-item"
                                    onDragOver={normalizedSearchText ? undefined : (e) => handleDragOverIndex(e, startIndex + idx)}
                                    onDrop={normalizedSearchText ? undefined : handleDropCommit}
                                >
                                    <TodoComponent
                                        todo={todo}
                                        isDragging={String(draggingId) === String(todo.id)}
                                        showDragHandle={!normalizedSearchText}
                                        onClick={() => {
                                            setSelectedTodo(todo);
                                            setShowAdd(true);
                                        }}
                                        dragHandleProps={{
                                            draggable: true,
                                            onDragStart: (e) => handleDragStart(e, todo.id),
                                            onDragEnd: handleDragEnd,
                                        }}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                    </div>

                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPrev={() => setPage(p => Math.max(1, p - 1))}
                        onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                    />
                </div>
            ) : null}
        </div>
    );
}

export default DashboardComponent;