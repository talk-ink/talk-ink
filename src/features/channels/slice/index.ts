import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { kontenbase } from "lib/client";
import { Channel, CreateChannel, Workspace } from "types";

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
    const response = await kontenbase
      .service("Channels")
      .find({ where: { members: userId, workspace: workspaceId } });
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
      state.channels.push(action.payload);
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

export const { addChannel } = channelSlice.actions;
export const channelReducer = channelSlice.reducer;
