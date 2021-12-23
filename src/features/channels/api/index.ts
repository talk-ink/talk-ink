import { api } from "api";
import type { Channel } from "types";

const apiWithChannels = api.injectEndpoints({
  endpoints: (builder) => ({
    getChannels: builder.query<Channel[] | null, void>({
      query: () => "/Channels",
    }),
    getChannelById: builder.query<Channel | null, string>({
      query: (channelId) => `/Channels/${channelId}`,
    }),
  }),
});

export const { useGetChannelsQuery, useGetChannelByIdQuery } = apiWithChannels;
