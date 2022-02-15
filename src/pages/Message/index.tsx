import React, { useEffect, useMemo, useRef, useState } from "react";

import { useParams } from "react-router-dom";

import Chat from "components/DirectMessage/Chat";
import MessageForm from "components/DirectMessage/Form";
import MessageHeader from "components/DirectMessage/Header";

import { fetchMessages } from "features/messages/slice/asyncThunk";

import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import { Member, Message } from "types";
import { useMediaQuery } from "react-responsive";
import MessageMenu from "components/DirectMessage/MobileMenu";
import { setMessageMenu } from "features/mobileMenu";
import ChatEmptyImage from "assets/image/chat_empty.svg";
import ContentSkeleton from "components/Loading/ContentSkeleton";
import useIntersection from "hooks/useIntersection";
import { useDebounce } from "use-debounce";

type Props = {};

export type SelectedMessage = {
  message: Message | null | undefined;
  type: "edit";
};

const MessagePage = (props: Props) => {
  const scrollRef = useRef<HTMLDivElement>();
  const isMobile = useMediaQuery({
    query: "(max-width: 600px)",
  });

  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);
  const message = useAppSelector((state) => state.message);
  const mobileMenu = useAppSelector((state) => state.mobileMenu);

  const dispatch = useAppDispatch();

  const [isShowEditor, setIsShowEditor] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<SelectedMessage>();
  const [firstFetch, setFirstFetch] = useState<boolean>(false);

  const memberData: Member = useMemo(() => {
    return member.members?.find((item) => item._id === params?.userId);
  }, [member.members, params?.userId]);

  const memberMessage: { data: Message[]; total: number } = useMemo(() => {
    if (!message?.messages?.[params.userId]) return { data: [], total: 0 };
    return message?.messages?.[params.userId];
  }, [message.messages, params.userId]);

  const messageData: Message[] = useMemo(() => {
    if (!memberMessage?.data) return [];
    return memberMessage?.data;
  }, [memberMessage?.data]);

  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  };

  const [observerRef, isFetchData] = useIntersection(observerOptions);
  const [debounceIsFetchData] = useDebounce(isFetchData, 1000);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView({ behavior: "auto" });
    }, 100);
  };

  useEffect(() => {
    if (!messageData) return;
    if (messageData?.length > 0 && memberMessage?.total > 0) return;
    if (firstFetch) return;

    dispatch(
      fetchMessages({
        loggedUserId: auth.user._id,
        toUserId: params.userId,
        workspaceId: params.workspaceId,
        skip: 0,
      })
    );
    setFirstFetch(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.userId,
    params.workspaceId,
    auth.user._id,
    messageData,
    firstFetch,
  ]);

  useEffect(() => {
    setFirstFetch(false);
  }, [params.userId, params.workspaceId]);

  useEffect(() => {
    if (!messageData) return;
    if (messageData?.length === 0) return;
    if (!debounceIsFetchData) return;
    if (messageData?.length >= memberMessage?.total) return;
    if (message.partialLoading) return;

    setTimeout(() => {
      dispatch(
        fetchMessages({
          loggedUserId: auth.user._id,
          toUserId: params.userId,
          workspaceId: params.workspaceId,
          skip: messageData?.length,
          limit: 5,
        })
      );
    }, 1000);
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debounceIsFetchData,
    params.userId,
    params.workspaceId,
    auth.user._id,
    messageData,
    message.partialLoading,
  ]);

  const loading = messageData?.length === 0 && message.loading;

  return (
    <div className="w-full h-screen flex flex-col min-h-0">
      <MessageHeader data={memberData} />

      <div className="flex-grow overflow-auto min-h-0">
        {!message.partialLoading && (
          <div ref={observerRef} className="observer"></div>
        )}
        {loading && <ContentSkeleton count={10} />}
        {!loading && (
          <>
            {messageData?.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <img
                    src={ChatEmptyImage}
                    alt="chat empty"
                    className="h-64 w-6h-64 object-cover"
                  />
                  <p className="text-sm text-slate-700 font-semibold">
                    This conversation is just between the two of you
                  </p>
                  <p className="text-sm text-slate-700 max-w-xs mt-2">
                    Here you can send messages and share files with{" "}
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-500 font-semibold rounded leading-9">
                      @{memberData?.firstName}
                    </span>
                  </p>
                </div>
              </div>
            )}
            {messageData?.length > 0 && (
              <div>
                {message.partialLoading && (
                  <div className="mt-2">
                    <p className="font-semibold text-sm text-center text-indigo-300">
                      Loading...
                    </p>
                  </div>
                )}
                <ul className="flex flex-col py-2 px-5">
                  {messageData?.map((message, idx) => (
                    <Chat
                      key={`${message?._tempId || message?._id}${idx}`}
                      index={idx}
                      data={message}
                      isOwn={message._createdById === auth.user._id}
                      setSelectedMessage={setSelectedMessage}
                      selectedMessage={selectedMessage}
                      scrollRef={scrollRef}
                    />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <div className="sticky top-0 bg-white px-5 py-2">
        <MessageForm
          isShowEditor={isShowEditor}
          setIsShowEditor={setIsShowEditor}
          setSelectedMessage={setSelectedMessage}
          selectedMessage={selectedMessage}
        />
      </div>
      {isMobile && (
        <MessageMenu
          openMenu={mobileMenu?.message?.type === "open"}
          onClose={() => {
            dispatch(setMessageMenu({ data: null, type: "close" }));
          }}
        />
      )}
    </div>
  );
};

export default MessagePage;
