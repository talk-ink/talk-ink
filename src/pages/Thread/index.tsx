import { useMemo, useEffect } from "react";

import { Link } from "react-router-dom";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import CommentList from "components/Comment/List";
import Avatar from "components/Avatar/Avatar";
import LoadingSkeleton from "components/Loading/ContentSkeleton";

import { Thread } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import { addComment, deleteComment, updateComment } from "features/threads";

import { fetchComments } from "features/threads/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";
import { kontenbase } from "lib/client";

function ThreadPage() {
  const params = useParams();
  const dispatch = useAppDispatch();

  const thread = useAppSelector((state) => state.thread);

  useEffect(() => {
    let key: string;
    kontenbase.realtime
      .subscribe("Comments", (message) => {
        const { payload, event } = message;
        const isCurrentThread =
          event === "UPDATE_RECORD"
            ? payload.before.threads?.[0] === params.threadId
            : payload.threads?.[0] === params.threadId;
        const threadId = params.threadId;

        if (isCurrentThread) {
          switch (event) {
            case "CREATE_RECORD":
              dispatch(
                addComment({
                  threadId,
                  comment: payload,
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
  }, []);

  useEffect(() => {
    dispatch(fetchComments({ threadId: params.threadId }));
  }, [dispatch, params.threadId]);

  const threadData: Thread = useMemo(() => {
    return thread.threads.find((data) => data._id === params.threadId);
  }, [thread.threads, params.threadId]);

  return (
    <MainContentContainer
      header={
        <MainContentHeader channel="Channel" title={threadData?.name} thread />
      }
    >
      <div className="w-full px-60 pb-10 overflow-auto">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">{threadData?.name}</h1>
          <p className="text-neutral-500 text-sm font-body">
            2 Participants{" "}
            <Link
              to={`/a/${params.workspaceId}/ch/${params.channelId}`}
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
        {thread.commentLoading ? (
          <LoadingSkeleton />
        ) : (
          <CommentList dataSource={threadData.comments} />
        )}
      </div>
    </MainContentContainer>
  );
}

export default ThreadPage;
