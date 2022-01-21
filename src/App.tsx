import { useEffect } from "react";
import { Route, Routes } from "react-router";
import cookies from "js-cookie";
import OneSignal from "react-onesignal";

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
import { Token, TUserProfile } from "types";
import ThreadPage from "pages/Thread";
import EditThreadPage from "pages/Thread/Edit";
import ToastProvider from "components/ToastProvider/ToastProvider";
import { useToast } from "hooks/useToast";
import JoinChannelPage from "pages/JoinChannel";
import InboxList from "pages/Inbox/InboxList";
import InvitedWorkspacePage from "pages/InvitedWorkspace";
import { oneSignalId } from "utils/helper";

function App() {
  const dispatch = useAppDispatch();
  const [showToast] = useToast();
  const checkUser = async () => {
    try {
      const cookiesToken = cookies.get("token");
      if (!cookiesToken) return;

      const { user: userData } = await kontenbase.auth.user();

      if (!userData) throw new Error("Invalid user");

      OneSignal.init({
        appId: oneSignalId,
        notifyButton: {
          enable: true,
        },
        allowLocalhostAsSecureOrigin: true,
        autoResubscribe: true,
      }).then(() => {
        OneSignal.showSlidedownPrompt();
      });

      const token: Token = { token: cookiesToken };
      const user: TUserProfile = userData;

      dispatch(setAuthToken(token));
      dispatch(setAuthUser(user));
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToastProvider>
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
          <Route path="inbox/" element={<InboxPage />}>
            <Route path="" element={<InboxList />} />
            <Route path="done" element={<InboxList type="done" />} />
          </Route>

          <Route path="saved" element={<>saved</>} />
          <Route path="messages" element={<>messages</>} />
          <Route path="ch/:channelId" element={<ChannelPage />} />
          <Route path="ch/:channelId/t/:threadId" element={<ThreadPage />} />
          <Route
            path="ch/:channelId/te/:threadId"
            element={<EditThreadPage />}
          />
          <Route
            path="ch/:channelId/compose/:composeId"
            element={<Compose />}
          />
        </Route>
        <Route
          path="/a/:workspaceId/join_channels"
          element={
            <RestrictedRoute>
              <JoinChannelPage />
            </RestrictedRoute>
          }
        />
        <Route
          caseSensitive
          path="/login"
          element={
            <RestrictedRoute type="public" from="login">
              <LoginPage />
            </RestrictedRoute>
          }
        />
        <Route
          caseSensitive
          path="/register"
          element={
            <RestrictedRoute type="public" from="register">
              <RegisterPage />
            </RestrictedRoute>
          }
        />
        <Route
          caseSensitive
          path="/j/:inviteId"
          element={<InvitedWorkspacePage />}
        />
        <Route
          caseSensitive
          path="/j/:inviteId/login"
          element={
            <RestrictedRoute type="public" from="inviteLogin">
              <LoginPage />
            </RestrictedRoute>
          }
        />
        <Route
          caseSensitive
          path="/j/:inviteId/register"
          element={
            <RestrictedRoute type="public" from="inviteRegister">
              <RegisterPage />
            </RestrictedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
