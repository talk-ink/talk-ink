import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { kontenbase } from "lib/client";
import { Workspace } from "types";

type FetchWorkspacesProps = {
  userId: string;
};

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async ({ userId }: FetchWorkspacesProps) => {
    const response = await kontenbase
      .service("Workspaces")
      .find({ where: { peoples: userId }, lookup: ["logo"] });

    const remap = response.data.map((workspace) => {
      let logo = null;

      if (workspace.logo) {
        logo = workspace?.logo?.length > 0 ? workspace.logo[0].file : null;
      }

      return {
        ...workspace,
        logo,
      };
    });

    return remap;
  }
);

const initialState: { workspaces: Workspace[]; loading: boolean } = {
  workspaces: [],
  loading: true,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    addWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces.push(action.payload);
    },
    updateWorkspace: (state, action) => {
      const updatedIndex = state.workspaces.findIndex(
        (workspace) => workspace._id === action.payload._id
      );

      state.workspaces[updatedIndex] = {
        ...state.workspaces[updatedIndex],
        ...action.payload,
      };
    },
    leaveWorkspace: (state, action) => {
      const workspaceIndex = state.workspaces.findIndex(
        (workspace) => workspace._id === action.payload._id
      );
      state.workspaces.splice(workspaceIndex, 1);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWorkspaces.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      fetchWorkspaces.fulfilled,
      (state, action: PayloadAction<Workspace[]>) => {
        state.workspaces = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(fetchWorkspaces.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { addWorkspace, updateWorkspace, leaveWorkspace } =
  workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
