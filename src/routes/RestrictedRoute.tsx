import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "hooks/useAppSelector";
import FullscreenLoading from "components/Loading/FullscreenLoading";

type Props = React.PropsWithChildren<{
  children: JSX.Element;
  type?: "public" | "private";
  from?: string;
}>;

function RestrictedRoute({ children, type = "private", from }: Props) {
  let auth = useAppSelector((state) => state.auth);
  let location = useLocation();

  if (auth.loading) {
    return <FullscreenLoading />;
  }

  switch (type) {
    case "private":
      if (!auth.token) {
        return <Navigate to="/login" state={{ from: location }} />;
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

        if (!auth.user) {
          return <Navigate to="/404" state={{ from: location }} />;
        }
      }
      break;

    default:
      return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
}

export default RestrictedRoute;
