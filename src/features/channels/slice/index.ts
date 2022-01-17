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
      .find({ where: { workspace: workspaceId } });

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

export const { addChannel, deleteChannel, updateChannel, updateChannelCount } =
  channelSlice.actions;
export const channelReducer = channelSlice.reducer;
