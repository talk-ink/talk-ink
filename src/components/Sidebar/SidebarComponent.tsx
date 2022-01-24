import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import { BiLogOut, BiPlus } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import cookies from "js-cookie";
import { useNavigate, useParams } from "react-router";
import OneSignal from "react-onesignal";
import { kontenbase } from "lib/client";
import { FaPlus } from "react-icons/fa";

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
import EditChannelForm from "components/ChannelForm/EditChannelForm";
import WorkspaceListButton from "components/Button/WorkspaceListButton";
import Divider from "components/Divider/Divider";
import SettingsModal from "components/SettingsModal/SettingsModal";
import { updateWorkspace } from "features/workspaces";
import ChannelInfo from "components/ChannelForm/ChannelInfo";
import AddChannelMember from "components/ChannelForm/AddChannelMember";
import BrowseChannels from "components/BrowseChannels";

import { logout } from "features/auth";
import {
  addChannel,
  deleteChannel,
  fetchChannels,
  updateChannel,
} from "features/channels/slice";
import limitImage from "assets/image/limit.svg";

import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";
import { addThread, deleteThread, updateThread } from "features/threads";
import { updateUser } from "features/auth";

import { Channel, CreateChannel, Thread } from "types";

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
  const [channelInfoModal, setChannelInfoModal] = useState(false);
  const [leaveChannelModal, setLeaveChannelModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [browseChannelsModal, setBrowseChannelsModal] = useState(false);
  const [inboxData, setInboxData] = useState<Thread[]>([]);
  const [isWorkspaceLimitModalVisible, setIsWorkspaceLimitModalVisible] =
    useState(false);

  const [selectedChannel, setSelectedChannel] = useState<
    Channel | null | undefined
  >(null);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  const userId = useMemo(() => auth.user._id, [auth.user._id]);

  const channelData: Channel[] = useMemo(() => {
    return channel.channels.filter((data) => data.members.includes(userId));
  }, [channel.channels, userId]);

  const channelDataAll: string[] = useMemo(
    () => channel.channels.map((data) => data._id),
    [channel.channels]
  );

  const readedThreads: string[] = useMemo(() => {
    if (!auth.user.readedThreads) return [];
    return auth.user.readedThreads;
  }, [auth.user]);

  useEffect(() => {
    if (!userId || !params.workspaceId) return;

    (async () => {
      const { data } = await kontenbase.service("Threads").find({
        where: {
          workspace: params.workspaceId,
          tagedUsers: { $in: [userId] },
        },
      });

      setInboxData(data);
    })();
  }, [params.workspaceId, userId]);

  const threadData = useMemo(() => {
    return inboxData
      .filter((data) => !auth.user.doneThreads?.includes(data._id))
      .filter((item) => item.tagedUsers?.includes(userId));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboxData, auth.user, params, channelData]);

  const inboxLeft: number = useMemo(() => {
    return threadData.filter((item) => !readedThreads.includes(item._id))
      .length;
  }, [threadData, readedThreads]);

  const handleLogout = async () => {
    try {
      await kontenbase.auth.logout();

      cookies.remove("token");
      OneSignal.removeExternalUserId();
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
        members: values?.members,
        workspace: params.workspaceId,
      });

      if (createChannel) {
        dispatch(addChannel(createChannel.data));
        dispatch(
          updateWorkspace({
            _id: params.workspaceId,
            channels: [...workspaceData.channels, createChannel?.data?._id],
          })
        );
        setCreateChannelModal(false);
        if (values?.members?.includes(userId)) {
          navigate(`/a/${params.workspaceId}/ch/${createChannel?.data?._id}`);
        }
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

  const showManageMemberModal = (channel: Channel) => {
    setAddMemberModal(true);
    setSelectedChannel(channel);
  };

  useEffect(() => {
    getChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId]);

  useEffect(() => {
    let key: string | undefined;

    kontenbase.realtime
      .subscribe("Threads", { event: "*" }, async (message) => {
        const { event, payload } = message;
        const isUpdate = event === "UPDATE_RECORD";

        const isCurrentWorkspace = isUpdate
          ? payload?.before?.workspace?.includes(params.workspaceId)
          : payload?.workspace?.includes(params.workspaceId);

        // const isNotCreatedByThisUser = isUpdate
        //   ? payload?.before?.createdBy !== userId
        //   : payload?.createdBy !== userId;

        const isThreadInJoinedChannel = channelDataAll.includes(
          isUpdate ? payload?.before?.channel?.[0] : payload?.channel?.[0]
        );

        const { data } = await kontenbase.service("Users").find({
          where: {
            id: isUpdate ? payload?.before?.createdBy : payload.createdBy,
          },
        });

        const createdBy = data?.[0];

        const updateUserStore = async () => {
          const { user: userData } = await kontenbase.auth.user();

          dispatch(updateUser({ ...userData, avatar: auth.user.avatar }));
        };

        if (isCurrentWorkspace && isThreadInJoinedChannel) {
          switch (event) {
            case "UPDATE_RECORD":
              if (payload.before.tagedUsers.includes(userId)) {
                if (
                  threadData.find((item) => item._id === payload.before?._id)
                ) {
                  const { data } = await kontenbase.service("Comments").find({
                    where: {
                      threads: payload.before._id,
                    },
                    lookup: ["subComments"],
                  });

                  dispatch(
                    updateThread({
                      ...payload.before,
                      ...payload.after,
                      createdBy,
                      comments: data,
                    })
                  );

                  const updatedInbox = inboxData.map((item) =>
                    item._id === payload.before._id
                      ? {
                          ...payload.before,
                          ...payload.after,
                        }
                      : item
                  );
                  setInboxData(updatedInbox);
                } else {
                  dispatch(
                    addThread({
                      ...payload.before,
                      ...payload.after,
                      createdBy,
                    })
                  );

                  const newInboxData = [
                    ...inboxData,
                    {
                      ...payload.before,
                      ...payload.after,
                    },
                  ];

                  setInboxData(newInboxData);
                }

                updateUserStore();
              }
              break;
            case "CREATE_RECORD":
              dispatch(addThread({ ...payload, createdBy }));

              const newInboxData = [...inboxData, { ...payload, createdBy }];

              setInboxData(newInboxData);

              updateUserStore();
              break;
            case "DELETE_RECORD":
              dispatch(deleteThread(payload));
              break;

            default:
              break;
          }
        }
      })
      .then((result) => (key = result));

    return () => {
      kontenbase.realtime.unsubscribe(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelData, threadData]);

  useEffect(() => {
    let key: string | undefined;

    kontenbase.realtime
      .subscribe("Channels", { event: "*" }, async (message) => {
        const { event, payload } = message;
        const isUpdate = event === "UPDATE_RECORD";

        const { data } = await kontenbase.service("Users").find({
          where: {
            id: isUpdate ? payload?.before?.createdBy : payload.createdBy,
          },
        });

        const createdBy = data?.[0];

        const channelCurrentWorkspace = isUpdate
          ? payload.before.workspace.includes(params.workspaceId)
          : payload.workspace.includes(params.workspaceId);

        if (channelCurrentWorkspace) {
          switch (event) {
            case "UPDATE_RECORD":
              dispatch(
                updateChannel({
                  ...payload.before,
                  ...payload.after,
                })
              );
              break;
            case "CREATE_RECORD":
              dispatch(
                addChannel({
                  ...payload,
                  createdBy,
                })
              );
              break;
            default:
              break;
          }
        }
      })
      .then((result) => (key = result));

    return () => {
      kontenbase.realtime.unsubscribe(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = workspace.loading || channel.loading;

  return (
    <div
      id="modal-container"
      className={
        isSidebarOpen &&
        `w-screen min-h-screen absolute bg-[rgba(0,0,0,0.5)] top-0 left-0 flex justify-center items-start z-[9999]`
      }
      onClick={(e: any) => {
        if (e?.target?.id === "modal-container") {
          setIsSidebarOpen(false);
        }
      }}
    >
      <div>
        <div
          className={
            isMobile
              ? `bg-[#F7FAFB] top-0 left-0 fixed h-full z-40  ease-in-out duration-300 ${
                  isSidebarOpen
                    ? "translate-x-0 w-[80vw] "
                    : "-translate-x-full w-full"
                } md:block`
              : `bg-[#F7FAFB] h-screen hidden md:block relative z-[51] `
          }
        >
          <div className="bg-[#F7FAFB] w-full flex justify-between py-2 px-3 fixed: md:sticky top-0 z-[51]">
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
                        if (
                          workspace.workspaces.find(
                            (item) => item.createdBy._id === auth.user._id
                          )
                        ) {
                          return setIsWorkspaceLimitModalVisible(true);
                        }
                        navigate("/a/create_workspace");
                      }}
                    />

                    <Divider />

                    <MenuItem
                      icon={
                        <FiSettings size={20} className="text-neutral-400" />
                      }
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
            {isMobile ? (
              <IconButton>
                <MdClose
                  size={18}
                  className="text-neutral-400"
                  onClick={() => setIsSidebarOpen(false)}
                />
              </IconButton>
            ) : (
              <>
                {/* <IconButton>
                <BiMoon size={18} className="text-neutral-400" />
              </IconButton> */}
              </>
            )}
          </div>
          {!loading && (
            <div className="p-2">
              <ul className="mb-1">
                {/* <SidebarList
                type="search"
                name="Search"
                link={`/a/${workspaceData?._id}/search`}
                setIsSidebarOpen={setIsSidebarOpen}
              /> */}
                <SidebarList
                  type="inbox"
                  name="Inbox"
                  link={`/a/${workspaceData?._id}/inbox`}
                  setIsSidebarOpen={setIsSidebarOpen}
                  count={inboxLeft || 0}
                />
                {/* <SidebarList
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
              /> */}
              </ul>
              <ChannelButton
                onAddChannelClick={() => setCreateChannelModal(true)}
                onBrowseChannels={() => setBrowseChannelsModal(true)}
              />
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
                    count={channel.threads.length ?? 0}
                    leaveModalHandler={(channel) => {
                      setLeaveChannelModal(true);
                      setSelectedChannel(channel);
                    }}
                    editModalHandler={(channel) => {
                      setEditChannelModal(true);
                      setSelectedChannel(channel);
                    }}
                    channelInfoHandler={(channel) => {
                      setChannelInfoModal(true);
                      setSelectedChannel(channel);
                    }}
                    addMemberHandler={(channel) => {
                      showManageMemberModal(channel);
                    }}
                    isAdmin={
                      workspaceData.createdBy?._id === auth.user?._id ||
                      channel?.createdBy?._id === auth.user?._id
                    }
                  />
                ))}
                <div
                  className="cursor-pointer w-full rounded hover:bg-neutral-100 flex items-center justify-between group mt-1"
                  onClick={() => setCreateChannelModal(true)}
                >
                  <div className=" `w-full flex items-center text-sm pl-3 h-8`">
                    <FaPlus size={15} className="mr-3 text-gray-400" />
                    <p className="max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                      New Channel
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Modal
          header="Wokrspace Reach Max Limit"
          onClose={() => {
            setIsWorkspaceLimitModalVisible(false);
          }}
          visible={isWorkspaceLimitModalVisible}
          footer={null}
          size="small"
        >
          <div className="flex justify-center items-center px-10 py-10">
            <img src={limitImage} alt="limit" className="w-100 md:max-w-xs" />
          </div>
        </Modal>
        <Modal
          header="Create new channel"
          onClose={() => {
            setCreateChannelModal(false);
          }}
          visible={createChannelModal}
          footer={null}
          size="small"
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
          size="small"
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
          header="Channel information"
          visible={channelInfoModal}
          onClose={() => {
            setChannelInfoModal(false);
            setSelectedChannel(null);
          }}
          onCancel={() => {
            setChannelInfoModal(false);
            setSelectedChannel(null);
          }}
          footer={null}
          size="small"
        >
          <ChannelInfo
            data={selectedChannel}
            onClose={() => {
              setChannelInfoModal(false);
              setSelectedChannel(null);
            }}
            showManageMemberModal={showManageMemberModal}
          />
        </Modal>
        <Modal
          header="Manage members"
          visible={addMemberModal}
          onClose={() => {
            setAddMemberModal(false);
            setSelectedChannel(null);
          }}
          onCancel={() => {
            setAddMemberModal(false);
            setSelectedChannel(null);
          }}
          footer={null}
          size="small"
        >
          <AddChannelMember
            data={selectedChannel}
            onClose={() => {
              setAddMemberModal(false);
              setSelectedChannel(null);
            }}
          />
        </Modal>
        <Modal
          header="Browse channels"
          visible={browseChannelsModal}
          onClose={() => {
            setBrowseChannelsModal(false);
          }}
          onCancel={() => {
            setBrowseChannelsModal(false);
          }}
          footer={null}
          size="small"
        >
          <BrowseChannels
            onAddNewChannel={() => {
              setCreateChannelModal(true);
              setBrowseChannelsModal(false);
            }}
            onClose={() => {
              setBrowseChannelsModal(false);
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
          size="xs"
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
    </div>
  );
}

export default SidebarComponent;
