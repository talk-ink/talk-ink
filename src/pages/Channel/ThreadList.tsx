import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import moment from "moment-timezone";
import { kontenbase } from "lib/client";

import ContentItem, {
  SelectedThreadTypes,
} from "components/ContentItem/ContentItem";
import ChannelEmpty from "components/EmptyContent/ChannelEmpty";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import Modal from "components/Modal/Modal";
import CloseThreadForm from "components/Thread/CloseThreadForm";

import { updateChannelCount } from "features/channels/slice";
import { deleteThread } from "features/threads";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { useToast } from "hooks/useToast";

import { Thread } from "types";
import MobileMenuThread from "components/Thread/MobileMenu";
import useIntersection from "hooks/useIntersection";
import { fetchThreadsPagination } from "features/threads/slice/asyncThunk";

type Props = {
  type?: "open" | "close";
};

const ThreadList = ({ type = "open" }: Props) => {
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const thread = useAppSelector((state) => state.thread);

  const dispatch = useAppDispatch();

  const [selectedThread, setSelectedThread] = useState<{
    thread: Thread;
    type: SelectedThreadTypes;
  }>();

  const isClosedThread = useMemo(() => {
    return type === "close";
  }, [type]);

  const threadData = useMemo(() => {
    return thread.threads.filter(
      (data) =>
        (isClosedThread ? data?.isClosed : !data?.isClosed) && !data?.isDeleted
    );
  }, [thread.threads, isClosedThread]);

  const readedThreads: string[] = useMemo(() => {
    if (!auth.user.readedThreads) return [];
    return auth.user.readedThreads;
  }, [auth.user]);

  const deleteDraft = (id: string) => {
    const parsedThreadDraft = JSON.parse(localStorage.getItem("threadsDraft"));
    delete parsedThreadDraft[+id];

    localStorage.setItem("threadsDraft", JSON.stringify(parsedThreadDraft));
  };

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
      } else {
        deleteDraft(selectedThread.thread.id);
        dispatch(deleteThread(selectedThread.thread));
        setSelectedThread(null);
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
    if (!params.channelId || !auth.user._id || !isFetchData) return;
    if (thread.threadCount === 0 || thread.threads.length === 0) return;
    if (thread.threads.length >= thread.threadCount) return;

    dispatch(
      fetchThreadsPagination({
        type: "threads",
        channelId: params.channelId,
        userId: auth.user._id,
        skip: thread.threads.length,
        limit: 10,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.channelId,
    auth.user._id,
    isFetchData,
    isClosedThread,
    thread.threadCount,
    thread.threads,
  ]);

  const loading = thread.loading;

  return (
    <div>
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
                      navigate(
                        `/a/${params.workspaceId}/ch/${params.channelId}/compose/${thread?.id}`
                      );
                    } else {
                      navigate(
                        `/a/${params.workspaceId}/ch/${params.channelId}/t/${thread?._id}`
                      );
                    }
                  }}
                  setSelectedThread={setSelectedThread}
                  isRead={
                    readedThreads.includes(thread._id) ||
                    (readedThreads.includes(thread._id) &&
                      thread?.createdBy?._id === auth.user._id)
                  }
                />
              ))}
            </>
          )}
          <div ref={observerRef} className="h-3 w-10"></div>
        </ul>
      ) : (
        <>
          <ChannelEmpty />
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
        />
      </Modal>
    </div>
  );
};

export default ThreadList;
