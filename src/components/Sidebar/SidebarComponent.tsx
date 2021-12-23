import React, { useEffect } from "react";

import { BiMoon } from "react-icons/bi";

import ChannelButton from "components/Button/ChannelButton";
import IconButton from "components/Button/IconButton";
import WorkspaceButton from "components/Button/WorkspaceButton";
import SidebarList from "./SidebarList";
import { useAppSelector } from "hooks/useAppSelector";
import { Channel, Workspace } from "types";
import { useGetChannelByIdsQuery } from "features/channels";

type Props = React.PropsWithChildren<{
  dataSource: Workspace | null | undefined;
}>;

function SidebarComponent({ dataSource }: Props) {
  const { data } = useGetChannelByIdsQuery(dataSource.channels);

  return (
    <div className="bg-[#F7FAFB] h-screen overflow-auto">
      <div className="bg-[#F7FAFB] w-full flex justify-between py-2 px-3 sticky top-0">
        <WorkspaceButton title={dataSource.name} />
        <IconButton>
          <BiMoon size={18} className="text-neutral-400" />
        </IconButton>
      </div>
      <div className="p-2 ">
        <ul className="mb-1">
          <SidebarList
            type="search"
            name="Search"
            link={`/a/${dataSource._id}/search`}
          />
          <SidebarList
            type="inbox"
            name="Inbox"
            link={`/a/${dataSource._id}/inbox`}
          />
          <SidebarList
            type="saved"
            name="Saved"
            link={`/a/${dataSource._id}/saved`}
          />
          <SidebarList
            type="messages"
            name="Messages"
            link={`/a/${dataSource._id}/messages`}
          />
        </ul>
        <ChannelButton />
        <div>
          {data?.map((channel, idx) => (
            <SidebarList
              key={idx + channel._id}
              type="channel"
              name={channel.name}
              link={`/a/${dataSource._id}/ch/${channel._id}`}
              isDefault
              count={channel.threads.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SidebarComponent;
