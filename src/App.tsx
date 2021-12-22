import { Route, Routes } from "react-router";

import NotFound from "components/NotFound/NotFound";
import ChannelPage from "routes/Channel";
import DashboardPage from "routes/Dashboard";
import InboxPage from "routes/Inbox";
import Compose from "routes/Channel/Compose";

function App() {
  return (
    <Routes>
      <Route caseSensitive path="/a/:workspaceId/" element={<DashboardPage />}>
        <Route path="inbox" element={<InboxPage />} />
        <Route path="ch/:channelId" element={<ChannelPage />} />
        <Route path="ch/:channelId/compose/:composeId" element={<Compose />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
