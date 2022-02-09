import React from "react";

import { BiMessageAltCheck } from "react-icons/bi";

import Button from "components/Button/Button";
import { Channel } from "types";
import { BsEye } from "react-icons/bs";

type TReopenProps = {
  onReopen?: () => void;
};

type TJoinChannelProps = {
  onJoin?: () => void;
  channelData?: Channel;
};

function Reopen({ onReopen }: TReopenProps) {
  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 p-3 bg-slate-800 rounded-md flex items-center justify-between z-30">
      <div className="flex items-center mr-5">
        <BiMessageAltCheck className="text-white mr-2" size={18} />
        <p className="text-sm text-white max-w-sm whitespace-nowrap overflow-hidden text-ellipsis mr-1">
          This thread is closed
        </p>
      </div>

      <Button
        className="text-xs md:text-sm text-white bg-indigo-500"
        onClick={onReopen}
      >
        Reopen thread
      </Button>
    </div>
  );
}

function JoinChannel({ onJoin, channelData }: TJoinChannelProps) {
  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 p-3 bg-slate-800 rounded-md flex items-center justify-between z-30">
      <div className="flex items-center mr-5">
        <BsEye className="text-white mr-2" size={18} />
        <p className="text-sm font-semibold text-white max-w-sm whitespace-nowrap overflow-hidden text-ellipsis mr-1">
          You're previewing #{channelData?.name}
        </p>
      </div>

      <Button
        className="text-xs md:text-sm text-white bg-indigo-500"
        onClick={onJoin}
      >
        Join to reply
      </Button>
    </div>
  );
}
const ThreadBadge = () => {
  return <></>;
};

ThreadBadge.Reopen = Reopen;
ThreadBadge.JoinChannel = JoinChannel;

export default ThreadBadge;
