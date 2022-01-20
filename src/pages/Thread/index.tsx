import React, { useMemo, useEffect, useState, useRef } from "react";

import { Link } from "react-router-dom";
import { useParams, useLocation } from "react-router";
import Editor from "rich-markdown-editor";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import CommentList from "components/Comment/List";
import CommentForm from "components/Comment/Form";
import Avatar from "components/Avatar/Avatar";
import LoadingSkeleton from "components/Loading/ContentSkeleton";

import { Channel, Thread, Member } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import {
  addComment,
  deleteComment,
  updateComment,
  addInteractedUser,
} from "features/threads";

import { fetchChannels } from "features/channels/slice";
import { fetchComments } from "features/threads/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";
import { kontenbase } from "lib/client";
import { useToast } from "hooks/useToast";
import { updateUser } from "features/auth";
import NameInitial from "components/Avatar/NameInitial";
import { getNameInitial } from "utils/helper";

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function ThreadPage() {
  const [showToast] = useToast();
  const { threadId, workspaceId, channelId } = useParams();
  const query = useQuery();
  const listRef = useRef<HTMLDivElement>(null);
  const [memberList, setMemberList] = useState<Member[]>([]);

  const thread = useAppSelector((state) => state.thread);
  const channel = useAppSelector((state) => state.channel);
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

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

  const updateReadedThreads = async () => {
    try {
      let readedThreads: string[] = [];
      if (auth.user?.readedThreads) {
        readedThreads = auth.user?.readedThreads;
      }
      if (!readedThreads.includes(threadId)) {
        await kontenbase
          .service("Threads")
          .link(threadId, { readedUsers: auth.user._id });
        dispatch(updateUser({ readedThreads: [...readedThreads, threadId] }));
      }
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error.message)}` });
    }
  };

  useEffect(() => {
    dispatch(fetchComments({ threadId: threadId }));
  }, [dispatch, threadId]);

  useEffect(() => {
    updateReadedThreads();
  }, [threadId]);

  const threadData: Thread = useMemo(() => {
    return thread.threads.find((data) => data._id === threadId);
  }, [thread.threads, threadId]);

  const scrollToBottom = () =>
    setTimeout(() => {
      listRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 1000);

  useEffect(() => {
    scrollToBottom();

    const timedId = scrollToBottom();

    return () => {
      clearTimeout(timedId);
    };
  }, []);

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === channelId);
  }, [channelId, channel.channels]);

  useEffect(() => {
    const setInteractedUser = async () => {
      try {
        const { data } = await kontenbase.service("Threads").getById(threadId);

        if (
          !data.interactedUsers?.find((item: any) => item === auth.user._id)
        ) {
          await kontenbase.service("Threads").link(threadId, {
            interactedUsers: auth.user._id,
          });

          dispatch(
            addInteractedUser({
              threadId: threadId,
              userId: auth.user._id,
            })
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    setInteractedUser();
  }, []);

  const getMemberHandler = async () => {
    try {
      const memberList = await kontenbase.service("Users").find({
        where: { workspaces: workspaceId, channels: channelId },
        lookup: ["avatar"],
      });
      if (memberList.data) {
        setMemberList(memberList.data);
      }
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };

  useEffect(() => {
    getMemberHandler();
  }, []);

  useEffect(() => {
    dispatch(fetchChannels({ userId: auth.user._id, workspaceId }));
  }, [workspaceId]);

  return (
    <MainContentContainer
      header={
        <MainContentHeader
          channel={channelData?.name}
          title={threadData?.name}
          thread
          from={query.get("fromInbox") === "1" && "inbox"}
        />
      }
    >
      <div className="max-w-3xl ml-auto mr-auto -mt-4">
        <div className="relative">
          <div className="mb-8">
            <h1 className="font-bold text-3xl max-w-3xl break-words">
              {threadData?.name}
            </h1>
            <p className="text-neutral-500 text-sm font-body">
              {channelData?.members?.length} Participants{" "}
              <Link
                to={`/a/${workspaceId}/ch/${channelId}`}
                className="text-indigo-800"
              >
                #{channelData?.name}
              </Link>
            </p>
          </div>
          <div className="flex items-start">
            <div className="mr-4">
              {threadData?.createdBy?.avatar?.[0]?.url ? (
                <Avatar src={threadData?.createdBy?.avatar?.[0]?.url} />
              ) : (
                <NameInitial
                  name={getNameInitial(threadData?.createdBy?.firstName)}
                  className="mr-4"
                />
              )}
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
              <CommentList
                dataSource={threadData?.comments}
                listRef={listRef}
              />
            )}
          </div>
          <CommentForm
            isShowEditor={isShowEditor}
            setIsShowEditor={setIsShowEditor}
            threadId={threadId}
            threadName={threadData?.name}
            interactedUsers={[...new Set(threadData?.interactedUsers)]}
            scrollToBottom={scrollToBottom}
            memberList={memberList}
          />
        </div>
      </div>
    </MainContentContainer>
  );
}

export default ThreadPage;
