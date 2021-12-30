import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import cookies from "js-cookie";

import { AuthState, Token, User } from "types";

const initialState: AuthState = {
  token: null,
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthToken: (state, action: PayloadAction<Token>) => {
      const cookiesToken = cookies.get("token");
      if (!cookiesToken) {
        cookies.set("token", `${action.payload.token}`);
      }
      state.token = action.payload.token;
    },
    setAuthUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    login: (state, action: PayloadAction<AuthState>) => {
      const cookiesToken = cookies.get("token");
      if (!cookiesToken) {
        cookies.set("token", `${action.payload.token}`);
      }
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
  },
});

export const { setAuthToken, setAuthUser, setAuthLoading, logout, login } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
