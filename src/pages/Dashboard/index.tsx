import React, { useEffect, useState } from "react";
import { Outlet, Route, Routes, useParams, useNavigate } from "react-router";

import SidebarComponent from "components/Sidebar/SidebarComponent";
import FullscreenLoading from "components/Loading/FullscreenLoading";
import { useAppSelector } from "hooks/useAppSelector";
import { Workspace } from "types";
import { useAppDispatch } from "hooks/useAppDispatch";
import { fetchWorkspaces } from "features/workspaces/slice";

function DashboardPage() {
  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const userId: string = auth.user.id;

  useEffect(() => {
    dispatch(fetchWorkspaces({ userId }));
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      if (workspace.workspaces.length === 0) {
        navigate("/404");
      }
    }
  }, [workspace.workspaces]);

  const loading = workspace.loading || workspace.workspaces.length === 0;

  return loading ? (
    <FullscreenLoading />
  ) : (
    <div className="w-full min-h-screen grid grid-cols-[280px_1fr] overflow-hidden text-slightGray">
      <SidebarComponent />
      <Outlet />
    </div>
  );
}

export default DashboardPage;
