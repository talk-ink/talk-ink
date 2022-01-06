import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import cookies from "js-cookie";
import { kontenbase } from "lib/client";

import { AuthState, Token, User } from "types";

type FetchAvatarProps = {
  user: User;
};

export const fetchAvatar = createAsyncThunk(
  "auth/fetchAvatar",
  async ({ user }: FetchAvatarProps) => {
    if (!user.avatar) return null;
    const response = await kontenbase
      .service("Attachments")
      .getById(user.avatar);
    return response.data.file;
  }
);

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
  extraReducers: (builder) => {
    builder.addCase(fetchAvatar.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      fetchAvatar.fulfilled,
      (state, action: PayloadAction<string | null>) => {
        state.user = {
          ...state.user,
          avatar: action.payload,
        };
        state.loading = false;
      }
    );
    builder.addCase(fetchAvatar.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const {
  setAuthToken,
  setAuthUser,
  setAuthLoading,
  logout,
  login,
  updateUser,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
