// Returns a new list sorted for frontend display (largest taskOrder first).
export const toDisplayOrder = (list) => {
  return [...list].sort((a, b) => b.taskOrder - a.taskOrder);
};

// Reassigns display taskOrder so top item has highest value (length - 1) and bottom item has 0.
export const applyDisplayTaskOrder = (list) => {
  const max = list.length - 1;
  return list.map((todo, idx) => ({
    ...todo,
    taskOrder: max - idx,
  }));
};

// Get todo array from API response
export const extractTodoList = (data) => {
  return Array.isArray(data) ? data : (Array.isArray(data?.todos) ? data.todos : null);
};

// Builds backend payload list
// top item gets highest taskOrder, bottom item gets 0.
export const toBackendTodolistEntityList = (list) => {
  const max = list.length - 1;
  return list.map((todo, idx) => ({
    ...todo,
    taskOrder: max - idx,
  }));
};