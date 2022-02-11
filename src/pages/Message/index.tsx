import Chat from "components/DirectMessage/Chat";
import MessageHeader from "components/DirectMessage/Header";
import { useAppSelector } from "hooks/useAppSelector";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Member } from "types";

type Props = {};

const MessagePage = ({}: Props) => {
  const params = useParams();

  const auth = useAppSelector((state) => state.auth);
  const member = useAppSelector((state) => state.member);

  const memberData: Member = useMemo(() => {
    return member.members?.find((item) => item._id === params?.userId);
  }, [member.members, params?.userId]);

  if (!memberData) return <></>;

  return (
    <div className="w-full h-screen flex flex-col min-h-0">
      <MessageHeader data={memberData} />

      <div className="flex-grow overflow-auto min-h-0">
        <ul className="flex flex-col py-2 px-5">
          <Chat />
          <Chat />
          <Chat isOwn />
          <Chat />
          <Chat />
          <Chat isOwn />
          <Chat />
          <Chat />
          <Chat isOwn />
          <Chat isOwn />
          <Chat />
          <Chat />
          <Chat isOwn />
          <Chat />
          <Chat />
          <Chat isOwn />
          <Chat />
          <Chat />
          <Chat isOwn />
          <Chat isOwn />
        </ul>
      </div>

      <div className="sticky top-0 bg-white px-5 pb-2">
        <button className="w-full p-3 px-5 flex items-start rounded-full outline-indigo-100 bg-slate-100 hover:bg-slate-200">
          <p className="text-sm text-slate-700">Write a message...</p>
        </button>
      </div>
    </div>
  );
};

export default MessagePage;
