import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Thread } from "types";

type InitSidebarStateType = {
  inbox: Thread[];
  trash: Thread[];
};

type AddInboxDataPayload = {
  thread: Thread;
};

type AddBulkInboxDataPayload = {
  threads: Thread[];
};
type DeleteInboxDataPayload = {
  _id: string;
};
type UpdateInboxDataPayload = {
  _id: string;
  thread: Thread;
};

const initialState: InitSidebarStateType = {
  inbox: [],
  trash: [],
};

const sidebarStateSlice = createSlice({
  name: "sidebarState",
  initialState,
  reducers: {
    addInboxData: (state, action: PayloadAction<AddInboxDataPayload>) => {
      state.inbox.push(action.payload.thread);
    },
    addBulkInboxData: (
      state,
      action: PayloadAction<AddBulkInboxDataPayload>
    ) => {
      state.inbox = [...state.inbox, ...action.payload.threads];
    },
    deleteInboxData: (state, action: PayloadAction<DeleteInboxDataPayload>) => {
      state.inbox = state.inbox.filter(
        (item) => item._id !== action.payload._id
      );
    },
    updateInboxData: (state, action: PayloadAction<UpdateInboxDataPayload>) => {
      state.inbox = state.inbox.map((item) => {
        if (item._id !== action.payload._id) return item;
        return { ...item, ...action.payload.thread };
      });
    },
    setTrash: (state, action: PayloadAction<Thread>) => {
      state.trash.push(action.payload);
    },
  },
});

export const {
  addInboxData,
  addBulkInboxData,
  deleteInboxData,
  updateInboxData,
  setTrash,
} = sidebarStateSlice.actions;
export const sidebarStateReduce = sidebarStateSlice.reducer;
