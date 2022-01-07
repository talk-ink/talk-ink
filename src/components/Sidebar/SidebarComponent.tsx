import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import { BiLogOut, BiMoon, BiPlus, BiUserPlus } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import cookies from "js-cookie";
import { useNavigate, useParams } from "react-router";

import ChannelButton from "components/Button/ChannelButton";
import IconButton from "components/Button/IconButton";
import WorkspaceButton from "components/Button/WorkspaceButton";
import Popup from "components/Popup/Popup";
import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
import { useAppDispatch } from "hooks/useAppDispatch";
import Modal from "components/Modal/Modal";
import ChannelForm from "components/ChannelForm/ChannelForm";
import SidebarList from "./SidebarList";

import { kontenbase } from "lib/client";
import { Channel, CreateChannel, Workspace } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import { logout } from "features/auth";
import {
  addChannel,
  deleteChannel,
  fetchChannels,
} from "features/channels/slice";
import EditChannelForm from "components/ChannelForm/EditChannelForm";
import { useToast } from "hooks/useToast";
import AddMembers from "components/Members/AddMembers";
import WorkspaceListButton from "components/Button/WorkspaceListButton";
import Divider from "components/Divider/Divider";
import SettingsModal from "components/SettingsModal/SettingsModal";

type TProps = {
  isMobile: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

function SidebarComponent({
  isMobile,
  isSidebarOpen,
  setIsSidebarOpen,
}: TProps) {
  const auth = useAppSelector((state) => state.auth);
  const workspace = useAppSelector((state) => state.workspace);
  const channel = useAppSelector((state) => state.channel);
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [modalLoading, setModalLoading] = useState(false);

  const [createChannelModal, setCreateChannelModal] = useState(false);
  const [editChannelModal, setEditChannelModal] = useState(false);
  const [leaveChannelModal, setLeaveChannelModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);

  const [selectedChannel, setSelectedChannel] = useState<
    Channel | null | undefined
  >(null);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

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
      showToast({ message: `${error}` });
    }
  };

  const getChannels = () => {
    dispatch(fetchChannels({ userId, workspaceId: params.workspaceId }));
  };

  const createChannelHandler = async (values: CreateChannel) => {
    setModalLoading(true);
    try {
      const createChannel = await kontenbase.service("Channels").create({
        ...values,
        members: [...workspaceData.peoples, auth.user.id],
        workspace: params.workspaceId,
      });

      if (createChannel) {
        dispatch(addChannel(createChannel.data));
        setCreateChannelModal(false);
        navigate(`/a/${params.workspaceId}/ch/${createChannel?.data?._id}`);
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    } finally {
      setModalLoading(false);
    }
  };

  const leaveChannelHandler = async () => {
    try {
      let members = selectedChannel.members.filter((data) => data !== userId);

      await kontenbase.service("Channels").updateById(selectedChannel?._id, {
        members,
      });

      dispatch(deleteChannel(selectedChannel));
      setSelectedChannel(null);
      setLeaveChannelModal(false);
      navigate(`/a/${params.workspaceId}/inbox`);
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    }
  };

  useEffect(() => {
    getChannels();
  }, [params.workspaceId]);

  const loading = workspace.loading || channel.loading;

  return (
    <div>
      <div
        className={
          isMobile
            ? `bg-[#F7FAFB] top-0 left-0 fixed h-full z-40  ease-in-out duration-300 ${
                isSidebarOpen
                  ? "translate-x-0 w-[80vw] "
                  : "-translate-x-full w-full"
              } md:block`
            : `bg-[#F7FAFB] h-screen hidden md:block`
        }
      >
        <div className="bg-[#F7FAFB] w-full flex justify-between py-2 px-3 sticky top-0 z-10">
          <Popup
            content={
              <div>
                <Menu>
                  <div className="max-h-40 overflow-auto">
                    {workspace.workspaces.map((data, idx) => (
                      <WorkspaceListButton
                        key={idx}
                        data={data}
                        onClick={() => {
                          navigate(`/a/${data._id}/inbox`);
                        }}
                      />
                    ))}
                  </div>

                  <Divider />
                  <MenuItem
                    icon={<BiPlus size={20} className="text-neutral-400" />}
                    title="Create new workspace"
                    onClick={() => {
                      navigate("/a/create_workspace");
                    }}
                  />

                  <Divider />

                  <MenuItem
                    icon={<FiSettings size={20} className="text-neutral-400" />}
                    title="Settings & members"
                    onClick={() => {
                      setSettingsModal(true);
                    }}
                  />
                  <MenuItem
                    icon={<BiLogOut size={20} className="text-neutral-400" />}
                    title="Log Out"
                    onClick={handleLogout}
                  />
                </Menu>
              </div>
            }
            position={isMobile ? "bottom" : "right"}
          >
            {!loading && <WorkspaceButton workspaceData={workspaceData} />}
          </Popup>
          <IconButton>
            {isMobile ? (
              <MdClose
                size={18}
                className="text-neutral-400"
                onClick={() => setIsSidebarOpen(false)}
              />
            ) : (
              <BiMoon size={18} className="text-neutral-400" />
            )}
          </IconButton>
        </div>
        {!loading && (
          <div className="p-2">
            <ul className="mb-1">
              <SidebarList
                type="search"
                name="Search"
                link={`/a/${workspaceData?._id}/search`}
                setIsSidebarOpen={setIsSidebarOpen}
              />
              <SidebarList
                type="inbox"
                name="Inbox"
                link={`/a/${workspaceData?._id}/inbox`}
                setIsSidebarOpen={setIsSidebarOpen}
              />
              <SidebarList
                type="saved"
                name="Saved"
                link={`/a/${workspaceData?._id}/saved`}
                setIsSidebarOpen={setIsSidebarOpen}
              />
              <SidebarList
                type="messages"
                name="Messages"
                link={`/a/${workspaceData?._id}/messages`}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            </ul>
            <ChannelButton setCreateChannelModal={setCreateChannelModal} />
            <div className="relative z-0">
              {channelData?.map((channel, idx) => (
                <SidebarList
                  setIsSidebarOpen={setIsSidebarOpen}
                  key={idx + channel._id}
                  type="channel"
                  name={channel.name}
                  data={channel}
                  link={`/a/${workspaceData?._id}/ch/${channel._id}`}
                  isDefault
                  count={channel.threads.length}
                  leaveModalHandler={(channel) => {
                    setLeaveChannelModal(true);
                    setSelectedChannel(channel);
                  }}
                  editModalHandler={(channel) => {
                    setEditChannelModal(true);
                    setSelectedChannel(channel);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <Modal
        header="Create new channel"
        onClose={() => {
          setCreateChannelModal(false);
        }}
        visible={createChannelModal}
        footer={null}
      >
        <ChannelForm
          onSubmit={createChannelHandler}
          loading={modalLoading}
          onCancel={() => {
            setCreateChannelModal(false);
          }}
        />
      </Modal>
      <Modal
        header="Edit channel"
        visible={editChannelModal}
        onClose={() => {
          setEditChannelModal(false);
          setSelectedChannel(null);
        }}
        onCancel={() => {
          setEditChannelModal(false);
          setSelectedChannel(null);
        }}
        footer={null}
      >
        <EditChannelForm
          data={selectedChannel}
          onClose={() => {
            setEditChannelModal(false);
            setSelectedChannel(null);
          }}
        />
      </Modal>
      <Modal
        header={`Leave ${
          selectedChannel?.privacy === "private" ? "private" : "public"
        } channel?`}
        okButtonText="Leave channel"
        visible={!!selectedChannel && leaveChannelModal}
        onCancel={() => {
          setSelectedChannel(null);
          setLeaveChannelModal(false);
        }}
        onClose={() => {
          setSelectedChannel(null);
          setLeaveChannelModal(false);
        }}
        onConfirm={() => {
          leaveChannelHandler();
        }}
      >
        <p className="text-sm">
          Are you sure you want to leave this channel? You can always join it
          again later.
        </p>
      </Modal>
      <SettingsModal
        footer={null}
        visible={settingsModal}
        onClose={() => {
          setSettingsModal(false);
        }}
      />
    </div>
  );
}

export default SidebarComponent;
