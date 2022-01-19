import React, { Dispatch, SetStateAction } from "react";
import { FaPlus } from "react-icons/fa";

import IconButton from "./IconButton";

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  onOptionClick?: () => void;
}>;

function ChannelButton({
  onClick = () => {},
  onOptionClick = () => {},
}: Props) {
  return (
    <div className="w-full rounded h-9 hover:bg-neutral-100 flex items-center justify-between group">
      <button className="pl-3 h-full w-full text-left" onClick={onClick}>
        <p className="font-bold text-xs text-neutral-500">Channels</p>
      </button>

      <IconButton
        className="hidden group-hover:flex"
        size="medium"
        onClick={onOptionClick}
      >
        <FaPlus size={10} className="text-neutral-500" />
      </IconButton>
    </div>
  );
}

export default ChannelButton;
