import { api } from "api";
import type { Workspace } from "types";

const apiWithWorkspaces = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query<Workspace[] | null, void>({
      query: () => "/Workspaces",
    }),
    getWorkspaceById: builder.query<Workspace | null, string>({
      query: (workspaceId) => `/Workspaces/${workspaceId}`,
    }),
  }),
});

export const { useGetWorkspacesQuery, useGetWorkspaceByIdQuery } =
  apiWithWorkspaces;
