import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import cookies from "js-cookie";

import { AuthState, Token, User } from "types";

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthToken: (state, action: PayloadAction<Token>) => {
      cookies.set("token", `${action.payload.token}`);
      state.token = action.payload.token;
    },
    setAuthUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setAuthToken, setAuthUser, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
