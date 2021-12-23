import { api } from "api";
import type { Channel } from "types";

const apiWithChannels = api.injectEndpoints({
  endpoints: (builder) => ({
    getChannels: builder.query<Channel[] | null, void>({
      query: () => "/Channels",
    }),
    getChannelByIds: builder.query<Channel[] | null, string[]>({
      query: (channelIds) => {
        let query = "";
        for (const id of channelIds) {
          query += `&id=${id}`;
        }

        return `/Channels?%24lookup=workspace&%24lookup=threads&%24lookup=members${query}`;
      },
    }),
    getChannelById: builder.query<Channel | null, string>({
      query: (channelId) => `/Channels/${channelId}`,
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useGetChannelByIdsQuery,
  useGetChannelByIdQuery,
} = apiWithChannels;
