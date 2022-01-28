import { useEffect, useState } from "react";
import { Outlet, useParams, useNavigate } from "react-router";

import SidebarComponent from "components/Sidebar/SidebarComponent";
import FullscreenLoading from "components/Loading/FullscreenLoading";
import { useAppSelector } from "hooks/useAppSelector";
import { Channel } from "types";
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
import { fetchMembers } from "features/members";

function DashboardPage() {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);
  const pageStatus = useAppSelector((state) => state.pageStatus);

  const dispatch = useAppDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, []);

  const userId: string = auth.user._id;

  useEffect(() => {
    dispatch(fetchWorkspaces({ userId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      if (workspace.workspaces.length === 0) {
        navigate("/404");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.workspaces]);

  const pageStatusHandler = async () => {
    try {
      const workspaceData = workspace.workspaces.find(
        (data) => data._id === params.workspaceId
      );

      if (params?.channelId) {
        const { data: channelData, error }: KontenbaseResponse<Channel> =
          await kontenbase.service("Channels").find({
            where: { id: params.channelId },
            select: ["name", "members", "privacy"],
          });

        if (error) throw new Error(error.message);

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
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    }
  };

  useEffect(() => {
    if (workspace.workspaces.length > 0) {
      pageStatusHandler();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId, params.channelId, workspace.workspaces]);

  useEffect(() => {
    dispatch(fetchMembers({ workspaceId: params.workspaceId }));

    let key: string | undefined;
    kontenbase.realtime
      .subscribe("Workspaces", { event: "UPDATE_RECORD" }, (message) => {
        const { payload } = message;
        const isCurrentWorkspace = payload.after?._id === params.workspaceId;
        if (isCurrentWorkspace) {
          dispatch(fetchMembers({ workspaceId: params.workspaceId }));
        }
      })
      .then((result) => (key = result));

    return () => {
      kontenbase.realtime.unsubscribe(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId]);

  const loading =
    workspace.loading ||
    workspace.workspaces.length === 0 ||
    pageStatus.loading;

  return loading ? (
    <FullscreenLoading />
  ) : (
    <div className="w-full min-h-screen md:grid md:grid-cols-[280px_1fr] overflow-auto md:overflow-hidden text-slightGray relative">
      <FcMenu
        className="absolute top-2 left-2"
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
