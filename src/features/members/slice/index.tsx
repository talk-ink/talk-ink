import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { kontenbase } from "lib/client";
import { Member } from "types";

type FetchMembersProps = {
  workspaceId: string;
};

type InitThreadState = {
  members: Member[];
  loading: boolean;
};

export const fetchMembers = createAsyncThunk(
  "member/fetchMembers",
  async ({ workspaceId }: FetchMembersProps) => {
    const response = await kontenbase
      .service("Users")
      .find({ where: { workspaces: workspaceId }, lookup: ["avatar"] });

    return response.data;
  }
);

const initialState: InitThreadState = {
  members: [],
  loading: true,
};

const memberSlice = createSlice({
  name: "member",
  initialState,
  reducers: {
    addMember: (state, action: PayloadAction<Member>) => {
      state.members.push(action.payload);
    },
    deleteMember: (state, action: PayloadAction<Member>) => {
      let deletedIndex = state.members.findIndex(
        (data) => data._id === action.payload._id
      );
      state.members.splice(deletedIndex, 1);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMembers.pending, (state) => {
      if (state.members.length === 0) {
        state.loading = true;
      }
    });
    builder.addCase(
      fetchMembers.fulfilled,
      (state, action: PayloadAction<Member[]>) => {
        state.members = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchMembers.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { addMember, deleteMember } = memberSlice.actions;
export const memberReducer = memberSlice.reducer;
