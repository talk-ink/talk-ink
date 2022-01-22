import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { kontenbase } from "lib/client";
import { Channel } from "types";
import { filterDistinct } from "utils/helper";

type FetchChannelsProps = {
  userId: string;
  workspaceId: string;
};

type InitChannelState = {
  channels: Channel[];
  loading: boolean;
};

export const fetchChannels = createAsyncThunk(
  "channel/fetchChannels",
  async ({ userId, workspaceId }: FetchChannelsProps) => {
    const response = await kontenbase.service("Channels").find({
      where: { members: userId, workspace: workspaceId },
    });

    return response.data;
  }
);

const initialState: InitChannelState = {
  channels: [],
  loading: true,
};

const channelSlice = createSlice({
  name: "channel",
  initialState,
  reducers: {
    addChannel: (state, action) => {
      const channels = [...state.channels, action.payload];

      const distinctChannels = filterDistinct(channels, "_id");

      state.channels = distinctChannels;
    },
    deleteChannel: (state, action: PayloadAction<Channel>) => {
      let deletedIndex = state.channels.findIndex(
        (data) => data._id === action.payload._id
      );
      state.channels.splice(deletedIndex, 1);
    },
    updateChannel: (state, action) => {
      const updatedIndex = state.channels.findIndex(
        (channel) => channel._id === action.payload._id
      );

      state.channels[updatedIndex] = {
        ...state.channels[updatedIndex],
        ...action.payload,
      };
    },
    updateChannelCount: (state, action) => {
      const newChanel = state.channels.map((item) =>
        item._id === action.payload.chanelId
          ? {
              ...item,
              threads: item.threads.filter(
                (threadId) => threadId !== action.payload.threadId
              ),
            }
          : item
      );

      state.channels = newChanel;
    },
    removeChannelMember: (
      state,
      action: PayloadAction<{ _id: string; memberId: string }>
    ) => {
      const updatedIndex = state.channels.findIndex(
        (channel) => channel._id === action.payload._id
      );
      const deletedMemberIndex = state.channels[updatedIndex].members.findIndex(
        (data) => data === action.payload?.memberId
      );

      state.channels[updatedIndex].members.splice(deletedMemberIndex, 1);
    },
    addChannelMember: (
      state,
      action: PayloadAction<{ _id: string; memberId: string }>
    ) => {
      const updatedIndex = state.channels.findIndex(
        (channel) => channel._id === action.payload._id
      );

      state.channels[updatedIndex].members.push(action.payload.memberId);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchChannels.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      fetchChannels.fulfilled,
      (state, action: PayloadAction<Channel[]>) => {
        state.channels = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchChannels.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const {
  addChannel,
  deleteChannel,
  updateChannel,
  updateChannelCount,
  removeChannelMember,
  addChannelMember,
} = channelSlice.actions;
export const channelReducer = channelSlice.reducer;
