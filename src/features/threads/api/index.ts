import { api } from "api";
import type { Thread } from "types";

const apiWithThreads = api.injectEndpoints({
  endpoints: (builder) => ({
    getThreads: builder.query<Thread[] | null, void>({
      query: () => "/Threads",
    }),
    getThreadById: builder.query<Thread[] | null, string>({
      query: (threadId) => `/Threads/${threadId}`,
    }),
    getThreadByIds: builder.query<Thread[] | null, string[]>({
      query: (threadIds) => {
        let query = "";
        for (const id of threadIds) {
          query += `&id=${id}`;
        }
        return `/Threads?%24lookup=channel&%24lookup=comments${query}`;
      },
    }),
  }),
});

export const { useGetThreadsQuery, useLazyGetThreadByIdsQuery } =
  apiWithThreads;
