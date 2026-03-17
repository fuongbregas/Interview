import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const SESSION_KEY = 'auth';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

let lastAuth = undefined;
store.subscribe(() => {
  const nextAuth = store.getState().auth.auth;
  if (nextAuth === lastAuth) return;
  lastAuth = nextAuth;

  try {
    if (nextAuth) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextAuth));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to persist auth to sessionStorage: ${e?.message || String(e)}`);
  }
});
