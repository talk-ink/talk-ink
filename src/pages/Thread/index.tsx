import React, { useMemo, useEffect, useState, useRef } from "react";

import { Link } from "react-router-dom";
import { useParams, useLocation, useNavigate } from "react-router";
import ReactMoment from "react-moment";
import { useRemirror } from "@remirror/react";

import MainContentContainer from "components/MainContentContainer/MainContentContainer";
import MainContentHeader from "components/MainContentContainer/MainContentHeader";
import CommentList from "components/Comment/List";
import CommentForm from "components/Comment/Form";
import Avatar from "components/Avatar/Avatar";
import LoadingSkeleton from "components/Loading/ContentSkeleton";
import Remirror from "components/Remirror";

import { Channel, Thread, Member, ISubComment } from "types";
import { useAppSelector } from "hooks/useAppSelector";
import {
  addComment,
  deleteComment,
  updateComment,
  addInteractedUser,
  updateThread,
  deleteThread,
} from "features/threads";

import { fetchComments, fetchThreads } from "features/threads/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";
import { kontenbase } from "lib/client";
import { useToast } from "hooks/useToast";
import { updateUser } from "features/auth";
import NameInitial from "components/Avatar/NameInitial";
import { getNameInitial, parseContent } from "utils/helper";
import { KontenbaseResponse, KontenbaseSingleResponse } from "@kontenbase/sdk";
import ThreadBadge from "components/Thread/ThreadBadge";

import { extensions } from "components/Remirror/extensions";
import { htmlToProsemirrorNode } from "remirror";
import CommentMenu from "components/Thread/CommentMenu";
import { setCommentMenu } from "features/mobileMenu/slice";
import { useMediaQuery } from "react-responsive";
import { updateChannel, updateChannelCount } from "features/channels/slice";
import ThreadMenu from "components/Thread/Menu";
import Modal from "components/Modal/Modal";
import { SelectedThreadTypes } from "components/ContentItem/ContentItem";
import CloseThreadForm from "components/Thread/CloseThreadForm";
import moment from "moment-timezone";
import ContentSkeleton from "components/Loading/ContentSkeleton";

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function ThreadPage() {
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });

  const navigate = useNavigate();

  const [showToast] = useToast();
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const query = useQuery();
  const { threadId, workspaceId, channelId } = useParams();

  const thread = useAppSelector((state) => state.thread);
  const channel = useAppSelector((state) => state.channel);
  const member = useAppSelector((state) => state.member);
  const mobileMenu = useAppSelector((state) => state.mobileMenu);

  const listRef = useRef<HTMLDivElement>(null);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [isShowEditor, setIsShowEditor] = useState<boolean>(false);
  const [showTitle, setShowTitle] = useState<boolean>(false);

  const [selectedThread, setSelectedThread] = useState<{
    thread: Thread;
    type: SelectedThreadTypes;
  }>();

  const channelData: Channel = useMemo(() => {
    return channel.channels.find((data) => data._id === channelId);
  }, [channelId, channel.channels]);

  const threadData: Thread = useMemo(() => {
    return thread.threads.find((data) => data._id === threadId);
  }, [thread.threads, threadId]);

  const {
    manager,
    state,
    onChange,
    setState: setThreadState,
  } = useRemirror({
    extensions: () => extensions(true),
    stringHandler: htmlToProsemirrorNode,
    content: parseContent(threadData?.content),
  });

  const threadDeleteHandler = async () => {
    try {
      if (!selectedThread?.thread.draft) {
        navigate(`/a/${workspaceId}/ch/${channelId}`);
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
        let _subComments;
        if (event === "CREATE_RECORD" || event === "UPDATE_RECORD") {
          try {
            console.log("e");
            const { data, error } = await kontenbase.service("Users").find({
              where: {
                id:
                  event === "UPDATE_RECORD"
                    ? payload.before.createdBy
                    : payload.createdBy,
              },
            });

            if (error) throw new Error(error.message);

            _createdBy = data?.[0];
          } catch (error) {
            if (error instanceof Error) {
              showToast({ message: `${JSON.stringify(error?.message)}` });
            }
          }

          if (
            event === "UPDATE_RECORD" &&
            payload.after.subComments.length > 0
          ) {
            try {
              const { data, error }: KontenbaseResponse<ISubComment> =
                await kontenbase.service("SubComments").find({
                  where: {
                    parent: payload.after._id,
                  },
                });

              if (error) throw new Error(error.message);

              _subComments = data.map((item) => ({
                ...item,
                createdBy: item.createdBy._id,
              }));
            } catch (error) {
              if (error instanceof Error) {
                showToast({ message: `${JSON.stringify(error?.message)}` });
              }
            }
          }
        }

        if (isCurrentThread) {
          switch (event) {
            case "CREATE_RECORD":
              if (payload?.createdBy !== auth.user._id) {
                dispatch(
                  addComment({
                    threadId,
                    comment: { ...payload, createdBy: _createdBy },
                  })
                );
              }

              break;
            case "UPDATE_RECORD":
              dispatch(
                updateComment({
                  threadId,
                  comment: {
                    ...payload.before,
                    ...payload.after,
                    createdBy: _createdBy,
                    subComments: _subComments,
                  },
                })
              );
              break;
            default:
              break;
          }
        }

        if (event === "DELETE_RECORD") {
          dispatch(
            deleteComment({
              threadId,
              deletedId: payload._id,
            })
          );
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

  const reopenThreadHandler = async () => {
    try {
      const { error } = await kontenbase
        .service("Threads")
        .updateById(threadData._id, { isClosed: false });
      if (error) throw new Error(error?.message);

      dispatch(updateThread({ ...threadData, isClosed: false }));
    } catch (error: any) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error?.message)}` });
    }
  };

  const joinChannelHandler = async () => {
    try {
      const joinChannel = await kontenbase
        .service("Channels")
        .link(channelId, { members: auth.user._id });

      dispatch(updateChannel({ _id: channelId, ...joinChannel.data }));
    } catch (error) {
      console.log("err", error);
      showToast({ message: `${JSON.stringify(error)}` });
    }
  };

  useEffect(() => {
    if (!threadData) return;
    dispatch(fetchComments({ threadId: threadId, skip: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, threadId, !!threadData]);

  const loadMoreComment = () => {
    dispatch(
      fetchComments({ threadId: threadId, skip: threadData.comments.length })
    );
  };

  useEffect(() => {
    updateReadedThreads(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 1000);
  };

  useEffect(() => {
    const setInteractedUser = async () => {
      try {
        const { data, error }: KontenbaseSingleResponse<Thread> =
          await kontenbase.service("Threads").getById(threadId);

        if (error) throw new Error(error.message);

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
        if (error instanceof Error) {
          showToast({ message: `${JSON.stringify(error?.message)}` });
        }
      }
    };

    setInteractedUser(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const getMemberHandler = async () => {
  //   try {
  //     const memberList = await kontenbase.service("Users").find({
  //       where: { workspaces: workspaceId, channels: channelId },
  //       lookup: ["avatar"],
  //     });

  //     if (memberList.error) throw new Error(memberList.error.message);

  //     if (memberList.data) {
  //       setMemberList(memberList.data);
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       showToast({ message: `${JSON.stringify(error?.message)}` });
  //     }
  //   }
  // };

  useEffect(() => {
    // getMemberHandler();
    setMemberList(member.members);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.members]);

  // useEffect(() => {
  //   dispatch(fetchChannels({ userId: auth.user._id, workspaceId }));
  // }, [workspaceId]);

  useEffect(() => {
    return () => {
      dispatch(setCommentMenu({ data: null, type: "close" }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!threadData && channelId && auth.user._id) {
      dispatch(
        fetchThreads({
          type: "threads",
          channelId: channelId,
          userId: auth.user._id,
        })
      );
    }
    if (threadData) {
      setThreadState(
        manager.createState({
          stringHandler: htmlToProsemirrorNode,
          content: parseContent(threadData?.content),
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, threadData, auth.user._id]);

  const isMember = useMemo(() => {
    return (
      channelData?.members?.includes(auth.user._id) &&
      (!channelData?.privacy || channelData?.privacy === "public")
    );
  }, [channelData, auth.user._id]);

  if (!threadData)
    return (
      <div className="w-full max-w-4xl mx-auto h-full mt-32">
        <ContentSkeleton count={10} />
      </div>
    );

  return (
    <MainContentContainer
      header={
        <MainContentHeader
          channel={channelData?.name}
          title={threadData?.name}
          thread
          from={query.get("fromInbox") === "1" && "inbox"}
          showTitle={isMobile ? true : showTitle}
          leftContent={
            <div>
              <ThreadMenu
                dataSource={threadData}
                setSelectedThread={setSelectedThread}
                onReopen={() => {
                  setIsShowEditor(true);
                }}
                fromHeader
              />
            </div>
          }
        />
      }
      onScroll={(e: any) => {
        if (e?.target?.scrollTop >= 120) {
          setShowTitle(true);
        } else {
          setShowTitle(false);
        }
      }}
    >
      <div className="px-4 max-w-4xl ml-auto mr-auto -mt-16 md:-mt-4 md:-mb-16">
        <div className="relative flex flex-col min-h-0">
          <div className="flex-grow overflow-auto min-h-0">
            <div className="mb-8">
              <h1 className="font-medium md:font-semibold  text-2xl md:text-3xl max-w-3xl break-words">
                {threadData?.name}
              </h1>
              <p className="text-neutral-500 text-sm font-body">
                {channelData?.members?.length} Participants{" "}
                <Link
                  to={`/a/${workspaceId}/ch/${channelId}`}
                  className="text-blue-500"
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
                  />
                )}
              </div>

              <div className="flex-grow text-sm">
                <div className="-mt-1.5 flex items-center justify-start">
                  <p className=" font-semibold mb-0 mt-0 mr-2">
                    {threadData?.createdBy?.firstName}
                  </p>{" "}
                  <p className="mb-0 mt-0 text-xs">
                    <ReactMoment format="DD/MM/YYYY LT">
                      {threadData?.updatedAt || threadData?.createdAt}
                    </ReactMoment>
                  </p>
                </div>
                {threadData?.content && (
                  <Remirror
                    remmirorProps={{
                      manager,
                      state,
                      onChange,
                    }}
                    readOnly
                  />
                )}
              </div>
            </div>
            <div className="border-t-[1px] border-gray-200 mb-8 mt-8" />
            {thread?.commentCount - threadData?.comments?.length > 0 && (
              <p
                className="text-sm mb-8 -mt-4 hover:opacity-80 hover:cursor-pointer"
                onClick={loadMoreComment}
              >
                Show {thread?.commentCount - threadData?.comments?.length} More
                Comments
              </p>
            )}

            <div
              className={`${!isShowEditor ? "mb-14" : "mb-36"} min-h-[50vh]`}
            >
              {thread.commentLoading ? (
                <LoadingSkeleton />
              ) : (
                <CommentList
                  dataSource={threadData?.comments || []}
                  listRef={listRef}
                  memberList={memberList}
                  threadId={threadId}
                  threadName={threadData?.name}
                  threadData={threadData}
                />
              )}
            </div>
          </div>
          {(!threadData?.isClosed || (threadData?.isClosed && isShowEditor)) &&
            (isMember || (!isMember && isShowEditor)) && (
              <CommentForm
                isShowEditor={isShowEditor}
                setIsShowEditor={setIsShowEditor}
                threadId={threadId}
                threadName={threadData?.name}
                interactedUsers={[...new Set(threadData?.interactedUsers)]}
                scrollToBottom={scrollToBottom}
                memberList={memberList}
                threadData={threadData}
                reopenThreadHandler={reopenThreadHandler}
              />
            )}

          {!threadData?.isClosed && (
            <CommentMenu
              openMenu={mobileMenu?.comment?.type === "open"}
              onClose={() => {
                dispatch(setCommentMenu({ data: null, type: "close" }));
              }}
            />
          )}
          {threadData?.isClosed && !isShowEditor && (
            <ThreadBadge.Reopen
              onReopen={() => {
                setIsShowEditor(true);
              }}
            />
          )}
          {!isMember && !isShowEditor && (
            <ThreadBadge.JoinChannel
              onJoin={() => {
                joinChannelHandler();
              }}
              channelData={channelData}
            />
          )}
        </div>
      </div>
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
    </MainContentContainer>
  );
}

export default ThreadPage;
