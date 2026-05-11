import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  user: { email: string } | null;
  status: 'idle' | 'loggedIn';
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ email: string }>) {
      state.user = action.payload;
      state.status = 'loggedIn';
    },
    logout(state) {
      state.user = null;
      state.status = 'idle';
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
