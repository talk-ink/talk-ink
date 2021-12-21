import ChannelButton from "components/Button/ChannelButton";
import IconButton from "components/Button/IconButton";
import ProfileButton from "components/Button/ProfileButton";
import React from "react";
import { BiMoon } from "react-icons/bi";
import SidebarList from "./SidebarList";

function SidebarComponent() {
  return (
    <div className="bg-[#F7FAFB]">
      <div className="w-full flex justify-between py-2 px-3">
        <ProfileButton />
        <IconButton />
      </div>
      <div className="p-2 ">
        <ul className="mb-1">
          <SidebarList type="search" title="Search" />
          <SidebarList type="inbox" active title="Inbox" />
          <SidebarList type="saved" title="Saved" />
          <SidebarList type="messages" title="Messages" />
        </ul>
        <ChannelButton />
        <div>
          <SidebarList type="channel" title="General" />
          <SidebarList type="channel" title="ilham25.thedev.id" />
          <SidebarList type="channel" title="Twist" />
        </div>
      </div>
    </div>
  );
}

export default SidebarComponent;
