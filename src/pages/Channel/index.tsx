import { useEffect, useMemo, useState } from "react";

import {
  BiDotsHorizontalRounded,
  BiEdit,
  BiEditAlt,
  BiLogOut,
} from "react-icons/bi";
import { useLocation, useNavigate, useParams } from "react-router";
import moment from "moment-timezone";
import "moment/locale/id";

import Button from "components/Button/Button";
import ChannelEmpty from "components/EmptyContent/ChannelEmpty";
import IconButton from "components/Button/IconButton";
import ContentItem from "components/ContentItem/ContentItem";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import Popup from "components/Popup/Popup";
import Menu from "components/Menu/Menu";
import MenuItem from "components/Menu/MenuItem";
import Modal from "components/Modal/Modal";

import { useAppSelector } from "hooks/useAppSelector";
import { kontenbase } from "lib/client";
import { useAppDispatch } from "hooks/useAppDispatch";
import { deleteThread } from "features/threads";
import { fetchThreads } from "features/threads/slice/asyncThunk";
import { Channel, Thread } from "types";
import EditChannelForm from "components/ChannelForm/EditChannelForm";
import { deleteChannel } from "features/channels/slice";
import { useToast } from "hooks/useToast";

moment.locale("id");

function ChannelPage() {
  const { pathname } = useLocation();
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const channel = useAppSelector((state) => state.channel);
  const thread = useAppSelector((state) => state.thread);

  const userId: string = auth.user.id;

  const dispatch = useAppDispatch();

  const [selectedThread, setSelectedThread] = useState<
    Thread | null | undefined
  >();
  const [apiLoading, setApiLoading] = useState<boolean>();

  const [editChannelModal, setEditChannelModal] = useState<boolean>();
  const [leaveChannelModal, setLeaveChannelModal] = useState<boolean>();

  const createThreadDraft = () => {
    const threadsDraft = localStorage.getItem("threadsDraft");
    const uniqueId = Math.floor(Math.random() * 100000);

    const dataTemplate = {
      name: "",
      content: "",
      channelId: params.channelId,
      workspaceId: params.workspaceId,
      lastChange: moment.tz("Asia/Jakarta").toISOString(),
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

  const threadData = useMemo(() => {
    return thread.threads;
  }, [thread.threads]);

  const threadDeleteHandler = async () => {
    setApiLoading(true);
    try {
      if (!selectedThread?.draft) {
        const deletedThread = await kontenbase
          .service("Threads")
          .deleteById(selectedThread?._id);

        if (deletedThread?.data) {
          setSelectedThread(null);
        }
        dispatch(deleteThread(deletedThread.data));
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    } finally {
      setApiLoading(false);
    }
  };

  const leaveChannelHandler = async () => {
    try {
      let members = channelData.members.filter((data) => data !== userId);

      await kontenbase.service("Channels").updateById(channelData?._id, {
        members,
      });

      dispatch(deleteChannel(channelData));
      setLeaveChannelModal(false);
      navigate(`/a/${params.workspaceId}/inbox`);
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    }
  };

  useEffect(() => {
    dispatch(fetchThreads({ channelId: params.channelId }));
  }, [params.channelId]);

  const loading = channel.loading || thread.loading;

  return (
    <MainContentContainer>
      <header
        // className={`mb-2 flex items-end justify-between ${
        //   !false && "border-b-2 border-neutral-100 pb-8"
        // }`}
        className={`mb-8 flex items-end justify-between "border-b-2 border-neutral-100 pb-8"
        `}
      >
        <div>
          <h1 className="font-bold text-3xl">{channelData?.name}</h1>
          <p className="text-neutral-500 font-body">Public</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
              <p className="text-lg uppercase text-white">IA</p>
            </div>
          </div>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700 flex items-center"
            onClick={() => {
              createThreadDraft();
            }}
          >
            <BiEdit size={18} className="text-white mr-2" />
            <p className="text-sm text-white font-medium -mb-1">New Thread</p>
          </Button>
          <Popup
            content={
              <div>
                <Menu>
                  <MenuItem
                    icon={<BiEditAlt size={20} className="text-neutral-400" />}
                    onClick={() => {
                      setEditChannelModal(true);
                    }}
                    title="Edit channel"
                  />
                  <MenuItem
                    icon={<BiLogOut size={20} className="text-neutral-400" />}
                    onClick={() => {
                      setLeaveChannelModal(true);
                    }}
                    title="Leave channel"
                  />
                </Menu>
              </div>
            }
            position="bottom"
          >
            <IconButton size="medium">
              <BiDotsHorizontalRounded size={24} className="text-neutral-400" />
            </IconButton>
          </Popup>
        </div>
      </header>
      {threadData?.length > 0 ? (
        <ul>
          {loading ? (
            <ContentSkeleton />
          ) : (
            <>
              {threadData?.map((thread, idx) => (
                <ContentItem
                  key={idx}
                  dataSource={thread}
                  onClick={() => {
                    if (thread.draft) {
                      navigate(`${pathname}/compose/${thread?.id}`);
                    } else {
                      navigate(`${pathname}/t/${thread?._id}`);
                    }
                  }}
                  setSelectedThread={setSelectedThread}
                />
              ))}
            </>
          )}
        </ul>
      ) : (
        <>
          <ChannelEmpty />
        </>
      )}

      <Modal
        header="Delete Thread"
        visible={!!selectedThread}
        onClose={() => {
          setSelectedThread(null);
        }}
        onCancel={() => {
          setSelectedThread(null);
        }}
        onConfirm={() => {
          threadDeleteHandler();
        }}
        okButtonText="Confirm"
      >
        Are you sure you want to delete this thread?
      </Modal>
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
      >
        <EditChannelForm
          data={channelData}
          onClose={() => {
            setEditChannelModal(false);
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
      >
        <p className="text-sm">
          Are you sure you want to leave this channel? You can always join it
          again later.
        </p>
      </Modal>
    </MainContentContainer>
  );
}

export default ChannelPage;
