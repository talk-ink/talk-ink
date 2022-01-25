import { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { BiCheckCircle, BiCircle } from "react-icons/bi";

import InboxEmpty from "components/EmptyContent/InboxEmpty";
import ContentItem from "components/ContentItem/ContentItem";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import IconButton from "components/Button/IconButton";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";
import { addDoneThread, deleteDoneThread } from "features/auth";
import Modal from "components/Modal/Modal";
import { kontenbase } from "lib/client";
import { deleteThread } from "features/threads";
import { inboxFilter } from "utils/helper";
import { updateChannelCount } from "features/channels/slice";
import moment from "moment-timezone";

type TProps = {
  type?: "active" | "done";
};

function InboxList({ type = "active" }: TProps) {
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const thread = useAppSelector((state) => state.thread);
  const channel = useAppSelector((state) => state.channel);
  const dispatch = useAppDispatch();

  const [selectedThread, setSelectedThread] = useState(null);

  const isDoneThread = useMemo(() => {
    return type === "done";
  }, [type]);

  const channelData: string[] = useMemo(
    () => channel.channels.map((data) => data._id),
    [channel.channels]
  );

  const threadData = useMemo(() => {
    return thread.threads
      .filter((data) =>
        inboxFilter({
          thread: data,
          channelIds: channelData,
          userData: auth.user,
          isDoneThread,
        })
      )
      .filter((item) => item.tagedUsers?.includes(auth.user._id))
      .sort(
        (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.threads, auth.user, params, channelData]);

  const readedThreads: string[] = useMemo(() => {
    if (!auth.user.readedThreads) return [];
    return auth.user.readedThreads;
  }, [auth.user]);

  const markHandler = async (threadId: string) => {
    try {
      if (isDoneThread) {
        const { error } = await kontenbase
          .service("Threads")
          .unlink(threadId, { doneUsers: auth.user._id });

        if (error) throw new Error(error.message);
        dispatch(deleteDoneThread(threadId));
      } else {
        const { error } = await kontenbase
          .service("Threads")
          .link(threadId, { doneUsers: auth.user._id });

        if (error) throw new Error(error.message);
        dispatch(addDoneThread(threadId));
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast({ message: `${JSON.stringify(error?.message)}` });
      }
    }
  };

  const threadDeleteHandler = async () => {
    try {
      const deletedThread = await kontenbase
        .service("Threads")
        .deleteById(selectedThread?._id);

      if (deletedThread.error) throw new Error(deletedThread.error.message);

      if (deletedThread?.data) {
        setSelectedThread(null);
      }
      dispatch(deleteThread(deletedThread.data));
      dispatch(
        updateChannelCount({
          chanelId: deletedThread.data?.channel?.[0],
          threadId: selectedThread?._id,
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
                    <IconButton
                      onClick={() => {
                        markHandler(inbox._id);
                      }}
                    >
                      {isDoneThread && (
                        <BiCircle size={24} className="text-neutral-400" />
                      )}
                      {!isDoneThread && (
                        <BiCheckCircle size={24} className="text-neutral-400" />
                      )}
                    </IconButton>
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
    </div>
  );
}

export default InboxList;
