import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { kontenbase } from "lib/client";
import { PageStatus } from "types";

type InitPageStatusState = {
  status: PageStatus;
  loading: boolean;
};

const initialState: InitPageStatusState = {
  status: null,
  loading: true,
};

const pageStatusSlice = createSlice({
  name: "pageStatus",
  initialState,
  reducers: {
    setPageStatus: (state, action: PayloadAction<PageStatus>) => {
      state.status = action.payload;
      state.loading = false;
    },
  },
});

export const { setPageStatus } = pageStatusSlice.actions;
export const pageStatusReducer = pageStatusSlice.reducer;
