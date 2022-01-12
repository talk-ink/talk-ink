import React, { useEffect, useState } from "react";
import { Outlet, Route, Routes, useParams, useNavigate } from "react-router";

import SidebarComponent from "components/Sidebar/SidebarComponent";
import FullscreenLoading from "components/Loading/FullscreenLoading";
import { useAppSelector } from "hooks/useAppSelector";
import { Workspace } from "types";
import { useAppDispatch } from "hooks/useAppDispatch";
import { fetchWorkspaces } from "features/workspaces/slice";
import { useMediaQuery } from "react-responsive";
import { FcMenu } from "react-icons/fc";

function DashboardPage() {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });
  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, []);

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
    <div className="w-full min-h-screen md:grid md:grid-cols-[280px_1fr] overflow-auto md:overflow-hidden text-slightGray">
      <FcMenu
        className="fixed top-2 left-2"
        size={"2rem"}
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      />
      <SidebarComponent
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Outlet />
    </div>
  );
}

export default DashboardPage;
