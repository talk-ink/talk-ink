import Chat from "components/DirectMessage/Chat";
import MessageForm from "components/DirectMessage/Form";
import MessageHeader from "components/DirectMessage/Header";
import { fetchMessages } from "features/messages/slice/asyncThunk";
import { useAppDispatch } from "hooks/useAppDispatch";
import { useAppSelector } from "hooks/useAppSelector";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Member, Message } from "types";

type Props = {};

const MessagePage = ({}: Props) => {
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);
  const message = useAppSelector((state) => state.message);

  const dispatch = useAppDispatch();

  const [isShowEditor, setIsShowEditor] = useState<boolean>(false);

  const memberData: Member = useMemo(() => {
    return member.members?.find((item) => item._id === params?.userId);
  }, [member.members, params?.userId]);

  const messageData: Message[] = useMemo(() => {
    return message?.messages?.[params.userId];
  }, [message.messages, params.userId]);

  useEffect(() => {
    dispatch(
      fetchMessages({ loggedUserId: auth.user._id, toUserId: params.userId })
    );
  }, [params.userId]);

  //   if (!memberData) return <></>;

  return (
    <div className="w-full h-screen flex flex-col min-h-0">
      <MessageHeader data={memberData} />

      <div className="flex-grow overflow-auto min-h-0">
        <ul className="flex flex-col py-2 px-5">
          {messageData?.map((message, idx) => (
            <Chat
              data={message}
              key={message?._tempId || message?._id}
              isOwn={message._createdById === auth.user._id}
            />
          ))}
        </ul>
      </div>

      <div className="sticky top-0 bg-white px-5 py-2">
        <MessageForm
          isShowEditor={isShowEditor}
          setIsShowEditor={setIsShowEditor}
        />
      </div>
    </div>
  );
};

export default MessagePage;
