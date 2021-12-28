import React, { useEffect, useState } from "react";
import { Outlet, Route, Routes, useParams } from "react-router";

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

  const userId: string = auth.user.id;

  useEffect(() => {
    dispatch(fetchWorkspaces({ userId }));
  }, [userId]);

  const loading = workspace.loading;

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
