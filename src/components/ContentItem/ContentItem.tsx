import React from "react";

import { BiDotsHorizontalRounded } from "react-icons/bi";

import IconButton from "components/Button/IconButton";
import { Thread } from "types";

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  dataSource: Thread | null | undefined;
}>;

function InboxMessage({ onClick = () => {}, dataSource }: Props) {
  return (
    <div
      className="
    cursor-pointer
    hover:before:bg-transparent
    hover:after:bg-transparent
    before:block
    before:w-full
    before:h-[1px]
    before:bg-neutral-200
    last:after:block
    last:after:w-full
    last:after:h-[1px]
    last:after:bg-neutral-200
    "
    >
      <div className="flex items-center justify-between px-3 hover:bg-cyan-50 py-5 rounded-xl border-l-2 border-transparent hover:border-cyan-800 overflow-hidden group">
        <button className="flex items-center" onClick={onClick}>
          <div className="h-8 w-8 rounded-full overflow-hidden mr-4">
            <img
              src="https://picsum.photos/100"
              className="h-full w-full"
              alt="img"
            />
          </div>
          <div>
            <div className="flex items-center">
              <p className="font-body text-sm mr-2">{dataSource.name}</p>
              <span className="text-xs text-neutral-500">4h</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap text-ellipsis max-w-3xl text-xs text-neutral-500 pr-2">
              <small className="text-xs text-neutral-500">
                {dataSource.content}
              </small>
            </div>
          </div>
        </button>
        <div className="opacity-0 group-hover:opacity-100">
          <IconButton
            onClick={() => {
              console.log("b");
            }}
          >
            <BiDotsHorizontalRounded size={24} className="text-neutral-400" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default InboxMessage;
