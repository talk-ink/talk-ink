import React, { useEffect, useState } from "react";

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

type Props = React.PropsWithChildren<{
  dataSource: Workspace | null | undefined;
}>;

function SidebarComponent({ dataSource }: Props) {
  const auth = useAppSelector((state) => state.auth);
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [channelData, setChannelData] = useState([]);

  const [apiLoading, setApiLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [createChannelModal, setCreateChannelModal] = useState(false);

  const getChannels = async () => {
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
        getChannels();
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
    getChannels();
  }, [params]);

  return (
    <div className="bg-[#F7FAFB] h-screen ">
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
          <WorkspaceButton title={dataSource.name} />
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
        <ChannelButton setCreateChannelModal={setCreateChannelModal} />
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
  );
}

export default SidebarComponent;
