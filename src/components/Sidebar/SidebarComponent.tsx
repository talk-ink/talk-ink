import React, { useCallback, useEffect, useState } from "react";

import { BiMoon } from "react-icons/bi";

import ChannelButton from "components/Button/ChannelButton";
import IconButton from "components/Button/IconButton";
import WorkspaceButton from "components/Button/WorkspaceButton";
import SidebarList from "./SidebarList";
import { useAppSelector } from "hooks/useAppSelector";
import { Channel, Workspace } from "types";
import { kontenbase } from "lib/client";
import { useParams } from "react-router";
import { useAppDispatch } from "hooks/useAppDispatch";
import { fetchChannels } from "features/channels/slice";

function SidebarComponent() {
  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);
  const channel = useAppSelector((state) => state.channel);

  const dispatch = useAppDispatch();
  const params = useParams();

  const workspaceData: Workspace = workspace.workspaces.find(
    (data) => data._id === params.workspaceId
  );

  const channelData: Channel[] = channel.channels;
  const userId: string = auth.user.id;

  useEffect(() => {
    dispatch(fetchChannels({ userId, workspaceId: params.workspaceId }));
  }, [params.workspaceId]);

  const loading = workspace.loading || channel.loading;

  return (
    !loading && (
      <div className="bg-[#F7FAFB] h-screen overflow-auto">
        <div className="bg-[#F7FAFB] w-full flex justify-between py-2 px-3 sticky top-0">
          <WorkspaceButton title={workspaceData?.name} />
          <IconButton>
            <BiMoon size={18} className="text-neutral-400" />
          </IconButton>
        </div>
        <div className="p-2 ">
          <ul className="mb-1">
            <SidebarList
              type="search"
              name="Search"
              link={`/a/${workspaceData?._id}/search`}
            />
            <SidebarList
              type="inbox"
              name="Inbox"
              link={`/a/${workspaceData?._id}/inbox`}
            />
            <SidebarList
              type="saved"
              name="Saved"
              link={`/a/${workspaceData?._id}/saved`}
            />
            <SidebarList
              type="messages"
              name="Messages"
              link={`/a/${workspaceData?._id}/messages`}
            />
          </ul>
          <ChannelButton />
          <div>
            {channelData?.map((channel, idx) => (
              <SidebarList
                key={idx + channel._id}
                type="channel"
                name={channel.name}
                link={`/a/${workspaceData?._id}/ch/${channel._id}`}
                isDefault
                count={channel.threads.length}
              />
            ))}
          </div>
        </div>
      </div>
    )
  );
}

export default SidebarComponent;
