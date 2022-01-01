import React, { useMemo, useEffect, useState, useRef } from "react";

import { Link } from "react-router-dom";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import CommentList from "components/Comment/List";
import CommentForm from "components/Comment/Form";
import Avatar from "components/Avatar/Avatar";
import LoadingSkeleton from "components/Loading/ContentSkeleton";

import { Thread } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import { addComment, deleteComment, updateComment } from "features/threads";

import { fetchComments } from "features/threads/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";
import { kontenbase } from "lib/client";

function ThreadPage() {
  const { threadId, workspaceId, channelId } = useParams();
  const listRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const thread = useAppSelector((state) => state.thread);

  const [isShowEditor, setIsShowEditor] = useState<boolean>(false);

  useEffect(() => {
    let key: string;
    kontenbase.realtime
      .subscribe("Comments", async (message) => {
        const { payload, event } = message;
        const isCurrentThread =
          event === "UPDATE_RECORD"
            ? payload.before.threads?.[0] === threadId
            : payload.threads?.[0] === threadId;

        let _createdBy;
        if (event === "CREATE_RECORD" || event === "UPDATE_RECORD") {
          const { data } = await kontenbase
            .service("Users")
            .find({ where: { id: payload.createdBy } });
          _createdBy = data?.[0];
        }
        // note: response dari notification kalau ada relasi ke created by kok malah return id aja?

        if (isCurrentThread) {
          switch (event) {
            case "CREATE_RECORD":
              dispatch(
                addComment({
                  threadId,
                  comment: { ...payload, createdBy: _createdBy },
                })
              );

              break;
            case "UPDATE_RECORD":
              dispatch(
                updateComment({
                  threadId,
                  comment: {
                    ...payload.before,
                    ...payload.after,
                    createdBy: _createdBy,
                  },
                })
              );
              break;
            case "DELETE_RECORD":
              dispatch(
                deleteComment({
                  threadId,
                  deletedId: payload._id,
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

  useEffect(() => {
    dispatch(fetchComments({ threadId: threadId }));
  }, [dispatch, threadId]);

  const threadData: Thread = useMemo(() => {
    return thread.threads.find((data) => data._id === threadId);
  }, [thread.threads, threadId]);

  const scrollToBottom = () => {
    listRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <MainContentContainer
      header={
        <MainContentHeader channel="Channel" title={threadData?.name} thread />
      }
      listRef={listRef}
    >
      <div className="w-full px-60 pb-10 ">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">{threadData?.name}</h1>
          <p className="text-neutral-500 text-sm font-body">
            2 Participants{" "}
            <Link
              to={`/a/${workspaceId}/ch/${channelId}`}
              className="text-cyan-600"
            >
              #Channel
            </Link>
          </p>
        </div>
        <div className="flex items-start ">
          <Avatar src="https://picsum.photos/100" />
          <div className="prose flex-grow-0 ml-4">
            <ReactMarkdown>{threadData?.content}</ReactMarkdown>
          </div>
        </div>
        <div className="border-t-2 border-gray-200 mb-8 mt-8" />
        <div className="mb-10">
          {thread.commentLoading ? (
            <LoadingSkeleton />
          ) : (
            <CommentList dataSource={threadData.comments} />
          )}
        </div>

        <CommentForm
          isShowEditor={isShowEditor}
          setIsShowEditor={setIsShowEditor}
          threadId={threadId}
          scrollToBottom={scrollToBottom}
        />
      </div>
    </MainContentContainer>
  );
}

export default ThreadPage;
