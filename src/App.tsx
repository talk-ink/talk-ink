import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import SidebarComponent from "components/Sidebar/SidebarComponent";
import ChannelPage from "pages/Channel";
import InboxPage from "pages/Inbox";
import React from "react";

function App() {
  return (
    <div className="w-full min-h-screen grid grid-cols-[280px_1fr] overflow-hidden">
      <SidebarComponent />
      <InboxPage />
      {/* <ChannelPage /> */}
    </div>
  );
}

export default App;
