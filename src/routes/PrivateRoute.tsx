import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "hooks/useAppSelector";

type Props = React.PropsWithChildren<{
  children: JSX.Element;
}>;

function PrivateRoute({ children }: Props) {
  let auth = useAppSelector((state) => state.auth);
  let location = useLocation();

  if (!auth.token && !auth.user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  return children;
}

export default PrivateRoute;
