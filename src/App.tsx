import { useEffect } from "react";
import { Route, Routes } from "react-router";
import cookies from "js-cookie";

import ChannelPage from "pages/Channel";
import DashboardPage from "pages/Dashboard";
import InboxPage from "pages/Inbox";
import Compose from "pages/Channel/Compose";
import RestrictedRoute from "routes/RestrictedRoute";
import LoginPage from "pages/Login";
import RegisterPage from "pages/Register";
import LandingPage from "pages/Landing";
import CreateWorkspacePage from "pages/CreateWorkspace";

import NotFound from "components/NotFound/NotFound";

import { useAppDispatch } from "hooks/useAppDispatch";
import { setAuthLoading, setAuthToken, setAuthUser } from "features/auth";
import { kontenbase } from "lib/client";
import { Token, User } from "types";
import ThreadPage from "pages/Thread";

function App() {
  const dispatch = useAppDispatch();
  const checkUser = async () => {
    try {
      const cookiesToken = cookies.get("token");
      if (!cookiesToken) return;

      const { data } = await kontenbase.auth.profile();

      if (!data) throw new Error("Invalid user");

      const token: Token = { token: cookiesToken };
      const user: User = data;

      dispatch(setAuthToken(token));
      dispatch(setAuthUser(user));
    } catch (error) {
      console.log("err", error);
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <Routes>
      <Route caseSensitive path="/" element={<LandingPage />} />
      <Route
        caseSensitive
        path="/a/create_workspace"
        element={
          <RestrictedRoute>
            <CreateWorkspacePage />
          </RestrictedRoute>
        }
      />
      <Route
        caseSensitive
        path="/a/:workspaceId/"
        element={
          <RestrictedRoute>
            <DashboardPage />
          </RestrictedRoute>
        }
      >
        <Route path="search" element={<>search</>} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="saved" element={<>saved</>} />
        <Route path="messages" element={<>messages</>} />
        <Route path="ch/:channelId" element={<ChannelPage />} />
        <Route path="ch/:channelId/t/:threadId" element={<ThreadPage />} />
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
