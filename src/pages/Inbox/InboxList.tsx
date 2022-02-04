import { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { BiCheckCircle } from "react-icons/bi";
import moment from "moment-timezone";
import { kontenbase } from "lib/client";

import InboxEmpty from "components/EmptyContent/InboxEmpty";
import ContentItem, {
  SelectedThreadTypes,
} from "components/ContentItem/ContentItem";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import IconButton from "components/Button/IconButton";
import Modal from "components/Modal/Modal";
import CloseThreadForm from "components/Thread/CloseThreadForm";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";

import { deleteThread } from "features/threads";
import { updateChannelCount } from "features/channels/slice";
import { Thread } from "types";

type TProps = {
  type?: "open" | "close";
};

function InboxList({ type = "open" }: TProps) {
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const thread = useAppSelector((state) => state.thread);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();

  const [selectedThread, setSelectedThread] =
    useState<{ thread: Thread; type: SelectedThreadTypes }>();

  const isClosedThread = useMemo(() => {
    return type === "close";
  }, [type]);

  const channelData: string[] = useMemo(
    () => channel.channels.map((data) => data._id),
    [channel.channels]
  );

  const threadData = useMemo(() => {
    return thread.threads
      .filter((item) =>
        item.tagedUsers?.includes(auth.user._id) && isClosedThread
          ? item.isClosed
          : !item.isClosed
      )
      .sort(
        (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.threads, auth.user, params, channelData]);

  const readedThreads: string[] = useMemo(() => {
    if (!auth.user.readedThreads) return [];
    return auth.user.readedThreads;
  }, [auth.user]);

  // const markHandler = async (threadId: string) => {
  //   try {
  //     if (isClosedThread) {
  //       const { error } = await kontenbase
  //         .service("Threads")
  //         .unlink(threadId, { doneUsers: auth.user._id });

  //       if (error) throw new Error(error.message);
  //       dispatch(deleteDoneThread(threadId));
  //     } else {
  //       const { error } = await kontenbase
  //         .service("Threads")
  //         .link(threadId, { doneUsers: auth.user._id });

  //       if (error) throw new Error(error.message);
  //       dispatch(addDoneThread(threadId));
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       showToast({ message: `${JSON.stringify(error?.message)}` });
  //     }
  //   }
  // };

  const threadDeleteHandler = async () => {
    try {
      const deletedThread = await kontenbase
        .service("Threads")
        .deleteById(selectedThread?.thread?._id);

      if (deletedThread.error) throw new Error(deletedThread.error.message);

      if (deletedThread?.data) {
        setSelectedThread(null);
      }
      dispatch(deleteThread(deletedThread.data));
      dispatch(
        updateChannelCount({
          chanelId: deletedThread.data?.channel?.[0],
          threadId: selectedThread?.thread?._id,
        })
      );
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    }
  };

  const loading = thread.loading;
  return (
    <div>
      {loading ? (
        <ContentSkeleton />
      ) : (
        <>
          {threadData?.length > 0 ? (
            <ul>
              {threadData.map((inbox, idx) => (
                <ContentItem
                  key={idx}
                  dataSource={inbox}
                  onClick={() => {
                    navigate(
                      `/a/${params.workspaceId}/ch/${inbox?.channel?.[0]}/t/${inbox?._id}?fromInbox=1`
                    );
                  }}
                  otherButton={
                    !isClosedThread && (
                      <IconButton
                        onClick={() => {
                          setSelectedThread({ thread: inbox, type: "close" });
                        }}
                      >
                        <BiCheckCircle size={24} className="text-neutral-400" />
                      </IconButton>
                    )
                  }
                  setSelectedThread={setSelectedThread}
                  isRead={readedThreads.includes(inbox._id)}
                />
              ))}
            </ul>
          ) : (
            <>
              <InboxEmpty />
            </>
          )}
        </>
      )}

      <Modal
        header="Delete Thread"
        visible={!!selectedThread?.thread && selectedThread?.type === "delete"}
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
        header="Close Thread"
        visible={!!selectedThread?.thread && selectedThread?.type === "close"}
        footer={null}
        onClose={() => {
          setSelectedThread(null);
        }}
        onCancel={() => {
          setSelectedThread(null);
        }}
      >
        <CloseThreadForm
          data={selectedThread?.thread}
          onClose={() => {
            setSelectedThread(null);
          }}
          from="inbox"
        />
      </Modal>
    </div>
  );
}

export default InboxList;
