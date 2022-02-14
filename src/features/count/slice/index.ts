import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Thread } from "types";

type InitPageStatusState = {
  inbox: Thread[];
  trash: Thread[];
};

const initialState: InitPageStatusState = {
  inbox: [],
  trash: [],
};

const countSlice = createSlice({
  name: "count",
  initialState,
  reducers: {
    setInboxCount: (state, action: PayloadAction<Thread>) => {
      state.inbox.push(action.payload);
    },
    setTrashCount: (state, action: PayloadAction<Thread>) => {
      state.trash.push(action.payload);
    },
  },
});

export const { setInboxCount, setTrashCount } = countSlice.actions;
export const countReducer = countSlice.reducer;
