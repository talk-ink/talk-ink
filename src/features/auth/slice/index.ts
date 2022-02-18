import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import cookies from "js-cookie";

import { AuthState, Token, TUserProfile } from "types";
import { createUniqueArray, filterDistinct } from "utils/helper";

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
      state.token = action.payload.token;
    },
    setAuthUser: (state, action: PayloadAction<TUserProfile>) => {
      let avatar = null;
      let doneThreads: string[] = [];

      if (action.payload.avatar) {
        avatar = action.payload.avatar[0]?.url;
      }
      if (action.payload.doneThreads) {
        doneThreads = action.payload.doneThreads;
      }
      state.user = {
        ...action.payload,
        avatar,
        doneThreads,
      };
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    login: (state, action: PayloadAction<AuthState>) => {
      const localStorageToken = localStorage.getItem("token");
      if (!localStorageToken) {
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
    addReadThread: (state, action: PayloadAction<string>) => {
      let readedThreads = [];
      if (!state.user.readedThreads) {
        readedThreads.push(action.payload);
      } else {
        readedThreads = [...state.user.readedThreads, action.payload];
      }
      state.user = {
        ...state.user,
        readedThreads,
      };
    },
    deleteReadThread: (state, action: PayloadAction<string>) => {
      let readedThreads = createUniqueArray(state.user.readedThreads);

      let deletedIndex = readedThreads.findIndex(
        (data) => data === action.payload
      );
      if (deletedIndex < 0) return;

      readedThreads.splice(deletedIndex, 1);

      state.user = {
        ...state.user,
        readedThreads,
      };
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
  addReadThread,
  deleteReadThread,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
