import React, { useEffect, useState } from "react";
import { Outlet, Route, Routes, useParams } from "react-router";

import SidebarComponent from "components/Sidebar/SidebarComponent";
import FullscreenLoading from "components/Loading/FullscreenLoading";
import { useGetWorkspaceByIdQuery } from "features/workspaces";
import { useAppSelector } from "hooks/useAppSelector";
import { Workspace } from "types";

function DashboardPage() {
  const params = useParams();
  const auth = useAppSelector((state) => state.auth);
  const userId: any = auth.user.id;

  const { data: workspaceData, isLoading: workspaceLoading } =
    useGetWorkspaceByIdQuery(params.workspaceId);

  useEffect(() => {
    if (!workspaceLoading) {
      if (!workspaceData) throw new Error("Invalid workspace");
      if (!workspaceData?.peoples?.includes(userId))
        throw new Error("Invalid workspace");
      console.log(workspaceData);
    }
  }, [workspaceData, workspaceLoading]);

  const loading = workspaceLoading;

  return loading ? (
    <FullscreenLoading />
  ) : (
    <div className="w-full min-h-screen grid grid-cols-[280px_1fr] overflow-hidden text-slightGray">
      <SidebarComponent dataSource={workspaceData} />
      <Outlet />
    </div>
  );
}

export default DashboardPage;
