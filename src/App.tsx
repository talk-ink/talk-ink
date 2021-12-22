import { Route, Routes } from "react-router";

import NotFound from "components/NotFound/NotFound";
import ChannelPage from "pages/Channel";
import DashboardPage from "pages/Dashboard";
import InboxPage from "pages/Inbox";
import Compose from "pages/Channel/Compose";
import PrivateRoute from "routes/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route
        caseSensitive
        path="/a/:workspaceId/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      >
        <Route path="inbox" element={<InboxPage />} />
        <Route path="ch/:channelId" element={<ChannelPage />} />
        <Route path="ch/:channelId/compose/:composeId" element={<Compose />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
