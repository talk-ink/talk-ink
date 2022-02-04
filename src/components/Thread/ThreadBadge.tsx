import React from "react";

import { BiMessageAltCheck } from "react-icons/bi";

import Button from "components/Button/Button";

type TProps = {
  onReopen?: () => void;
};

function Reopen({ onReopen }: TProps) {
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

const ThreadBadge = () => {
  return <></>;
};

ThreadBadge.Reopen = Reopen;

export default ThreadBadge;
