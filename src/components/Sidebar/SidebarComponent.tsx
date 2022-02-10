import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { BiLogOut, BiPlus } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import cookies from "js-cookie";
import { useNavigate, useParams, useLocation } from "react-router";
import OneSignal from "react-onesignal";
import { kontenbase } from "lib/client";

import ChannelButton from "components/Button/ChannelButton";
import IconButton from "components/Button/IconButton";
import WorkspaceButton from "components/Button/WorkspaceButton";
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
  fetchChannels,
  updateChannel,
} from "features/channels/slice";
import limitImage from "assets/image/limit.svg";

import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";
import {
  addThread,
  deleteThread,
  updatePartialThread,
  updateThreadComment,
} from "features/threads";
import { updateUser } from "features/auth";
// import { createUniqueArray } from "utils/helper";

import { Channel, CreateChannel, Thread, User } from "types";
import { BsPlus } from "react-icons/bs";
import { Popover } from "@headlessui/react";

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
  const thread = useAppSelector((state) => state.thread);

  const [showToast] = useToast();

  const { pathname } = useLocation();
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
  const [trashData, setTrashData] = useState<string[]>([]);
  const [isWorkspaceLimitModalVisible, setIsWorkspaceLimitModalVisible] =
    useState(false);
  const [runOnce, setRunOnce] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channel.channels?.length]
  );

  const readedThreads: string[] = useMemo(() => {
    if (!auth.user.readedThreads) return [];
    return auth.user.readedThreads;
  }, [auth.user]);

  const threadData = useMemo(() => {
    return inboxData
      .filter((data) => !auth.user.doneThreads?.includes(data._id))
      .filter((item) => item.tagedUsers?.includes(userId));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboxData, auth.user, params, channelData]);

  const inboxLeft: number = useMemo(() => {
    return threadData.filter(
      (item) => !readedThreads.includes(item._id) && !item.isDeleted
    ).length;
  }, [threadData, readedThreads]);

  const getThreads = useCallback((): Thread[] => {
    return thread.threads;
  }, [thread.threads]);

  useEffect(() => {
    if (!userId || !params.workspaceId || runOnce) return;

    (async () => {
      try {
        const { data, error } = await kontenbase.service("Threads").find({
          where: {
            workspace: params.workspaceId,
            tagedUsers: { $in: [userId] },
          },
        });

        if (error) throw new Error(error.message);

        setInboxData(data);
        setRunOnce(true);
      } catch (error) {
        if (error instanceof Error) {
          showToast({ message: `${JSON.stringify(error?.message)}` });
        }
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId, userId, runOnce]);

  useEffect(() => {
    if (!userId || !params.workspaceId) return;
    (async () => {
      try {
        const { data, error } = await kontenbase.service("Threads").find({
          where: {
            workspace: params.workspaceId,
            createdBy: userId,
            isDeleted: true,
          },
        });

        if (error) throw new Error(error.message);

        setTrashData(data.map((item) => item._id));
      } catch (error) {
        if (error instanceof Error) {
          showToast({ message: `${JSON.stringify(error?.message)}` });
        }
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId, userId]);

  const handleLogout = async () => {
    try {
      const { error } = await kontenbase.auth.logout();

      if (error) throw new Error(error.message);

      cookies.remove("token");
      OneSignal.removeExternalUserId();

      dispatch(logout());
      navigate("/login");
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
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

      if (createChannel?.error) throw new Error(createChannel.error.message);

      if (createChannel.data) {
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
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const leaveChannelHandler = async () => {
    try {
      let members = selectedChannel.members.filter((data) => data !== userId);

      const { error } = await kontenbase
        .service("Channels")
        .updateById(selectedChannel?._id, {
          members,
        });

      if (error) throw new Error(error.message);

      setSelectedChannel(null);
      setLeaveChannelModal(false);
      navigate(`/a/${params.workspaceId}/inbox`);
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    }
  };

  const showManageMemberModal = (channel: Channel) => {
    setAddMemberModal(true);
    setSelectedChannel(channel);
  };

  const updateUserStore = async () => {
    try {
      const { user: userData, error } = await kontenbase.auth.user();

      if (error) throw new Error(error.message);

      dispatch(
        updateUser({
          avatar: auth.user.avatar,
          readedThreads: userData.readedThreads,
        })
      );
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    }
  };

  useEffect(() => {
    getChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId]);

  const updateThreadWithComment = async ({
    _id,
    thread,
  }: {
    _id: string;
    thread: Thread;
  }) => {
    try {
      const { data, error } = await kontenbase.service("Comments").find({
        where: {
          threads: _id,
        },
        lookup: ["subComments"],
        sort: {
          createdAt: -1,
        },
        limit: 2,
      });

      if (error) throw new Error(error.message);

      dispatch(
        updateThreadComment({
          thread,
          comments: data,
        })
      );
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  useEffect(() => {
    let key: string | undefined;

    console.log("mnt");

    kontenbase.realtime
      .subscribe("Threads", { event: "*" }, async (message) => {
        const { event, payload } = message;
        const isUpdate = event === "UPDATE_RECORD";
        const isDelete = event === "DELETE_RECORD";

        const isCurrentWorkspace = isUpdate
          ? payload?.before?.workspace?.includes(params.workspaceId)
          : payload?.workspace?.includes(params.workspaceId);

        // const isNotCreatedByThisUser = isUpdate
        //   ? payload?.before?.createdBy !== userId
        //   : payload?.createdBy !== userId;

        const isThreadInJoinedChannel = channelDataAll.includes(
          isUpdate ? payload?.before?.channel?.[0] : payload?.channel?.[0]
        );

        let _createdBy: User;

        try {
          if (!isDelete) {
            const { data, error } = await kontenbase.service("Users").find({
              where: {
                id: isUpdate ? payload?.before?.createdBy : payload?.createdBy,
              },
            });

            if (error) throw new Error(error.message);

            _createdBy = data?.[0];
          }

          if (
            (!isDelete ? isCurrentWorkspace : true) &&
            (!isDelete ? isThreadInJoinedChannel : true)
          ) {
            switch (event) {
              case "UPDATE_RECORD":
                console.log("upd", payload);
                if (
                  payload.before.tagedUsers.includes(userId) ||
                  (!payload.before.tagedUsers.includes(userId) &&
                    payload.after.tagedUsers.includes(userId))
                ) {
                  let _currentThread;

                  console.log(getThreads(), "aa");

                  try {
                    const { data, error } = await kontenbase
                      .service("Threads")
                      .find({
                        where: {
                          workspace: params.workspaceId,
                          tagedUsers: { $in: [userId] },
                        },
                      });

                    if (error) throw new Error(error.message);

                    _currentThread = data
                      .filter(
                        (data) => !auth.user.doneThreads?.includes(data._id)
                      )
                      .filter((item) => item.tagedUsers?.includes(userId));
                  } catch (error) {
                    if (error instanceof Error) {
                      showToast({
                        message: `${JSON.stringify(error?.message)}`,
                      });
                    }
                  }

                  if (
                    _currentThread.find(
                      (item) => item._id === payload.before?._id
                    )
                  ) {
                    console.log("wryy");
                    try {
                      updateThreadWithComment({
                        _id: payload?.after?._id,
                        thread: {
                          ...payload?.before,
                          ...payload?.after,
                          createdBy: _createdBy,
                        },
                      });

                      setInboxData((prev) =>
                        prev.map((item) =>
                          item._id === payload.before._id
                            ? {
                                ...payload.before,
                                ...payload.after,
                              }
                            : item
                        )
                      );
                    } catch (error) {
                      console.log("err", error);
                      if (error instanceof Error) {
                        showToast({
                          message: `${JSON.stringify(error?.message)}`,
                        });
                      }
                    }
                  } else {
                    console.log("wee");
                    if (
                      !params.channelId ||
                      payload?.after?.channel?.includes(params.channelId)
                    ) {
                      dispatch(
                        addThread({
                          ...payload.before,
                          ...payload.after,
                          createdBy: _createdBy,
                        })
                      );
                    }

                    setInboxData((prev) => [
                      ...prev,
                      {
                        ...payload.before,
                        ...payload.after,
                      },
                    ]);
                  }

                  updateUserStore();
                }

                if (
                  !!payload?.before?.isClosed !== !!payload?.after?.isClosed
                ) {
                  try {
                    dispatch(
                      updatePartialThread({
                        _id: payload?.after?._id,
                        isClosed: payload?.after?.isClosed,
                        createdBy: _createdBy,
                      })
                    );
                  } catch (error: any) {
                    console.log("err", error);
                    showToast({ message: `${JSON.stringify(error?.message)}` });
                  }
                }

                // if (
                //   !!payload?.before?.isDeleted !== !!payload?.after?.isDeleted
                // ) {
                //   if (payload?.after?.createdBy !== auth.user._id) {
                //     if (payload?.after?.isDeleted) {
                //       dispatch(
                //         updatePartialThread({
                //           _id: payload?.after?._id,
                //           isDeleted: payload?.after?.isDeleted,
                //           createdBy: _createdBy,
                //         })
                //       );
                //     } else {
                //       const { data, error } = await kontenbase
                //         .service("Comments")
                //         .find({
                //           where: {
                //             threads: payload?.after?._id,
                //           },
                //           lookup: ["subComments"],
                //           sort: {
                //             createdAt: -1,
                //           },
                //           limit: 2,
                //         });

                //       if (error) throw new Error(error?.message);
                //       dispatch(
                //         addThread({
                //           ...payload.after,
                //           comments: data,
                //           createdBy: _createdBy,
                //         })
                //       );
                //     }
                //   }

                //   if (payload.after?.createdBy === auth.user._id) {
                //     if (payload?.after?.isDeleted) {
                //       setTrashData((prev) =>
                //         createUniqueArray([...prev, payload.after?._id])
                //       );
                //       setInboxData((prev) =>
                //         prev.filter((item) => item._id !== payload?.after?._id)
                //       );
                //     } else {
                //       setTrashData((prev) =>
                //         prev.filter((item) => item !== payload?.after?._id)
                //       );
                //       setInboxData((prev) => [
                //         ...prev.filter(
                //           (item) => item._id !== payload?.after?._id
                //         ),
                //         payload?.after,
                //       ]);
                //     }
                //   }
                // }

                break;
              case "CREATE_RECORD":
                console.log("crt");
                if (
                  !params.channelId ||
                  payload?.channel?.includes(params.channelId)
                ) {
                  dispatch(addThread({ ...payload, createdBy: _createdBy }));
                }

                setInboxData((prev) => [
                  ...prev,
                  { ...payload, createdBy: _createdBy },
                ]);

                updateUserStore();
                break;
              case "DELETE_RECORD":
                console.log("del");
                dispatch(deleteThread(payload));
                setTrashData((prev) =>
                  prev.filter((item) => item !== payload?._id)
                );
                break;

              default:
                break;
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            showToast({ message: `${JSON.stringify(error?.message)}` });
          }
        }
      })
      .then((result) => (key = result));

    return () => {
      console.log("umnt");
      kontenbase.realtime.unsubscribe(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelDataAll, params.channelId]);

  useEffect(() => {
    let key: string | undefined;

    kontenbase.realtime
      .subscribe("Channels", { event: "*" }, async (message) => {
        const { event, payload } = message;
        const isUpdate = event === "UPDATE_RECORD";

        try {
          const { data, error } = await kontenbase.service("Users").find({
            where: {
              id: isUpdate ? payload?.before?.createdBy : payload.createdBy,
            },
          });

          if (error) throw new Error(error.message);

          const createdBy = data?.[0];

          const channelCurrentWorkspace = isUpdate
            ? payload.before.workspace.includes(params.workspaceId)
            : payload.workspace.includes(params.workspaceId);

          if (channelCurrentWorkspace) {
            switch (event) {
              case "UPDATE_RECORD":
                const dataIndex = channel.channels.findIndex(
                  (data) => data._id === payload.after?._id
                );

                if (dataIndex >= 0) {
                  dispatch(
                    updateChannel({
                      ...payload.before,
                      ...payload.after,
                    })
                  );
                } else {
                  if (payload?.after?.members?.includes(auth.user._id)) {
                    dispatch(
                      addChannel({
                        ...payload.after,
                        createdBy,
                      })
                    );
                  } else {
                    dispatch(
                      updateChannel({
                        ...payload.before,
                        ...payload.after,
                      })
                    );
                  }
                }
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
        } catch (error) {
          if (error instanceof Error) {
            showToast({ message: `${JSON.stringify(error?.message)}` });
          }
        }
      })
      .then((result) => (key = result));

    return () => {
      kontenbase.realtime.unsubscribe(key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId]);

  useEffect(() => {
    console.log(thread.threads, "tdd");
  }, [thread.threads]);

  const loading = workspace.loading || channel.loading;

  return (
    <div
      id="modal-container"
      className={
        isSidebarOpen
          ? `w-screen min-h-screen fixed bg-[rgba(0,0,0,0.5)] top-0 left-0 flex justify-center items-start z-[9999]`
          : undefined
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
              : `bg-[#F7FAFB] h-screen hidden md:block relative z-[51]`
          }
        >
          <div className="bg-[#F7FAFB] w-full flex justify-between py-2 px-3 fixed: md:sticky top-0 z-[51]">
            <Popover className="relative">
              {({ open, close }) => (
                <>
                  <Popover.Button as="div">
                    <WorkspaceButton workspaceData={workspaceData} />
                  </Popover.Button>

                  <Popover.Panel className="menu-container left-0 md:left-full md:top-0 ml-2">
                    <Menu>
                      <div className="max-h-40 overflow-auto">
                        {workspace.workspaces.map((data, idx) => (
                          <WorkspaceListButton
                            key={idx}
                            data={data}
                            onClick={() => {
                              close();
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
                            workspace.workspaces.find((item) => {
                              if (item.createdBy?._id) {
                                return item.createdBy?._id === auth.user?._id;
                              }

                              if (!item.createdBy?._id) {
                                return true;
                              }

                              return false;
                            })
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
                          close();
                        }}
                      />
                      <MenuItem
                        icon={
                          <BiLogOut size={20} className="text-neutral-400" />
                        }
                        title="Log Out"
                        onClick={handleLogout}
                      />
                    </Menu>
                  </Popover.Panel>
                </>
              )}
            </Popover>

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
                  count={inboxLeft || 0}
                />
                <SidebarList
                  type="trash"
                  name="Trash"
                  link={`/a/${workspaceData?._id}/trash`}
                  setIsSidebarOpen={setIsSidebarOpen}
                  count={
                    // (trashData.length > 10 ? "10+" : trashData.length) || 0
                    0
                  }
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
                      workspaceData?.createdBy?._id === auth.user?._id ||
                      channel?.createdBy?._id === auth.user?._id
                    }
                  />
                ))}
                <div
                  className="cursor-pointer w-full rounded hover:bg-neutral-100 flex items-center justify-between group mt-1"
                  onClick={() => setCreateChannelModal(true)}
                >
                  <div className={`w-full flex items-center text-sm pl-2 h-8`}>
                    <BsPlus size={28} className="mr-1 text-gray-400" />
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
