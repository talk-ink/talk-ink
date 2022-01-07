import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import cookies from "js-cookie";
import { kontenbase } from "lib/client";

import { AuthState, Avatar, Token, TUserProfile, User } from "types";

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
    setAuthUser: (state, action: PayloadAction<TUserProfile>) => {
      let avatar = null;

      if (action.payload.avatar) {
        avatar = action.payload.avatar[0]?.url;
      }
      state.user = {
        ...action.payload,
        avatar,
      };
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
    addDoneThread: (state, action: PayloadAction<string>) => {
      let doneThreads = [];
      if (!state.user.doneThreads) {
        doneThreads.push(action.payload);
      } else {
        doneThreads = [...state.user.doneThreads, action.payload];
      }
      state.user = {
        ...state.user,
        doneThreads,
      };
    },
    deleteDoneThread: (state, action: PayloadAction<string>) => {
      let deletedIndex = state.user.doneThreads.findIndex(
        (data) => data === action.payload
      );
      state.user.doneThreads.splice(deletedIndex, 1);
    },
  },
});

export const {
  setAuthToken,
  setAuthUser,
  setAuthLoading,
  logout,
  login,
  updateUser,
  addDoneThread,
  deleteDoneThread,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
