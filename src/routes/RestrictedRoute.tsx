import React from "react";
import { Navigate, useLocation, useParams } from "react-router";
import { useAppSelector } from "hooks/useAppSelector";
import FullscreenLoading from "components/Loading/FullscreenLoading";

type Props = React.PropsWithChildren<{
  children: JSX.Element;
  type?: "public" | "private";
  from?: string;
}>;

function RestrictedRoute({ children, type = "private", from }: Props) {
  let params = useParams();
  let location = useLocation();

  let auth = useAppSelector((state) => state.auth);
  let channel = useAppSelector((state) => state.channel);

  if (auth.loading) {
    return <FullscreenLoading />;
  }

  switch (type) {
    case "private":
      if (!auth.token) {
        return <Navigate to="/login" state={{ from: location }} />;
      }
      if (auth.token && auth.user) {
        if (
          auth.user.workspaces &&
          params.workspaceId &&
          !auth?.user?.workspaces?.includes(params.workspaceId)
        ) {
          return (
            <Navigate
              to="/404"
              state={{ params: { message: "Workspace error" } }}
            />
          );
        }
        if (params.channelId && channel.channels.length > 0) {
          const findChannel = channel.channels.find(
            (data) => data._id === params.channelId
          );

          if (
            !findChannel ||
            (findChannel?.privacy === "private" &&
              !findChannel?.members?.includes(auth.user._id))
          ) {
            return (
              <Navigate
                to="/404"
                state={{ params: { message: "Channel error - privacy" } }}
              />
            );
          }
        }
      }
      break;
    case "public":
      if (auth.token) {
        if (
          ["login", "register"].includes(from) &&
          (!auth.user?.workspaces || auth.user?.workspaces?.length === 0)
        ) {
          return (
            <Navigate to={`/a/create_workspace`} state={{ from: location }} />
          );
        }
        if (
          ["login", "register"].includes(from) &&
          auth.user?.workspaces?.length > 0
        ) {
          return (
            <Navigate
              to={`/a/${auth.user?.workspaces[0]}/inbox`}
              state={{ from: location }}
            />
          );
        }
        return <Navigate to="/404" state={{ from: location }} />;
      }
      break;

    default:
      return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
}

export default RestrictedRoute;
