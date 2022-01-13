import React, { useMemo, useEffect, useState, useRef } from "react";

import { Link } from "react-router-dom";
import { useParams } from "react-router";
import Editor from "rich-markdown-editor";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import CommentList from "components/Comment/List";
import CommentForm from "components/Comment/Form";
import Avatar from "components/Avatar/Avatar";
import LoadingSkeleton from "components/Loading/ContentSkeleton";

import { Channel, Thread } from "types";
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
  const channel = useAppSelector((state) => state.channel);

  const [isShowEditor, setIsShowEditor] = useState<boolean>(false);

  useEffect(() => {
    let key: string;

    kontenbase.realtime
      .subscribe("Comments", { event: "*" }, async (message) => {
        const { payload, event } = message;
        const isCurrentThread =
          event === "UPDATE_RECORD"
            ? payload.before.threads?.[0] === threadId
            : payload.threads?.[0] === threadId;

        let _createdBy;
        if (event === "CREATE_RECORD" || event === "UPDATE_RECORD") {
          const { data } = await kontenbase.service("Users").find({
            where: {
              id:
                event === "UPDATE_RECORD"
                  ? payload.before.createdBy
                  : payload.createdBy,
            },
          });
          _createdBy = data?.[0];
        }

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

  useEffect(() => {
    scrollToBottom();
  }, []);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === channelId);
  }, [channelId, channel.channels]);

  return (
    <MainContentContainer
      header={
        <MainContentHeader
          channel={channelData?.name}
          title={threadData?.name}
          thread
        />
      }
      listRef={listRef}
    >
      <div className="max-w-4xl ml-auto mr-auto">
        <div className=" pb-10 relative">
          <div className="mb-8">
            <h1 className="font-bold text-3xl">{threadData?.name}</h1>
            <p className="text-neutral-500 text-sm font-body">
              {channelData?.members?.length} Participants{" "}
              <Link
                to={`/a/${workspaceId}/ch/${channelId}`}
                className="text-cyan-600"
              >
                #{channelData?.name}
              </Link>
            </p>
          </div>
          <div className="flex items-start">
            <div className="mr-4">
              <Avatar src="https://picsum.photos/100" />
            </div>
            <div className="flex-grow">
              <Editor
                value={threadData?.content}
                readOnly
                className="markdown-overrides w-[70vw] sm:w-full"
              />
            </div>
          </div>
          <div className="border-t-2 border-gray-200 mb-8 mt-8" />
          <div className="mb-10 ">
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
      </div>
    </MainContentContainer>
  );
}

export default ThreadPage;
