import { useEffect } from "react";
import { Route, Routes } from "react-router";
import cookies from "js-cookie";

import NotFound from "components/NotFound/NotFound";
import ChannelPage from "pages/Channel";
import DashboardPage from "pages/Dashboard";
import InboxPage from "pages/Inbox";
import Compose from "pages/Channel/Compose";
import RestrictedRoute from "routes/RestrictedRoute";
import LoginPage from "pages/Login";
import RegisterPage from "pages/Register";
import { useAppDispatch } from "hooks/useAppDispatch";
import { setAuthLoading, setAuthToken, setAuthUser } from "features/auth";
import { kontenbase } from "lib/client";
import { Token, User } from "types";

function App() {
  const dispatch = useAppDispatch();
  const checkUser = async () => {
    try {
      const cookiesToken: Token = { token: cookies.get("token") };
      if (!cookiesToken.token) throw new Error("Invalid Token");

      const { data } = await kontenbase.auth.profile();

      if (!data) throw new Error("Invalid user");

      const user: User = data;

      dispatch(setAuthToken(cookiesToken));
      dispatch(setAuthUser(user));
    } catch (error) {
      console.log("err", error);
    } finally {
      console.log("awe");
      dispatch(setAuthLoading(false));
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <Routes>
      <Route
        caseSensitive
        path="/a/:workspaceId/"
        element={
          <RestrictedRoute>
            <DashboardPage />
          </RestrictedRoute>
        }
      >
        <Route path="inbox" element={<InboxPage />} />
        <Route path="ch/:channelId" element={<ChannelPage />} />
        <Route path="ch/:channelId/compose/:composeId" element={<Compose />} />
      </Route>
      <Route
        caseSensitive
        path="/login"
        element={
          <RestrictedRoute type="public">
            <LoginPage />
          </RestrictedRoute>
        }
      />
      <Route
        caseSensitive
        path="/register"
        element={
          <RestrictedRoute type="public">
            <RegisterPage />
          </RestrictedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
