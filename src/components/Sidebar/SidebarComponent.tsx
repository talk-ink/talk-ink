import React, { useCallback, useEffect, useState } from "react";

import { BiLogOut, BiMoon } from "react-icons/bi";
import cookies from "js-cookie";

import ChannelButton from "components/Button/ChannelButton";
import IconButton from "components/Button/IconButton";
import WorkspaceButton from "components/Button/WorkspaceButton";
import SidebarList from "./SidebarList";
import { useAppSelector } from "hooks/useAppSelector";
import { Channel, CreateChannel, Workspace } from "types";
import { kontenbase } from "lib/client";
import { useNavigate, useParams } from "react-router";
import Popup from "components/Popup/Popup";
import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
import { useAppDispatch } from "hooks/useAppDispatch";
import { logout } from "features/auth";
import Modal from "components/Modal/Modal";
import CreateChannelForm from "components/CreateChannelForm/CreateChannelForm";
import { fetchChannels } from "features/channels/slice";

function SidebarComponent() {
  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);
  const channel = useAppSelector((state) => state.channel);

  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [apiLoading, setApiLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [createChannelModal, setCreateChannelModal] = useState(false);

  const workspaceData: Workspace = workspace.workspaces.find(
    (data) => data._id === params.workspaceId
  );

  const channelData: Channel[] = channel.channels;
  const userId: string = auth.user.id;

  const handleLogout = async () => {
    try {
      await kontenbase.auth.logout();

      cookies.remove("token");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.log("err", error);
    }
  };

  const createChannelHandler = async (values: CreateChannel) => {
    setCreateLoading(true);
    try {
      const createChannel = await kontenbase.service("Channels").create({
        ...values,
        members: auth.user.id,
        workspace: params.workspaceId,
      });
      if (createChannel) {
        // getChannels();
        setCreateChannelModal(false);
        navigate(`/a/${params.workspaceId}/ch/${createChannel?.data?._id}`);
      }
    } catch (error) {
      console.log("err", error);
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    // getChannels();
    dispatch(fetchChannels({ userId, workspaceId: params.workspaceId }));
  }, [params.workspaceId]);

  const loading = workspace.loading || channel.loading;

  return (
    !loading && (
      <div>
        <div className="bg-[#F7FAFB] h-screen overflow-auto">
          <div className="bg-[#F7FAFB] w-full flex justify-between py-2 px-3 sticky top-0">
            <Popup
              content={
                <div>
                  <Menu>
                    <MenuItem
                      icon={<BiLogOut size={20} className="text-neutral-400" />}
                      title="Log Out"
                      onClick={handleLogout}
                    />
                  </Menu>
                </div>
              }
              position="right"
            >
              <WorkspaceButton title={workspaceData?.name} />
            </Popup>
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
            <ChannelButton setCreateChannelModal={setCreateChannelModal} />
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
        <Modal
          header="Create new channel"
          onClose={() => {
            setCreateChannelModal(false);
          }}
          visible={createChannelModal}
          footer={null}
        >
          <CreateChannelForm
            onSubmit={createChannelHandler}
            loading={createLoading}
            onCancel={() => {
              setCreateChannelModal(false);
            }}
          />
        </Modal>
      </div>
    )
  );
}

export default SidebarComponent;
