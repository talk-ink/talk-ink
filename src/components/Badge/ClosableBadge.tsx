import React from "react";

import { VscClose } from "react-icons/vsc";

type TProps = {
  text: string;
  onClose?: () => void;
};

function ClosableBadge({ text, onClose }: TProps) {
  return (
    <div className=" h-6 bg-neutral-200 rounded-full flex items-center justify-between">
      <p className="text-sm px-2">{text}</p>
      <button
        className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-neutral-400"
        onClick={onClose}
      >
        <VscClose size={16} />
      </button>
    </div>
  );
}

export default ClosableBadge;
