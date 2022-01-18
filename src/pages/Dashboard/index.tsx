import React, { useEffect, useState } from "react";
import { Outlet, Route, Routes, useParams, useNavigate } from "react-router";

import SidebarComponent from "components/Sidebar/SidebarComponent";
import FullscreenLoading from "components/Loading/FullscreenLoading";
import { useAppSelector } from "hooks/useAppSelector";
import { Channel, PageStatus, Workspace } from "types";
import { useAppDispatch } from "hooks/useAppDispatch";
import { fetchWorkspaces } from "features/workspaces/slice";
import { useMediaQuery } from "react-responsive";
import { FcMenu } from "react-icons/fc";
import { useToast } from "hooks/useToast";
import { kontenbase } from "lib/client";
import { KontenbaseResponse } from "@kontenbase/sdk";
import NotFoundChannelPage from "pages/Channel/NotFoundChannel";
import RestrictedChannelPage from "pages/Channel/RestrictedChannel";
import { setPageStatus } from "features/pageStatus";
import { addChannel } from "features/channels/slice";

function DashboardPage() {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);
  const channel = useAppSelector((state) => state.channel);
  const pageStatus = useAppSelector((state) => state.pageStatus);

  const dispatch = useAppDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, []);

  const userId: string = auth.user._id;

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

  const pageStatusHandler = async () => {
    try {
      const workspaceData = workspace.workspaces.find(
        (data) => data._id === params.workspaceId
      );

      if (params?.channelId) {
        const { data: channelData }: KontenbaseResponse<Channel> =
          await kontenbase.service("Channels").find({
            where: { id: params.channelId },
            select: ["name", "members", "privacy"],
          });

        if (
          !workspaceData?.channels?.includes(params?.channelId) ||
          channelData.length === 0
        )
          return dispatch(setPageStatus("channel-notFound"));

        if (
          channelData[0]?.privacy === "private" &&
          !channelData[0]?.members?.includes(userId)
        ) {
          return dispatch(setPageStatus("channel-restricted"));
        }
        if (
          channelData[0]?.privacy === "public" &&
          !channelData[0]?.members?.includes(userId)
        ) {
          return dispatch(addChannel(channelData[0]));
        }
      }
      return dispatch(setPageStatus(null));
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };

  useEffect(() => {
    if (workspace.workspaces.length > 0) {
      pageStatusHandler();
    }
  }, [params.workspaceId, params.channelId, workspace.workspaces]);

  const loading =
    workspace.loading ||
    workspace.workspaces.length === 0 ||
    pageStatus.loading;

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
      {!pageStatus.status && <Outlet />}
      {pageStatus.status === "channel-notFound" && <NotFoundChannelPage />}
      {pageStatus.status === "channel-restricted" && <RestrictedChannelPage />}
    </div>
  );
}

export default DashboardPage;
