import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router";
import OneSignal from "react-onesignal";

import RestrictedRoute from "routes/RestrictedRoute";
import LandingPage from "pages/Landing";
import ThreadPage from "pages/Thread";

import ToastProvider from "components/ToastProvider/ToastProvider";
import NotFound from "components/NotFound/NotFound";

import { useToast } from "hooks/useToast";
import FullscreenLoading from "components/Loading/FullscreenLoading";
import { useAppDispatch } from "hooks/useAppDispatch";
import { setAuthLoading, setAuthToken, setAuthUser } from "features/auth";
import { kontenbase } from "lib/client";
import { Token, TUserProfile } from "types";
import { oneSignalId } from "utils/helper";
import MessagePage from "pages/Message";
import WebviewPage from "pages/Webview";

const ChannelPage = lazy(() => import("pages/Channel"));
const DashboardPage = lazy(() => import("pages/Dashboard"));
const InboxPage = lazy(() => import("pages/Inbox"));
const Compose = lazy(() => import("pages/Channel/Compose"));
const LoginPage = lazy(() => import("pages/Login"));
const RegisterPage = lazy(() => import("pages/Register"));
const CreateWorkspacePage = lazy(() => import("pages/CreateWorkspace"));
const EditThreadPage = lazy(() => import("pages/Thread/Edit"));
const JoinChannelPage = lazy(() => import("pages/JoinChannel"));
const InboxList = lazy(() => import("pages/Inbox/InboxList"));
const InvitedWorkspacePage = lazy(() => import("pages/InvitedWorkspace"));
const SearchPage = lazy(() => import("pages/Search"));
const TrashPage = lazy(() => import("pages/Trash"));
const ThreadList = lazy(() => import("pages/Channel/ThreadList"));

function App() {
  const dispatch = useAppDispatch();
  const [showToast] = useToast();
  const checkUser = async () => {
    try {
      const localStorageToken = localStorage.getItem("token");
      console.log("localStorageToken", localStorageToken);
      if (!localStorageToken) return;

      const { user: userData, error } = await kontenbase.auth.user();

      if (error) throw new Error(error.message);

      await OneSignal.init({
        appId: oneSignalId,
        notifyButton: {
          enable: true,
        },
        allowLocalhostAsSecureOrigin: true,
        autoResubscribe: true,
        autoRegister: true,
        persistNotification: true,
      });

      await OneSignal.showSlidedownPrompt();

      if (userData._id) {
        const isSubscribe = await OneSignal.getSubscription();
        const isIdSet = await OneSignal.getExternalUserId();

        if (!isIdSet) {
          await OneSignal.setExternalUserId(userData._id);
        }

        if (!isSubscribe) {
          await OneSignal.setSubscription(true);
        }
      }

      const token: Token = { token: localStorageToken };
      const user: TUserProfile = userData;

      dispatch(setAuthToken(token));
      dispatch(setAuthUser(user));
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
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
      <Suspense fallback={<FullscreenLoading />}>
        <Routes>
          <Route
            caseSensitive
            path="/"
            element={
              <RestrictedRoute type="public" from="landing">
                <LandingPage />
              </RestrictedRoute>
            }
          />
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
            <Route path="search" element={<SearchPage />} />
            <Route path="inbox/" element={<InboxPage />}>
              <Route path="" element={<InboxList />} />
              <Route path="close" element={<InboxList type="close" />} />
            </Route>
            <Route path="trash" element={<TrashPage />} />

            <Route path="saved" element={<>saved</>} />
            <Route path="messages" element={<>messages</>} />
            <Route path="ch/:channelId/" element={<ChannelPage />}>
              <Route path="" element={<ThreadList />} />
              <Route path="close" element={<ThreadList type="close" />} />
            </Route>
            <Route path="ch/:channelId/t/:threadId" element={<ThreadPage />} />
            <Route
              path="ch/:channelId/te/:threadId"
              element={<EditThreadPage />}
            />

            <Route
              path="ch/:channelId/compose/:composeId"
              element={<Compose />}
            />
            <Route path="msg/:userId" element={<MessagePage />} />
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
          <Route path="/webview" element={<WebviewPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}

export default App;
