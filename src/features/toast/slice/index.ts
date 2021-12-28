import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Toast } from "types";

const initialState: Toast = {
  message: "",
  duration: 1500,
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToast: (state, action: PayloadAction<Toast>) => {
      state.message = action.payload.message;
      state.duration = action.payload.duration ?? state.duration;
    },
  },
});

export const { setToast } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
