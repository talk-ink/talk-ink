import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { kontenbase } from "lib/client";
import { Thread, User } from "types";

type FetchInboxProps = {
  workspaceId: string;
  userId: string;
};

type InitThreadState = {
  inbox: Thread[];
  loading: boolean;
};

export const fetchInbox = createAsyncThunk(
  "inbox/fetchInbox",
  async ({ workspaceId, userId }: FetchInboxProps) => {
    const response = await kontenbase.service("Threads").find({
      where: {
        workspace: workspaceId,
      },
    });

    const threadData: Thread[] = response.data;

    return threadData.filter((thread) => thread.createdBy._id !== userId);
  }
);

const initialState: InitThreadState = {
  inbox: [],
  loading: true,
};

const inboxSlice = createSlice({
  name: "inbox",
  initialState,
  reducers: {
    addInbox: (state, action: PayloadAction<Thread>) => {
      state.inbox.push(action.payload);
    },
    deleteInbox: (state, action: PayloadAction<Thread>) => {
      let deletedIndex = state.inbox.findIndex(
        (data) => data._id === action.payload._id
      );
      state.inbox.splice(deletedIndex, 1);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchInbox.pending, (state) => {
      if (state.inbox.length === 0) {
        state.loading = true;
      }
    });
    builder.addCase(
      fetchInbox.fulfilled,
      (state, action: PayloadAction<Thread[]>) => {
        state.inbox = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchInbox.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { addInbox, deleteInbox } = inboxSlice.actions;
export const inboxReducer = inboxSlice.reducer;
