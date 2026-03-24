import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';

const SESSION_KEY = 'auth';

function loadAuthFromSessionStorage() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAuthToSessionStorage(auth) {
  if (auth === undefined || auth === null || auth === '') {
    throw new Error('Login response is empty; cannot persist auth to sessionStorage.');
  }

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(auth));
  } catch (e) {
    throw new Error(`Failed to write auth to sessionStorage: ${e?.message || String(e)}`);
  }
}

function normalizeAuth(payload) {
  if (!payload) return null;

  const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
  const token = parsed?.token;

  if (!token) {
    throw new Error('Login response must contain token');
  }

  return { token };
}

function clearAuthFromSessionStorage() {
  sessionStorage.removeItem(SESSION_KEY);
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/user/login', credentials);
    const auth = normalizeAuth(response.data);
    saveAuthToSessionStorage(auth);
    return auth;
  } catch (e) {
    const responseData = e?.response?.data;
    const backendMessage = typeof responseData === 'string'
      ? responseData
      : responseData?.message;
    return rejectWithValue(backendMessage || e?.message || 'Login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    auth: loadAuthFromSessionStorage(),
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.auth = null;
      state.status = 'idle';
      state.error = null;
      clearAuthFromSessionStorage();
    },
    clearAuthError(state) {
      state.error = null;
      if (state.status === 'failed') state.status = 'idle';
    },
    setAuth(state, action) {
      state.auth = action.payload;
      clearAuthFromSessionStorage();
      saveAuthToSessionStorage(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.auth = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error?.message || 'Login failed';
      });
  },
});

export const { logout, clearAuthError, setAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state) => state.auth.auth;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;