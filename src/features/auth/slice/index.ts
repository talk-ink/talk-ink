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
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setAuthToken, setAuthUser, setAuthLoading, logout } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
