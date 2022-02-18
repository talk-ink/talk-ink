import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { kontenbase } from "lib/client";

import ContentItem, {
  SelectedThreadTypes,
} from "components/ContentItem/ContentItem";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import Modal from "components/Modal/Modal";

import {
  fetchThreads,
  fetchThreadsPagination,
} from "features/threads/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { Thread } from "types";
import { deleteThread } from "features/threads";
import { updateChannelCount } from "features/channels/slice";
import { useToast } from "hooks/useToast";
import TrashEmpty from "components/EmptyContent/TrashEmpty";
import MobileHeader from "components/Header/Mobile";
import MobileMenuThread from "components/Thread/MobileMenu";
import useIntersection from "hooks/useIntersection";

function TrashPage() {
  const [showToast] = useToast();

  const params = useParams();
  const navigate = useNavigate();

  const auth = useAppSelector((state) => state.auth);
  const thread = useAppSelector((state) => state.thread);

  const userId: string = auth.user._id;

  const dispatch = useAppDispatch();

  const [selectedThread, setSelectedThread] =
    useState<{ thread: Thread; type: SelectedThreadTypes }>();

  useEffect(() => {
    dispatch(
      fetchThreads({ type: "trash", workspaceId: params.workspaceId, userId })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workspaceId]);

  const threadDeleteHandler = async () => {
    try {
      const deletedThread = await kontenbase
        .service("Threads")
        .deleteById(selectedThread?.thread._id);

      if (deletedThread?.data) {
        setSelectedThread(null);
      }
      dispatch(deleteThread(deletedThread.data));
      dispatch(
        updateChannelCount({
          chanelId: deletedThread.data?.channel?.[0],
          threadId: selectedThread?.thread._id,
        })
      );
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
        type: "trash",
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

  return (
    <>
      <MobileHeader
        header="Trash"
        subHeader="Your deleted thread will come here"
        type="trash"
      />
      <MainContentContainer>
        <header className="mb-2 hidden md:block">
          <div className="mb-7">
            <h1 className="font-bold text-3xl">Trash</h1>
          </div>
        </header>
        <div>
          {thread?.loading ? (
            <ContentSkeleton />
          ) : thread.threads.length > 0 ? (
            <>
              {thread.threads.map((data) => (
                <ContentItem
                  key={data._id}
                  dataSource={data}
                  onClick={() => {
                    navigate(
                      `/a/${params.workspaceId}/ch/${data?.channel?.[0]}/t/${data?._id}`
                    );
                  }}
                  isRead
                  from="trash"
                  setSelectedThread={setSelectedThread}
                />
              ))}{" "}
              <div ref={observerRef} className="h-3 w-10 "></div>
            </>
          ) : (
            <TrashEmpty />
          )}
        </div>

        <MobileMenuThread
          openMenu={!!selectedThread?.thread && selectedThread?.type === "menu"}
          onClose={() => {
            setSelectedThread(null);
          }}
          dataSource={selectedThread?.thread}
          setSelectedThread={setSelectedThread}
          isRead={true}
          from="trash"
        />
        <Modal
          header="Remove from trash"
          visible={
            !!selectedThread?.thread && selectedThread?.type === "delete"
          }
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
          Are you sure you want to remove this thread from trash?
        </Modal>
      </MainContentContainer>
    </>
  );
}

export default TrashPage;
