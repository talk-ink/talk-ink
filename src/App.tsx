import { Route, Routes } from "react-router";

import NotFound from "components/NotFound/NotFound";
import ChannelPage from "pages/Channel";
import DashboardPage from "pages/Dashboard";
import InboxPage from "pages/Inbox";
import Compose from "pages/Channel/Compose";
import RestrictedRoute from "routes/RestrictedRoute";
import LoginPage from "pages/Login";
import RegisterPage from "pages/Register";

function App() {
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
