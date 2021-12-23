import React, { useEffect, useState } from "react";

import { BiMoon } from "react-icons/bi";

import ChannelButton from "components/Button/ChannelButton";
import IconButton from "components/Button/IconButton";
import WorkspaceButton from "components/Button/WorkspaceButton";
import SidebarList from "./SidebarList";
import { useAppSelector } from "hooks/useAppSelector";
import { Channel, Workspace } from "types";
import { kontenbase } from "lib/client";
import { useParams } from "react-router";

type Props = React.PropsWithChildren<{
  dataSource: Workspace | null | undefined;
}>;

function SidebarComponent({ dataSource }: Props) {
  const auth = useAppSelector((state) => state.auth);
  const params = useParams();

  const [channelData, setChannelData] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  const getChannels = async (ids: string[]) => {
    setApiLoading(true);
    try {
      const { data } = await kontenbase
        .service("Channels")
        .find({ where: { members: auth.user.id, workspace: dataSource.id } });
      setChannelData(data);
    } catch (error) {
      console.log("err", error);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    getChannels(dataSource.channels);
  }, [params]);

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
          {channelData?.map((channel, idx) => (
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
