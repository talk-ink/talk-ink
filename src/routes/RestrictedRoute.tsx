import React from "react";
import { Navigate, useLocation, useParams } from "react-router";

import { useAppSelector } from "hooks/useAppSelector";
import FullscreenLoading from "components/Loading/FullscreenLoading";

type Props = React.PropsWithChildren<{
  children: JSX.Element;
  type?: "public" | "private";
  from?: "login" | "inviteLogin" | "register" | "inviteRegister" | "landing";
}>;

function RestrictedRoute({ children, type = "private", from }: Props) {
  let params = useParams();
  let location = useLocation();

  let auth = useAppSelector((state) => state.auth);

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
          !auth?.user?.workspaces?.includes(params.workspaceId) &&
          !location.pathname.includes("join_channels")
        ) {
          return (
            <Navigate
              to="/404"
              state={{ params: { message: "Workspace error" } }}
            />
          );
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
          const getLastWorkspaceId = auth?.user?.lastWorkspace?.[0] ?? "";

          if (auth?.user?.workspaces?.includes(getLastWorkspaceId)) {
            return (
              <Navigate
                to={`/a/${getLastWorkspaceId}/inbox`}
                state={{ from: location }}
              />
            );
          }

          return (
            <Navigate
              to={`/a/${auth.user?.workspaces[0]}/inbox`}
              state={{ from: location }}
            />
          );
        }
        if (from === "landing") {
          if (!auth.user?.workspaces || auth.user?.workspaces?.length === 0) {
            return (
              <Navigate to={`/a/create_workspace`} state={{ from: location }} />
            );
          }
          const getLastWorkspaceId = auth?.user?.lastWorkspace?.[0] ?? "";

          if (auth?.user?.workspaces?.includes(getLastWorkspaceId)) {
            return (
              <Navigate
                to={`/a/${getLastWorkspaceId}/inbox`}
                state={{ from: location }}
              />
            );
          } else {
            return (
              <Navigate
                to={`/a/${auth.user?.workspaces[0]}/inbox`}
                state={{ from: location }}
              />
            );
          }
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
