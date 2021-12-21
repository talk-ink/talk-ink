import React from "react";

import { BiMoon } from "react-icons/bi";

import ChannelButton from "components/Button/ChannelButton";
import IconButton from "components/Button/IconButton";
import ProfileButton from "components/Button/ProfileButton";
import SidebarList from "./SidebarList";

function SidebarComponent() {
  return (
    <div className="bg-[#F7FAFB] h-screen overflow-auto">
      <div className="bg-[#F7FAFB] w-full flex justify-between py-2 px-3 sticky top-0">
        <ProfileButton />
        <IconButton>
          <BiMoon size={18} className="text-neutral-400" />
        </IconButton>
      </div>
      <div className="p-2 ">
        <ul className="mb-1">
          <SidebarList type="search" title="Search" link={`/a/:123/search`} />
          <SidebarList type="inbox" title="Inbox" link={`/a/:123/inbox`} />
          <SidebarList type="saved" title="Saved" link={`/a/:123/saved`} />
          <SidebarList
            type="messages"
            title="Messages"
            link={`/a/:123/messages`}
          />
        </ul>
        <ChannelButton />
        <div>
          <SidebarList
            type="channel"
            title="General"
            link={`/a/:123/ch/:ch1`}
            isDefault
          />
          <SidebarList
            type="channel"
            title="ilham25.thedev.id"
            link={`/a/:123/ch/:ch2`}
          />
          <SidebarList
            type="channel"
            title="Twist"
            link={`/a/:123/ch/:ch3`}
            isDefault
          />
        </div>
      </div>
    </div>
  );
}

export default SidebarComponent;
