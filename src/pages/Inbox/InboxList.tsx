import { useEffect, useMemo, useState } from "react";

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
import MobileMenuThread from "components/Thread/MobileMenu";
import { fetchThreadsPagination } from "features/threads/slice/asyncThunk";
import useIntersection from "hooks/useIntersection";

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
      .filter(
        (item) =>
          item.tagedUsers?.includes(auth.user._id) &&
          (isClosedThread ? item.isClosed : !item.isClosed) &&
          !item?.isDeleted
      )
      .sort(
        (a, b) =>
          moment(b?.lastActionAt || b.createdAt).valueOf() -
          moment(a?.lastActionAt || a.createdAt).valueOf()
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
      if (!selectedThread?.thread.draft) {
        const now = moment().tz("Asia/Jakarta").toDate();
        const deletedThread = await kontenbase
          .service("Threads")
          .updateById(selectedThread?.thread._id, {
            isDeleted: true,
            deletedAt: now,
          });
        if (deletedThread?.data) {
          dispatch(deleteThread(deletedThread.data));
          dispatch(
            updateChannelCount({
              chanelId: deletedThread.data?.channel?.[0],
              threadId: selectedThread?.thread._id,
            })
          );
          setSelectedThread(null);
        }
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${error}` });
    }
  };

  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  };

  const [observerRef, isFetchData] = useIntersection(observerOptions);

  useEffect(() => {
    if (!params.workspaceId || !auth.user._id || !isFetchData) return;
    if (thread.threadCount === 0 || thread.threads.length === 0) return;
    if (thread.threads.length >= thread.threadCount) return;
    dispatch(
      fetchThreadsPagination({
        type: "inbox",
        workspaceId: params.workspaceId,
        userId: auth.user._id,
        skip: thread.threads.length,
        limit: 10,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.workspaceId,
    auth.user._id,
    isFetchData,
    thread.threadCount,
    thread.threads,
  ]);

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
                        className="hidden md:flex"
                      >
                        <BiCheckCircle size={24} className="text-neutral-400" />
                      </IconButton>
                    )
                  }
                  setSelectedThread={setSelectedThread}
                  isRead={readedThreads.includes(inbox._id)}
                  from="inbox"
                />
              ))}{" "}
              <div ref={observerRef} className="h-3 w-10"></div>
            </ul>
          ) : (
            <>
              <InboxEmpty />
            </>
          )}
        </>
      )}

      <MobileMenuThread
        openMenu={!!selectedThread?.thread && selectedThread?.type === "menu"}
        onClose={() => {
          setSelectedThread(null);
        }}
        dataSource={selectedThread?.thread}
        setSelectedThread={setSelectedThread}
        isRead={
          readedThreads.includes(selectedThread?.thread?._id) ||
          (readedThreads.includes(selectedThread?.thread?._id) &&
            selectedThread?.thread?.createdBy?._id === auth.user._id)
        }
      />

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
        size="xs"
      >
        Are you sure you want to delete this thread? It will be moved into
        trash.
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
