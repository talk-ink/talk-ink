import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "hooks/useAppSelector";
import FullscreenLoading from "components/Loading/FullscreenLoading";

type Props = React.PropsWithChildren<{
  children: JSX.Element;
  type?: "public" | "private";
}>;

function RestrictedRoute({ children, type = "private" }: Props) {
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
        return <Navigate to="/404" state={{ from: location }} />;
      }
      break;

    default:
      return <Navigate to="/login" state={{ from: location }} />;
      break;
  }

  return children;
}

export default RestrictedRoute;
