import React, { useEffect, useMemo, useState } from "react";

import {
  BiArchive,
  BiCheckCircle,
  BiDotsHorizontalRounded,
  BiDotsVerticalRounded,
  BiEdit,
  BiEditAlt,
  BiFilter,
  BiInfoCircle,
  BiLogOut,
  BiUserPlus,
} from "react-icons/bi";
import { useLocation, useNavigate, useParams, Outlet } from "react-router";
import moment from "moment-timezone";
import "moment/locale/id";
import { Menu } from "@headlessui/react";

import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import MenuItem from "components/Menu/MenuItem2";
import Modal from "components/Modal/Modal";
import ProfileImage from "components/ProfileImage";
import EditChannelForm from "components/ChannelForm/EditChannelForm";
import NameInitial from "components/Avatar/NameInitial";
import ChannelBadge from "components/ChannelBadge";
import ChannelInfo from "components/ChannelForm/ChannelInfo";
import AddChannelMember from "components/ChannelForm/AddChannelMember";

import { useAppSelector } from "hooks/useAppSelector";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useToast } from "hooks/useToast";

import { fetchThreads } from "features/threads/slice/asyncThunk";
import { deleteChannel } from "features/channels/slice";

import { kontenbase } from "lib/client";
import { Channel, Member } from "types";
import { createUniqueArray, getNameInitial } from "utils/helper";
import Badge from "components/Badge/Badge";
import { useMediaQuery } from "react-responsive";
import MobileHeader from "components/Header/Mobile";

moment.locale("id");

function ChannelPage() {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });

  const { pathname } = useLocation();
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);
  const thread = useAppSelector((state) => state.thread);
  const workspace = useAppSelector((state) => state.workspace);

  const userId: string = auth.user._id;

  const dispatch = useAppDispatch();

  const [editChannelModal, setEditChannelModal] = useState<boolean>();
  const [channelInfoModal, setChannelInfoModal] = useState<boolean>(false);
  const [leaveChannelModal, setLeaveChannelModal] = useState<boolean>();
  const [addMemberModal, setAddMemberModal] = useState<boolean>(false);

  const [memberList, setMemberList] = useState<Member[]>([]);

  const createThreadDraft = () => {
    const threadsDraft = localStorage.getItem("threadsDraft");
    const uniqueId = Math.floor(Math.random() * 100000);

    const dataTemplate = {
      name: "",
      content: "",
      channelId: params.channelId,
      workspaceId: params.workspaceId,
      lastChange: moment.tz("Asia/Jakarta").toISOString(),
      createdBy: auth.user,
    };
    if (!threadsDraft) {
      localStorage.setItem(
        "threadsDraft",
        JSON.stringify({
          [uniqueId]: dataTemplate,
        })
      );
    } else {
      const parsedThreadsDraft: object = JSON.parse(threadsDraft);
      const newDraft = {
        ...parsedThreadsDraft,
        [uniqueId]: dataTemplate,
      };
      localStorage.setItem("threadsDraft", JSON.stringify(newDraft));
    }
    navigate(`${pathname}/compose/${uniqueId}`);
  };

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === params.channelId);
  }, [params.channelId, channel.channels]);

  const isChannelMember: boolean = useMemo(() => {
    if (channelData) {
      return channelData.members.includes(userId);
    }
    return false;
  }, [channelData, userId]);

  const workspaceData = useMemo(() => {
    return workspace.workspaces.find((data) => data._id === params.workspaceId);
  }, [workspace.workspaces, params.workspaceId]);

  const isAdmin = useMemo(() => {
    return (
      workspaceData.createdBy?._id === auth.user?._id ||
      channelData?.createdBy?._id === auth.user._id
    );
  }, [workspaceData, channelData, auth.user._id]);

  const isClosedThread = useMemo(() => {
    return pathname.includes(`ch/${params.channelId}/close`);
  }, [pathname, params.channelId]);

  const leaveChannelHandler = async () => {
    try {
      await kontenbase
        .service("Channels")
        .unlink(channelData?._id, { members: userId });

      dispatch(deleteChannel(channelData));
      setLeaveChannelModal(false);
      navigate(`/a/${params.workspaceId}/inbox`);
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    }
  };

  const getMemberHandler = async () => {
    try {
      const memberList = await kontenbase.service("Users").find({
        where: { workspaces: params.workspaceId, channels: params.channelId },
        lookup: ["avatar"],
      });
      if (memberList.data) {
        setMemberList(
          memberList.data?.filter((data) =>
            channelData?.members?.includes(data?._id)
          )
        );
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };

  useEffect(() => {
    if (params.channelId && auth.user._id) {
      dispatch(
        fetchThreads({
          type: "threads",
          channelId: params.channelId,
          userId: auth.user._id,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.channelId, auth.user._id]);

  useEffect(() => {
    if (!params.channelId || !auth.user._id || !channelData) return;

    getMemberHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.channelId, auth.user._id, channelData]);

  const uniqueMemberId = useMemo(() => {
    return createUniqueArray(channelData?.members ?? []);
  }, [channelData?.members]);

  const loading = channel.loading || thread.loading;

  return (
    <>
      <MobileHeader
        header={isClosedThread ? "Closed" : channelData?.name}
        subHeader={`${uniqueMemberId.length || 0} ${
          (uniqueMemberId.length || 0) > 1 ? "Members" : "Member"
        }`}
        privacy={channelData?.privacy}
        type="channel"
        menu={
          <div className="flex items-center gap-2">
            <Menu as="div" className="relative">
              {({ open }) => (
                <>
                  <Menu.Button as="div">
                    <IconButton size="medium">
                      <BiFilter size={24} className="text-slate-500" />
                    </IconButton>
                  </Menu.Button>

                  {open && (
                    <Menu.Items static className="menu-container right-0">
                      <MenuItem
                        icon={
                          <BiArchive size={20} className="text-neutral-400" />
                        }
                        onClick={() => {
                          navigate(
                            `/a/${params.workspaceId}/ch/${params.channelId}`
                          );
                        }}
                        title="Open threads"
                        active={!isClosedThread}
                      />
                      <MenuItem
                        icon={
                          <BiCheckCircle
                            size={20}
                            className="text-neutral-400"
                          />
                        }
                        onClick={() => {
                          navigate(
                            `/a/${params.workspaceId}/ch/${params.channelId}/close`
                          );
                        }}
                        title="Closed threads"
                        active={isClosedThread}
                      />
                    </Menu.Items>
                  )}
                </>
              )}
            </Menu>
            <Menu as="div" className="relative">
              {({ open }) => (
                <>
                  <Menu.Button as="div">
                    <IconButton size="medium">
                      <BiDotsVerticalRounded
                        size={24}
                        className="text-slate-500"
                      />
                    </IconButton>
                  </Menu.Button>

                  {open && (
                    <Menu.Items static className="menu-container right-0">
                      {isAdmin && (
                        <MenuItem
                          icon={
                            <BiUserPlus
                              size={20}
                              className="text-neutral-400"
                            />
                          }
                          onClick={() => {
                            setAddMemberModal(true);
                          }}
                          title="Add members"
                        />
                      )}
                      <MenuItem
                        icon={
                          <BiInfoCircle
                            size={20}
                            className="text-neutral-400"
                          />
                        }
                        onClick={() => {
                          setChannelInfoModal(true);
                        }}
                        title="Channel information"
                      />
                      {isAdmin && (
                        <MenuItem
                          icon={
                            <BiEditAlt size={20} className="text-neutral-400" />
                          }
                          onClick={() => {
                            setEditChannelModal(true);
                          }}
                          title="Edit channel"
                        />
                      )}
                      <MenuItem
                        icon={
                          <BiLogOut size={20} className="text-neutral-400" />
                        }
                        onClick={() => {
                          setLeaveChannelModal(true);
                        }}
                        title="Leave channel"
                      />
                    </Menu.Items>
                  )}
                </>
              )}
            </Menu>
          </div>
        }
      />
      <MainContentContainer>
        <header
          className={`mb-8 md:mb-0 ${
            isMobile ? "hidden" : "flex"
          } items-end justify-between "border-b-2 border-neutral-100 pb-8`}
        >
          <div>
            <h1 className="font-bold text-3xl">{channelData?.name}</h1>
            <p className="text-neutral-500 font-body capitalize">
              {channelData?.privacy ?? "Public"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="hidden md:flex flex-row mr-2 outline-none"
              onClick={() => {
                if (isAdmin) {
                  setAddMemberModal(true);
                }
              }}
            >
              {memberList.map(
                (member, idx) =>
                  idx <= 3 && (
                    <div key={idx}>
                      {member._id === auth.user._id && (
                        <>
                          {!auth.user.avatar && (
                            <NameInitial
                              key={member._id}
                              name={getNameInitial(auth.user.firstName)}
                              className="border-2 border-white -mr-2 bg-red-400"
                            />
                          )}
                          {auth.user.avatar && (
                            <ProfileImage
                              key={member._id}
                              className="border-2 border-white -mr-2 bg-red-400"
                              source={auth.user.avatar}
                              alt={getNameInitial(auth.user.firstName)}
                            />
                          )}
                        </>
                      )}
                      {member._id !== auth.user._id && (
                        <>
                          {!member.avatar && (
                            <NameInitial
                              key={member._id}
                              name={getNameInitial(member.firstName)}
                              className="border-2 border-white -mr-2 bg-red-400"
                            />
                          )}
                          {member.avatar && (
                            <ProfileImage
                              key={member._id}
                              className="border-2 border-white -mr-2 bg-red-400"
                              source={member.avatar[0].url}
                              alt={getNameInitial(member.firstName)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  )
              )}
              {memberList.length > 3 && memberList.length - 4 !== 0 && (
                <div
                  className={`text-sm rounded-full flex items-center justify-center overflow-hidden bg-gray-400 text-white uppercase h-8 w-8 border-2`}
                >
                  +{memberList.length - 4 > 99 ? "99" : memberList.length - 4}
                </div>
              )}
            </button>

            {isChannelMember && (
              <Button
                className="bg-indigo-500 hover:bg-indigo-500 flex items-center"
                onClick={() => {
                  createThreadDraft();
                }}
              >
                <BiEdit size={18} className="text-white md:mr-2" />
                <p className="hidden md:block text-sm text-white font-medium -mb-1">
                  New Thread
                </p>
              </Button>
            )}
            <Menu as="div" className="relative">
              {({ open }) => (
                <>
                  <Menu.Button as="div">
                    <IconButton size="medium">
                      <BiDotsHorizontalRounded
                        size={24}
                        className="text-neutral-400"
                      />
                    </IconButton>
                  </Menu.Button>

                  {open && (
                    <Menu.Items static className="menu-container right-0">
                      {isAdmin && (
                        <MenuItem
                          icon={
                            <BiUserPlus
                              size={20}
                              className="text-neutral-400"
                            />
                          }
                          onClick={() => {
                            setAddMemberModal(true);
                          }}
                          title="Add members"
                        />
                      )}
                      <MenuItem
                        icon={
                          <BiInfoCircle
                            size={20}
                            className="text-neutral-400"
                          />
                        }
                        onClick={() => {
                          setChannelInfoModal(true);
                        }}
                        title="Channel information"
                      />
                      {isAdmin && (
                        <MenuItem
                          icon={
                            <BiEditAlt size={20} className="text-neutral-400" />
                          }
                          onClick={() => {
                            setEditChannelModal(true);
                          }}
                          title="Edit channel"
                        />
                      )}
                      <MenuItem
                        icon={
                          <BiLogOut size={20} className="text-neutral-400" />
                        }
                        onClick={() => {
                          setLeaveChannelModal(true);
                        }}
                        title="Leave channel"
                      />
                    </Menu.Items>
                  )}
                </>
              )}
            </Menu>
          </div>
        </header>
        <div className={`hidden md:flex mb-3 `}>
          <nav className={`flex gap-2 items-center`}>
            <Badge
              active={!pathname.includes("/close")}
              title="Open"
              link={`/a/${params.workspaceId}/ch/${params.channelId}`}
            />
            <Badge
              active={pathname.includes("/close")}
              title="Close"
              link={`/a/${params.workspaceId}/ch/${params.channelId}/close`}
            />
          </nav>
        </div>
        <Outlet />
        {isChannelMember && (
          <button
            className="md:hidden m-5 fixed bottom-0 right-0 h-14 w-14 bg-indigo-500 rounded-full outline-none flex items-center justify-center"
            onClick={() => createThreadDraft()}
          >
            <BiEdit size={24} className="text-white shadow-lg" />
          </button>
        )}

        <Modal
          header="Edit channel"
          visible={editChannelModal}
          onClose={() => {
            setEditChannelModal(false);
          }}
          onCancel={() => {
            setEditChannelModal(false);
          }}
          footer={null}
          size="small"
        >
          <EditChannelForm
            data={channelData}
            onClose={() => {
              setEditChannelModal(false);
            }}
          />
        </Modal>
        <Modal
          header="Channel information"
          visible={channelInfoModal}
          onClose={() => {
            setChannelInfoModal(false);
          }}
          onCancel={() => {
            setChannelInfoModal(false);
          }}
          footer={null}
          size="small"
        >
          <ChannelInfo
            data={channelData}
            onClose={() => {
              setChannelInfoModal(false);
            }}
            showManageMemberModal={() => {
              setAddMemberModal(true);
            }}
          />
        </Modal>
        <Modal
          header="Manage members"
          visible={addMemberModal}
          onClose={() => {
            setAddMemberModal(false);
          }}
          onCancel={() => {
            setAddMemberModal(false);
          }}
          footer={null}
          size="small"
        >
          <AddChannelMember
            data={channelData}
            onClose={() => {
              setAddMemberModal(false);
            }}
          />
        </Modal>
        <Modal
          header={`Leave ${
            channelData?.privacy === "private" ? "private" : "public"
          } channel?`}
          okButtonText="Leave channel"
          visible={!!channelData && leaveChannelModal}
          onCancel={() => {
            setLeaveChannelModal(false);
          }}
          onClose={() => {
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
        {!isChannelMember && !loading && (
          <ChannelBadge data={channelData} userId={userId} />
        )}
      </MainContentContainer>
    </>
  );
}

export default ChannelPage;
